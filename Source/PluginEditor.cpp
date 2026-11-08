#include "PluginEditor.h"
#include "MidiExport.h"
#include "BinaryData.h"

namespace
{
    const juce::Identifier eventId { "opengroove" };

    juce::WebBrowserComponent::Options makeOptions()
    {
        return juce::WebBrowserComponent::Options {}
            .withBackend (juce::WebBrowserComponent::Options::Backend::webview2)
            .withWinWebView2Options (juce::WebBrowserComponent::Options::WinWebView2 {}
                                         .withUserDataFolder (juce::File::getSpecialLocation (juce::File::userApplicationDataDirectory)
                                                                  .getChildFile ("OpenGroove")
                                                                  .getChildFile ("WebView"))
                                         .withBackgroundColour (juce::Colour (0xff141518)))
            .withNativeIntegrationEnabled()
            .withKeepPageLoadedWhenBrowserIsHidden();
    }
}

OpenGrooveEditor::OpenGrooveEditor (OpenGrooveProcessor& p)
    : AudioProcessorEditor (p),
      processor (p),
      browser (makeOptions()
                   .withEventListener (eventId, [this] (const juce::var& message) { handleMessage (message); })
                   .withResourceProvider ([this] (const juce::String& url) { return getResource (url); }))
{
    addAndMakeVisible (browser);
    browser.goToURL (juce::WebBrowserComponent::getResourceProviderRoot());

    setResizable (true, true);
    setResizeLimits (1000, 640, 1800, 1000);
    setSize (1120, 740);

    startTimerHz (30);
}

OpenGrooveEditor::~OpenGrooveEditor()
{
    stopTimer();
}

void OpenGrooveEditor::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colour (0xff141518));
}

void OpenGrooveEditor::resized()
{
    browser.setBounds (getLocalBounds());
}

std::optional<juce::WebBrowserComponent::Resource> OpenGrooveEditor::getResource (const juce::String& url)
{
    const auto path = url.fromFirstOccurrenceOf ("/", false, false).upToFirstOccurrenceOf ("?", false, false);

    if (path.isEmpty() || path == "index.html")
    {
        const auto* data = reinterpret_cast<const std::byte*> (BinaryData::opengroove_ui_html);
        return juce::WebBrowserComponent::Resource { std::vector<std::byte> (data, data + BinaryData::opengroove_ui_htmlSize),
                                                     "text/html" };
    }

    return std::nullopt;
}

void OpenGrooveEditor::send (std::initializer_list<juce::var> items)
{
    juce::Array<juce::var> message;

    for (const auto& item : items)
        message.add (item);

    browser.emitEventIfBrowserIsVisible (eventId, juce::var (message));
}

void OpenGrooveEditor::timerCallback()
{
    const int playing = processor.hostPlaying.load() ? 1 : 0;

    if (playing != lastPlaying)
    {
        lastPlaying = playing;
        send ({ "transport", playing });
    }

    const double bpm = processor.hostBpm.load();

    if (std::abs (bpm - lastBpm) > 0.01)
    {
        lastBpm = bpm;
        send ({ "tempo", bpm });
    }

    const int step = processor.currentStep.load();

    if (step != lastStep)
    {
        lastStep = step;

        if (step >= 0)
            send ({ "step", step });
    }
}

juce::File OpenGrooveEditor::writeTempMidi (const juce::String& patternText, const juce::String& clipName)
{
    const auto dir = juce::File::getSpecialLocation (juce::File::tempDirectory).getChildFile ("Open Groove");
    dir.createDirectory();

    const auto file = dir.getChildFile (MidiExport::safeFileName (clipName) + ".mid");

    if (MidiExport::writeMidiFile (Pattern::parse (patternText), clipName, file))
        return file;

    return {};
}

void OpenGrooveEditor::handleMessage (const juce::var& message)
{
    const auto* args = message.getArray();

    if (args == nullptr || args->isEmpty())
        return;

    const auto cmd = (*args)[0].toString();
    const auto arg = [args] (int i) { return i < args->size() ? (*args)[i] : juce::var(); };

    if (cmd == "pattern")
    {
        processor.setPatternText (arg (1).toString());
    }
    else if (cmd == "live")
    {
        processor.setListening ((int) arg (1) != 0);
    }
    else if (cmd == "audition")
    {
        processor.audition ((int) arg (1), (int) arg (2));
    }
    else if (cmd == "state")
    {
        processor.setUiState (arg (1).toString());
    }
    else if (cmd == "ready")
    {
        const auto ui = processor.getUiState();

        if (ui.isNotEmpty())
            send ({ "restore", ui });

        lastBpm = -1.0;
        lastPlaying = -1;
        lastStep = -2;
    }
    else if (cmd == "dragmidi")
    {
        const auto file = writeTempMidi (arg (1).toString(), arg (2).toString());

        if (file == juce::File())
        {
            send ({ "status", "err", "Impossible de préparer le fichier MIDI." });
            return;
        }

        juce::DragAndDropContainer::performExternalDragDropOfFiles ({ file.getFullPathName() }, false, this,
                                                                   [safe = juce::Component::SafePointer<OpenGrooveEditor> (this)]
                                                                   {
                                                                       if (safe != nullptr)
                                                                           safe->send ({ "dragdone" });
                                                                   });
    }
    else if (cmd == "export")
    {
        const auto dir = juce::File::getSpecialLocation (juce::File::userDocumentsDirectory).getChildFile ("Open Groove MIDI");
        dir.createDirectory();

        auto file = dir.getNonexistentChildFile (MidiExport::safeFileName (arg (2).toString()), ".mid", true);

        if (MidiExport::writeMidiFile (Pattern::parse (arg (1).toString()), arg (2).toString(), file))
        {
            file.revealToUser();
            send ({ "status", "ok", "Exporté : " + file.getFileName() });
        }
        else
        {
            send ({ "status", "err", "Export impossible dans " + dir.getFullPathName() });
        }
    }
}
