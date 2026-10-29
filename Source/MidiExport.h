#pragma once

#include <juce_audio_basics/juce_audio_basics.h>
#include "Pattern.h"

namespace MidiExport
{
    // Écrit le pattern dans un fichier .mid (une piste, 960 ticks par temps).
    // La fin de piste est placée à la longueur exacte de la boucle pour que Live crée un clip complet.
    bool writeMidiFile (const Pattern& pattern, const juce::String& clipName, const juce::File& target);

    // Nom de fichier sans caractères interdits sous Windows
    juce::String safeFileName (const juce::String& name);
}
