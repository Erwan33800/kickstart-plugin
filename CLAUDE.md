# Kickstart : contexte du projet

Ce fichier résume l'historique et les décisions du projet pour un assistant de code. Il est lu automatiquement par Claude Code à l'ouverture du dépôt.

## Le projet en une phrase

Kickstart est un plugin VST3 pour Ableton Live qui génère rapidement des patterns de drums « qui s'écoutent », pour démarrer une idée sans perdre de temps sur la batterie. Le but n'est pas le pattern parfait, mais un squelette solide à retoucher.

## L'utilisateur

- Erwan, producteur et DJ. Il produit surtout du **dub** et de la **house** dans **Ableton Live 12 Suite**, sur **Windows**.
- Il communique en **français**. Réponses, interface, commentaires de code, README et messages de commit sont en français.
- Il est développeur (profil Product Owner, formation architecture logicielle) mais pas spécialiste C++ ou audio : expliquer les choix et les contraintes d'Ableton simplement.
- Il veut une UX très travaillée mais simple. Il a rejeté un premier design trop proche d'un site marchand (onglets génériques) au profit d'une interface « instrument » : LED, valeurs à glisser, sombre, un seul accent de couleur.

## Fonctionnalités

- **9 styles** : House, Techno, Afro house, Dub techno, Dub, UK garage, Breakbeat, Drum & bass, Dubstep. Chaque style a son tempo, son swing, sa durée de kick et son squelette de drop (`GENRE_DEF` dans `ui/src/engine.js`).
- **3 types** : Classique (groove attendu), Surprenant (kicks déplacés, euclidiens, 3-3-2), Drop (tout le kit, roulements).
- **Longueur** : 1 à 4 mesures (4 à 16 temps), structure A / B / A / B avec un fill sur la dernière mesure.
- **Kit à composer** (14 éléments) : kick, snare, clap, rim, hat fermé, hat ouvert, ride, cowbell, shaker, tambourin, conga grave / médium / aiguë, toms. Kits tout faits : Essentiel, Groove house, Latin, Dub, Breaks, Tout. Retirer un élément redistribue son rôle (`FALLBACK`).
- **« Tenter un drop »** : garde la structure du pattern courant et le pousse en drop, avec trois couleurs (Plein régime, Rebond, Montée) adaptées au squelette du style. « Original » revient au pattern de départ.
- **Édition** : clic ou glisser pour peindre, Maj + clic pour une note fantôme, verrouiller (la piste survit à Générer) ou couper une piste.
- **Historique** des 5 derniers beats, **annuler** (Z), densité et swing réglables.
- **Notes MIDI** : par défaut sur les 16 pads d'un Drum Rack (C1 à D#2), modifiables dans le panneau ⋯ avec une grille 4×4 identique au Drum Rack (C1 en bas à gauche).
- **Export** : glisser-déposer du MIDI vers Live (bouton « ⇲ Glisser le MIDI »), ou double-clic / touche E pour écrire un `.mid` dans `Documents\Kickstart MIDI`.
- **Sauvegarde** : pattern, kit, notes et historique sont enregistrés avec le set Live (état du plugin).

Raccourcis : G générer, D drop, Z annuler, 1/2/3 type, ← → style, E export.

## Historique et décisions (pourquoi c'est comme ça)

1. **Prototype HTML** (artifact claude.ai, sons synthétisés en Web Audio) pour valider le concept. Le moteur de génération vient de là et a été réutilisé partout.
2. **Device Max for Live** (`.amxd`) : abandonné comme cible principale.
   - L'objet `jweb` de Max n'affichait la page qu'en mode édition, et restait noir en usage normal dans Live.
   - Contournement : un serveur Node (`node.script`) servait l'interface dans le navigateur (puis une fenêtre d'application Edge). Ça fonctionnait mais restait bancal : pas de sauvegarde dans le set, fenêtre séparée.
   - Avantage perdu : un device Max se place **devant** le Drum Rack sur la même piste.
3. **Plugin JUCE (actuel)** : un seul `.vst3`, interface intégrée via WebView2, timing calé sur la tête de lecture de l'hôte, état sauvegardé.

**Contrainte Ableton importante :** Live n'accepte pas les VST « effet MIDI ». Kickstart est donc déclaré **instrument** (`IS_SYNTH TRUE`, sortie audio silencieuse, `NEEDS_MIDI_OUTPUT TRUE`), et une piste MIDI ne contient qu'un instrument. Utilisation obligatoire sur **deux pistes** :
- piste « Kickstart » avec le plugin ;
- piste drums avec le Drum Rack, réglée sur **MIDI From = piste Kickstart / Kickstart**, **Monitor = In** ;
- les deux pistes peuvent être groupées (Ctrl+G), et le montage enregistré comme modèle de set.

Un VST ne peut pas écrire directement dans un clip de Live : d'où le glisser-déposer d'un fichier MIDI.

**Notes par défaut** (16 pads, convention des kits Ableton) :

```
C2  Cowbell     C#2 Tambourin   D2  Shaker      D#2 Ride
G#1 Tom grave   A1  Tom médium  A#1 Hat ouvert  B1  Tom aigu
E1  Conga grave F1  Conga méd.  F#1 Hat fermé   G1  Conga aiguë
C1  Kick        C#1 Rim         D1  Snare       D#1 Clap
```

