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

**Décision (nov. 2026) : on reste sur deux pistes.** Erwan aurait préféré un seul emplacement sur la piste du Drum Rack. Impossible avec un VST3 : un effet VST reçoit de l'audio, un instrument ne sort du MIDI que vers une autre piste, et une piste n'a qu'un instrument. Pistes écartées pour l'instant : device Max for Live devant le Drum Rack (retour du problème `jweb`) et chargement du VST3 dans Max via `vst~` (synchro avec la lecture et fenêtre non éprouvées, prototype nécessaire). Le glisser-déposer du MIDI permet déjà de se passer de l'écoute en direct.

**Notes par défaut** (16 pads, convention des kits Ableton) :

```
C2  Cowbell     C#2 Tambourin   D2  Shaker      D#2 Ride
G#1 Tom grave   A1  Tom médium  A#1 Hat ouvert  B1  Tom aigu
E1  Conga grave F1  Conga méd.  F#1 Hat fermé   G1  Conga aiguë
C1  Kick        C#1 Rim         D1  Snare       D#1 Clap
```

Les toms utilisent une seule entrée (`tom`, note grave) et des décalages `TOM_OFF=[3,3,1,0]` selon la position dans le temps, pour des fills descendants. La version du mapping est `MAP_V=2` : un état sauvegardé avec un ancien mapping est ignoré au chargement.

## Refonte de l'interface (maquette validée, pas encore réalisée)

L'interface actuelle (bande de 1180 x 196 px) est jugée trop dense, austère, avec des fonctions cachées. Une maquette interactive a été validée avec Erwan : **`ui/maquette/kickstart-maquette.html`** (HTML autonome, à ouvrir dans un navigateur). Le dossier est dans `.gitignore` : la maquette n'est pas versionnée et n'existe que sur le poste d'Erwan (si elle manque, la demander ; la description ci-dessous suffit à la reconstituer). C'est la référence visuelle et fonctionnelle. Son moteur de génération est un simple substitut pour avoir des motifs plausibles : ne pas le porter, garder `engine.js`.

