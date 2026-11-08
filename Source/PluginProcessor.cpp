#include "PluginProcessor.h"
#include "PluginEditor.h"

OpenGrooveProcessor::OpenGrooveProcessor()
    : AudioProcessor (BusesProperties().withOutput ("Output", juce::AudioChannelSet::stereo(), true))
{
    pendingOffs.reserve (256);
}

bool OpenGrooveProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    const auto out = layouts.getMainOutputChannelSet();
    return out == juce::AudioChannelSet::stereo() || out == juce::AudioChannelSet::mono();
}

void OpenGrooveProcessor::prepareToPlay (double newSampleRate, int)
{
    sampleRate = newSampleRate > 0 ? newSampleRate : 44100.0;
    pendingOffs.clear();
}

void OpenGrooveProcessor::flushNoteOffs (juce::MidiBuffer& out, int position)
{
    for (const auto& off : pendingOffs)
        out.addEvent (juce::MidiMessage::noteOff (1, off.pitch), position);

    pendingOffs.clear();
}

void OpenGrooveProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midi)
{
    juce::ScopedNoDenormals noDenormals;
    buffer.clear();

    const int numSamples = buffer.getNumSamples();
    const int noteLength = juce::jmax (1, (int) (sampleRate * 0.03)); // 30 ms : suffisant pour un one-shot

    // Récupère un nouveau pattern s'il y en a un, sans jamais attendre
    {
        const juce::SpinLock::ScopedTryLockType lock (patternLock);

        if (lock.isLocked() && pendingPattern != nullptr)
            audioPattern = std::move (pendingPattern);
    }

    juce::MidiBuffer out;

    // Le MIDI entrant passe tel quel (jouer des pads à la main reste possible)
    for (const auto meta : midi)
        out.addEvent (meta.getMessage(), meta.samplePosition);

    // Sons demandés par l'interface
    {
        const auto scope = auditionFifo.read (auditionFifo.getNumReady());

        for (int i = 0; i < scope.blockSize1; ++i)
        {
            const auto [p, v] = auditionData[(size_t) (scope.startIndex1 + i)];
            out.addEvent (juce::MidiMessage::noteOn (1, p, (juce::uint8) v), 0);
            pendingOffs.push_back ({ p, noteLength });
        }

        for (int i = 0; i < scope.blockSize2; ++i)
        {
            const auto [p, v] = auditionData[(size_t) (scope.startIndex2 + i)];
            out.addEvent (juce::MidiMessage::noteOn (1, p, (juce::uint8) v), 0);
            pendingOffs.push_back ({ p, noteLength });
        }
    }

    // Position de l'hôte
    bool playing = false;
    double ppq = 0.0, bpm = 120.0;

    if (auto* playHead = getPlayHead())
    {
        if (const auto pos = playHead->getPosition())
        {
            playing = pos->getIsPlaying();

            if (const auto b = pos->getBpm())
                bpm = *b;

            if (const auto p = pos->getPpqPosition())
                ppq = *p;
        }
    }

    hostBpm.store (bpm);
    hostPlaying.store (playing);

    if (! playing && wasPlaying)
    {
        flushNoteOffs (out, 0);
        currentStep.store (-1);
    }

    wasPlaying = playing;

    if (playing && audioPattern != nullptr && audioPattern->steps > 0 && bpm > 0.0)
    {
        const auto& pat = *audioPattern;
        const double ppqPerSample = bpm / 60.0 / sampleRate;
        const double ppqEnd = ppq + numSamples * ppqPerSample;
        const double swingOffset = pat.swingOffsetBeats();

        const auto first = (juce::int64) std::floor (ppq * 4.0) - 1;
        const auto last  = (juce::int64) std::ceil (ppqEnd * 4.0);

        for (auto s = juce::jmax ((juce::int64) 0, first); s <= last; ++s)
        {
            const double t = (double) s * 0.25 + ((s % 2) == 1 ? swingOffset : 0.0);

            if (t < ppq || t >= ppqEnd)
                continue;

            const int offset = juce::jlimit (0, numSamples - 1, (int) ((t - ppq) / ppqPerSample));
            const int step = (int) (s % pat.steps);
            currentStep.store (step);

            if (! listening.load())
                continue;

            for (const auto& row : pat.rows)
            {
                const int v = row.velocities[(size_t) step];

                if (v > 0)
                {
                    out.addEvent (juce::MidiMessage::noteOn (1, row.pitch, (juce::uint8) v), offset);
                    pendingOffs.push_back ({ row.pitch, offset + noteLength });
                }
            }
        }
    }

    // Note-off programmés : ceux qui tombent dans ce bloc partent, les autres attendent
    for (auto it = pendingOffs.begin(); it != pendingOffs.end();)
    {
        if (it->samplesLeft < numSamples)
        {
            out.addEvent (juce::MidiMessage::noteOff (1, it->pitch), juce::jmax (0, it->samplesLeft));
            it = pendingOffs.erase (it);
        }
        else
        {
            it->samplesLeft -= numSamples;
            ++it;
        }
    }

    midi.swapWith (out);
}

void OpenGrooveProcessor::setPatternText (const juce::String& text)
{
    auto parsed = std::make_shared<Pattern> (Pattern::parse (text));

    {
        const juce::ScopedLock sl (textLock);
        patternText = text;
    }

    const juce::SpinLock::ScopedLockType lock (patternLock);
    pendingPattern = std::move (parsed);
}

juce::String OpenGrooveProcessor::getPatternText() const
{
    const juce::ScopedLock sl (textLock);
    return patternText;
}

void OpenGrooveProcessor::setUiState (const juce::String& json)
{
    const juce::ScopedLock sl (textLock);
    uiState = json;
}

juce::String OpenGrooveProcessor::getUiState() const
{
    const juce::ScopedLock sl (textLock);
    return uiState;
}

void OpenGrooveProcessor::audition (int pitch, int velocity)
{
    const auto scope = auditionFifo.write (1);

    if (scope.blockSize1 > 0)
        auditionData[(size_t) scope.startIndex1] = { juce::jlimit (0, 127, pitch), juce::jlimit (1, 127, velocity) };
}

void OpenGrooveProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    juce::ValueTree state ("OpenGroove");
    state.setProperty ("version", 1, nullptr);
    state.setProperty ("pattern", getPatternText(), nullptr);
    state.setProperty ("ui", getUiState(), nullptr);
    state.setProperty ("listen", listening.load(), nullptr);

    juce::MemoryOutputStream stream (destData, false);
    state.writeToStream (stream);
}

void OpenGrooveProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    const auto state = juce::ValueTree::readFromData (data, (size_t) sizeInBytes);

    if (! state.hasType ("OpenGroove"))
        return;

    setUiState (state.getProperty ("ui").toString());
    listening.store ((bool) state.getProperty ("listen", true));

    const auto text = state.getProperty ("pattern").toString();

    if (text.isNotEmpty())
        setPatternText (text);
}

juce::AudioProcessorEditor* OpenGrooveProcessor::createEditor()
{
    return new OpenGrooveEditor (*this);
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new OpenGrooveProcessor();
}