Les toms utilisent une seule entrée (`tom`, note grave) et des décalages `TOM_OFF=[3,3,1,0]` selon la position dans le temps, pour des fills descendants. La version du mapping est `MAP_V=2` : un état sauvegardé avec un ancien mapping est ignoré au chargement.

## Architecture

```
CMakeLists.txt              JUCE 8.0.4 via FetchContent, VST3 + Standalone (+ AU sur Mac)
Source/
  PluginProcessor.*         lecture MIDI calée sur l'hôte (ppq), auditions, état (ValueTree)
  PluginEditor.*            WebBrowserComponent (WebView2), pont JS <-> C++, drag & export MIDI
  Pattern.h                 parse du pattern texte
  MidiExport.*              écriture .mid (960 ticks/temps, fin de piste = longueur de boucle)
ui/
  src/plugin-head.html      HTML + CSS de l'interface (bande compacte, ~1180 x 196 px)
  src/engine.js             moteur : TRACKS, GENRE_DEF, recettes R[style][type], extras, mutate, fill, drops, synthé de secours
  src/plugin-ui.js          interface : séquenceur, kit, panneau notes, historique, lien avec le plugin
  build_ui.py               assemble ui/kickstart_plugin.html (head + engine + ui)
  kickstart_plugin.html     page générée, embarquée dans le binaire (juce_add_binary_data)
.github/workflows/build.yml compile Windows (windows-2022, WebView2 via NuGet) et macOS (macos-15),
                            puis met à jour la release GitHub « latest » (Kickstart-Windows.zip, Kickstart-macOS.zip)
```

**Ne jamais modifier `ui/kickstart_plugin.html` à la main** : modifier `ui/src/*`, puis lancer `python ui/build_ui.py` et commiter les deux.

### Pont interface <-> plugin

Événement JUCE unique `kickstart`, avec un tableau `[commande, ...arguments]`.

- **Page vers plugin** (`window.__JUCE__.backend.emitEvent`) :
  - `pattern <texte>` : nouveau pattern à jouer
  - `live 0|1` : écoute du pattern pendant la lecture
  - `audition <note> <vélocité>` : jouer un son
  - `state <json>` : état de l'interface à sauvegarder dans le set
  - `ready` : la page est chargée (le plugin renvoie `restore`)
  - `dragmidi <texte> <nomDuClip>` : lancer le glisser-déposer d'un .mid
  - `export <texte> <nomDuClip>` : écrire un .mid dans `Documents\Kickstart MIDI`
- **Plugin vers page** (`emitEventIfBrowserIsVisible`) : `tempo <bpm>`, `transport 0|1`, `step <n>`, `status ok|err <message>`, `restore <json>`, `dragdone`.

Hors du plugin (fichier ouvert dans un navigateur), la page fonctionne seule avec le synthé Web Audio de secours.

### Format du pattern

`pas_swing_swingClip/note.v.v.v.../note.v.v.v...`

- `pas` : 16 à 64 doubles-croches ; `swing` : 50 à 75 ; `swingClip` : 1 pour écrire le swing dans le .mid.
- Puis une ligne par note MIDI, avec une vélocité de 0 à 127 par pas. Les pistes coupées ne sont pas envoyées.
- Le swing décale les doubles-croches impaires de `(swing-50)/50 * 0.25` temps.

Dans l'interface, une vélocité est stockée entre 0 et 1 (`S.pat[id][pas]`) ; l'état global est l'objet `S` dans `engine.js`.

## Compiler et publier

- Pousser sur `main` déclenche la CI. En ~5 minutes, la page **Releases > latest** contient les zips prêts à installer. Le dépôt ne contient aucun binaire.
- Installation Windows : copier `Kickstart.vst3` dans `C:\Program Files\Common Files\VST3`, puis dans Live activer « Utiliser les dossiers système VST3 » et réanalyser. Fermer Live avant de remplacer le plugin.
- Compilation locale possible : `cmake -B build` puis `cmake --build build --config Release --target Kickstart_VST3`. Sous Windows, il faut Visual Studio 2022 et le SDK WebView2 (voir le workflow pour la commande NuGet et `JUCE_WEBVIEW2_PACKAGE_LOCATION`). Sous Linux, la compilation sert seulement à vérifier le code.
- Pour tester l'interface sans compiler : ouvrir `ui/kickstart_plugin.html` dans un navigateur.

## Conventions

- Texte visible et commentaires en français, ton direct et simple.
- Interface : thème sombre, couleurs en variables CSS, accent selon le type (classique `#5fd4b8`, surprenant `#a98cf5`, drop `#ff6b57`), polices système (Segoe UI Variable, Cascadia Mono).
- Le thread audio ne bloque jamais : le pattern passe du thread message au thread audio par un `shared_ptr` échangé sous `SpinLock` en `ScopedTryLock`.
- Licences : JUCE 8 (Starter / AGPLv3), SDK VST3 (MIT).

## Pistes pour la suite

- Tester en conditions réelles dans Live : glisser-déposer du MIDI vers un slot, sauvegarde et rechargement d'un set.
- Plus de styles (jungle, footwork, electro, amapiano, reggaeton, lo-fi hip-hop).
- « Breakdown » et « Rendre surprenant », sur le modèle de « Tenter un drop ».
- Favoris (étoile) dans l'historique pour qu'un beat ne soit pas poussé dehors.
- Remplacer le synthé de secours par des samples légers pour la version autonome.
