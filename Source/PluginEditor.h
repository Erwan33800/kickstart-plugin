#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

// Fenêtre du plugin : l'interface Open Groove (HTML/JS) dans une WebView, reliée au processeur.
class OpenGrooveEditor final : public juce::AudioProcessorEditor,
                              private juce::Timer
{
public:
    explicit OpenGrooveEditor (OpenGrooveProcessor&);
    ~OpenGrooveEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;

private:
    void timerCallback() override;
    void handleMessage (const juce::var& message);
    void send (std::initializer_list<juce::var> items);
    juce::File writeTempMidi (const juce::String& patternText, const juce::String& clipName);
    std::optional<juce::WebBrowserComponent::Resource> getResource (const juce::String& url);

    OpenGrooveProcessor& processor;
    juce::WebBrowserComponent browser;

    int lastStep = -2;
    double lastBpm = -1.0;
    int lastPlaying = -1;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (OpenGrooveEditor)
};
