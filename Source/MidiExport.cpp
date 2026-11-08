#include "MidiExport.h"

namespace MidiExport
{
    juce::String safeFileName (const juce::String& name)
    {
        auto cleaned = name.replaceCharacters ("\\/:*?\"<>|", "---------").trim();
        return cleaned.isEmpty() ? juce::String ("Open Groove") : cleaned.substring (0, 80);
    }

    bool writeMidiFile (const Pattern& pattern, const juce::String& clipName, const juce::File& target)
    {
        if (pattern.steps <= 0)
            return false;

        constexpr int ticksPerBeat = 960;
        constexpr int ticksPerStep = ticksPerBeat / 4;
        constexpr int noteLength   = ticksPerStep / 2;

        const int swingTicks = pattern.swingInClip
                                   ? juce::roundToInt (pattern.swingOffsetBeats() * ticksPerBeat)
                                   : 0;

        juce::MidiMessageSequence seq;

        auto name = juce::MidiMessage::textMetaEvent (3, clipName);
        name.setTimeStamp (0);
        seq.addEvent (name);

        for (const auto& row : pattern.rows)
        {
            for (int s = 0; s < pattern.steps && s < (int) row.velocities.size(); ++s)
            {
                const int v = row.velocities[(size_t) s];

                if (v <= 0)
                    continue;

                const int start = s * ticksPerStep + ((s % 2) == 1 ? swingTicks : 0);

                auto on = juce::MidiMessage::noteOn (1, row.pitch, (juce::uint8) v);
                on.setTimeStamp (start);
                auto off = juce::MidiMessage::noteOff (1, row.pitch);
                off.setTimeStamp (start + noteLength);

                seq.addEvent (on);
                seq.addEvent (off);
            }
        }

        auto end = juce::MidiMessage::endOfTrack();
        end.setTimeStamp (pattern.steps * ticksPerStep);
        seq.addEvent (end);
        seq.updateMatchedPairs();

        juce::MidiFile file;
        file.setTicksPerQuarterNote (ticksPerBeat);
        file.addTrack (seq);

        target.deleteFile();
        juce::FileOutputStream out (target);

        if (! out.openedOk())
            return false;

        return file.writeTo (out, 1);
    }
}
