#pragma once

#include <juce_core/juce_core.h>
#include <vector>

// Pattern envoyé par l'interface : "pas_swing_swingClip/pitch.v.v.v/pitch.v.v..." (vélocités 0-127).
struct Pattern
{
    struct Row
    {
        int pitch = 36;
        std::vector<int> velocities;
    };

    int steps = 0;
    double swing = 50.0;      // 50 = droit, 75 = shuffle maximal
    bool swingInClip = true;  // écrire le swing dans le fichier MIDI exporté
    std::vector<Row> rows;

    // Décalage des doubles-croches impaires, en temps (une double-croche = 0.25 temps)
    double swingOffsetBeats() const { return (swing - 50.0) / 50.0 * 0.25; }

    static Pattern parse (const juce::String& text)
    {
        Pattern p;
        auto parts = juce::StringArray::fromTokens (text, "/", "");

        if (parts.isEmpty())
            return p;

        auto header = juce::StringArray::fromTokens (parts[0], "_", "");
        p.steps = juce::jlimit (0, 256, header[0].getIntValue());
        p.swing = juce::jlimit (50.0, 75.0, header.size() > 1 ? header[1].getDoubleValue() : 50.0);
        p.swingInClip = header.size() > 2 ? header[2] == "1" : true;

        for (int i = 1; i < parts.size(); ++i)
        {
            auto tokens = juce::StringArray::fromTokens (parts[i], ".", "");

            if (tokens.size() < 2)
                continue;

            Row row;
            row.pitch = juce::jlimit (0, 127, tokens[0].getIntValue());

            for (int j = 1; j < tokens.size(); ++j)
                row.velocities.push_back (juce::jlimit (0, 127, tokens[j].getIntValue()));

            row.velocities.resize ((size_t) p.steps, 0);
            p.rows.push_back (std::move (row));
        }

        return p;
    }
};
