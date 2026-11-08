#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include <array>
#include <atomic>
#include <memory>
#include <vector>
#include "Pattern.h"

// Open Groove : instrument sans son qui joue le pattern en MIDI, calé sur la position de l'hôte.
// Dans Live : piste MIDI « Open Groove », puis sur la piste drums « MIDI From » = cette piste.
class OpenGrooveProcessor final : public juce::AudioProcessor
{
public:
    OpenGrooveProcessor();
    ~OpenGrooveProcessor() override = default;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;
    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;
    using AudioProcessor::processBlock;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return "Open Groove"; }
    bool acceptsMidi() const override { return true; }
    bool producesMidi() const override { return true; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }

    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram (int) override {}
    const juce::String getProgramName (int) override { return {}; }
    void changeProgramName (int, const juce::String&) override {}

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

    // ----- appelés par l'interface (thread message) -----
    void setPatternText (const juce::String& text);
    juce::String getPatternText() const;
    void setUiState (const juce::String& json);
    juce::String getUiState() const;
    void setListening (bool shouldListen) { listening.store (shouldListen); }
    void audition (int pitch, int velocity);

    // ----- lus par l'interface -----
    std::atomic<int>    currentStep { -1 };
    std::atomic<double> hostBpm { 120.0 };
    std::atomic<bool>   hostPlaying { false };

private:
    struct PendingOff
    {
        int pitch;
        int samplesLeft;
    };

    void flushNoteOffs (juce::MidiBuffer& out, int position);

    // pattern : écrit par le thread message, récupéré par le thread audio sans blocage
    juce::SpinLock patternLock;
    std::shared_ptr<Pattern> pendingPattern;
    std::shared_ptr<Pattern> audioPattern;

    mutable juce::CriticalSection textLock;
    juce::String patternText, uiState;

    std::atomic<bool> listening { true };

    // notes jouées depuis l'interface (écoute d'un son)
    juce::AbstractFifo auditionFifo { 64 };
    std::array<std::pair<int, int>, 64> auditionData {};

    std::vector<PendingOff> pendingOffs;
    double sampleRate = 44100.0;
    bool wasPlaying = false;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (OpenGrooveProcessor)
};