Inspiration : le plugin ADSR Drum Machine (look plat, tuiles arrondies, nom d'instrument coloré, un seul accent). Ambiance voulue : instrument hardware.

**Fenêtre** : 1120 x 740 px (à régler dans `PluginEditor.cpp`, y compris `setResizeLimits`, aujourd'hui 980-1800 x 180-420).

**Structure**
- **En-tête** : logo, barre du beat (style · type · longueur · seed, cliquable : ouvre « Style & kit »), onglets **Pattern** et **Style & kit**, tempo, lecture (hors Live), écoute dans le Drum Rack.
- **Onglet Pattern** : Rack en haut, séquenceur en bas.
  - Rack : 2 **banques** de 16 pads (C1-D#2 et E2-G3), en 2 rangées de 8 dans l'ordre de lecture. Chaque pad : note en petit en haut à gauche, instrument coloré en bas à gauche. Seuls les instruments **du kit** s'affichent ; un pad dont l'instrument n'est pas dans le kit est « vide » (l'instrument garde sa note en mémoire). Glisser un instrument sur un pad de la même banque l'échange avec l'occupant (événements pointeur, pas de drag HTML5, pour ne pas gêner le glisser-déposer du MIDI). Le chevron ⌄ d'un pad ouvre la liste des 22 instruments : le choisi vient sur ce pad, l'occupant prend sa place, et il est ajouté au kit s'il n'y était pas (ce qui régénère). Les pads s'allument à la lecture, et survoler le nom d'une piste entoure son pad.
  - Bande de réglages : **Type** (Classique ou Surprenant seulement, touches 1/2), **Longueur** (liste déroulante de 1 à 4 mesures), **Swing** et **Densité** (boîtes de valeur : glisser, molette, flèches ; double-clic remet le swing du style / 60 ; la densité régénère au relâchement), lien « Kit ».
  - Le drop n'est plus un type : il a son bouton. Quand il est actif, une ligne « Drop … · vN · revenir à l'original » apparaît sous la bande.
  - Séquenceur : pistes avec lock/mute toujours visibles, nom coloré, défilement vertical si le kit dépasse la hauteur.
- **Onglet Style & kit** : les 9 styles en une rangée de tuiles (un clic génère), puis kits prêts à l'emploi et instruments par groupe (Fondations, Métaux, Secoués, Bois, Peaux).
- **Barre du bas** : Générer (G, bouton plein), Tenter un drop (D), 5 derniers beats, annuler (Z), glisser le MIDI vers Live (double-clic ou E : export .mid).

**Visuel** : thème sombre plat, tuiles de même langage partout (styles, kits, pads), tuile active remplie de l'accent du type (classique `#5fd4b8`, surprenant `#a98cf5`, drop `#ff6b57`), police Manrope (à **intégrer en base64** dans la page : le WebView est hors ligne). Couleurs par instrument : voir `TRK` dans la maquette.

**22 instruments** (14 aujourd'hui, 8 de plus : crash, rimshot, snap, hat pédale, clave, woodblock, et les toms éclatés en trois). Notes par défaut :

| Groupe | Instruments (note) |
| --- | --- |
| Fondations | Kick C1, Snare D1, Clap D#1, Snap F#2, Rim C#1, Rimshot F2 |
| Métaux | Hat fermé F#1, Hat pédale A2, Hat ouvert A#1, Ride D#2, Crash E2, Cowbell C2 |
| Secoués | Shaker D2, Tambourin C#2 |
| Bois | Clave G2, Woodblock G#2 |
| Peaux | Conga grave E1, médium F1, aiguë G1 ; Tom aigu B1, médium A1, grave G#1 |

La banque 1 (C1-D#2) garde exactement les 16 pads d'avant (les toms y occupent G#1, A1, B1) : les kits Ableton d'Erwan ne bougent pas. Les nouveaux sont dans la banque 2. Kits de la maquette : Essentiel, Groove house, Latin (avec clave et woodblock), Dub (avec rimshot, hat pédale, crash), Breaks (avec les 3 toms), Tout.

**À faire à la réalisation** (rien de cela n'est encore dans `ui/src/` ni `Source/`) :
- `engine.js` : remplacer `tom` + `TOM_OFF` par trois ids (aigu, médium, grave, fills descendants), ajouter les 6 nouveaux instruments à `TRACKS`, à `DEFAULT_MAP`, à `FALLBACK`, aux `PRESETS` et aux recettes des styles (crash au premier temps et dans le drop, snap qui double le clap en house/afro, clave en afro, hat pédale en dub/dubstep/breaks, rimshot en dub). Ajouter le groupe « Bois ».
- `plugin-ui.js` : `patternString()` n'a plus de cas particulier pour les toms. Ajouter les banques du Rack. Incrémenter **`MAP_V`** (un état sauvegardé avec l'ancien mapping est alors ignoré).
- Retirer le type « Drop » de `MODES` (le drop reste un état dérivé, `S.base`).
- Piège rencontré dans la maquette : dans une grille CSS dont une rangée est masquée (`hidden`), les blocs suivants glissent d'une rangée et se retrouvent écrasés. Donner à chaque bloc un `grid-row` explicite.

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

- **Réaliser la refonte de l'interface** décrite plus haut (maquette dans `ui/maquette/`).
- Tester en conditions réelles dans Live : glisser-déposer du MIDI vers un slot, sauvegarde et rechargement d'un set.
- Plus de styles (jungle, footwork, electro, amapiano, reggaeton, lo-fi hip-hop).
- « Breakdown » et « Rendre surprenant », sur le modèle de « Tenter un drop ».
- Favoris (étoile) dans l'historique pour qu'un beat ne soit pas poussé dehors.
- Remplacer le synthé de secours par des samples légers pour la version autonome.
