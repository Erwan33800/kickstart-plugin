# Kickstart

Générateur de patterns de drums pour Ableton Live (et tout DAW VST3) : 9 styles, 3 types de pattern (classique, surprenant, drop), boucles de 4 à 16 temps, kit à composer, variations de drop et historique des 5 derniers beats.

## Installer (Windows)

1. Télécharge l'artefact **Kickstart-Windows** de la dernière compilation (onglet *Actions* du dépôt).
2. Copie le dossier `Kickstart.vst3` dans `C:\Program Files\Common Files\VST3`.
3. Dans Live : *Options > Préférences > Plug-ins*, active *Utiliser les dossiers système VST3*, puis *Réanalyser*.

`Kickstart.exe` est la version autonome, utile pour essayer l'interface hors de Live.

## Utiliser dans Live

Live n'accepte pas les plugins « MIDI seulement » : Kickstart se présente comme un instrument silencieux qui envoie du MIDI.

1. Crée une piste MIDI et charge **Kickstart** dessus.
2. Sur ta piste drums (Drum Rack), règle **MIDI From** sur la piste Kickstart, puis dans le second menu choisis **Kickstart**. Mets le *Monitor* sur **In**.
3. Lance la lecture : le pattern joue dans ton Drum Rack, calé sur Live.

Pour poser le pattern dans un clip : maintiens **⇲ Glisser le MIDI** et lâche-le sur une piste ou un slot. Double-clic sur le bouton (ou touche **E**) : export d'un fichier `.mid` dans `Documents\Kickstart MIDI`.

Le pattern, le kit, les notes MIDI et l'historique sont enregistrés avec le set Live.

## Raccourcis

| Touche | Action |
|---|---|
| G | Générer |
| D | Tenter un drop |
| Z | Annuler |
| 1 2 3 | Classique, Surprenant, Drop |
| ← → | Style précédent / suivant |
| E | Exporter en .mid |
| Maj + clic | Note fantôme |

## Développement

- `Source/` : processeur JUCE (lecture MIDI calée sur l'hôte, état), fenêtre WebView2, export MIDI.
- `ui/kickstart_plugin.html` : interface embarquée dans le plugin (générée depuis `ui/src/`).
- Compilation : `cmake -B build` puis `cmake --build build --config Release --target Kickstart_VST3`. Sous Windows, le SDK WebView2 doit être installé via NuGet (voir `.github/workflows/build.yml`).

JUCE 8 (formule Starter / AGPLv3) et SDK VST3 (MIT).
