# Kickstart

Générateur de patterns de drums pour Ableton Live (et tout logiciel qui accepte les VST3).
En un clic, tu obtiens un squelette de batterie qui s'écoute, puis tu le peaufines.

- 9 styles : House, Techno, Afro house, Dub techno, Dub, UK garage, Breakbeat, Drum & bass, Dubstep
- 2 types de pattern : **Classique** et **Surprenant**
- Boucles de 1 à 4 mesures (4 à 16 temps)
- 22 instruments à composer en kit : kick, snare, clap, snap, rim, rimshot, hats (fermé, pédale, ouvert), ride, crash, cowbell, shaker, tambourin, clave, woodblock, congas, toms (aigu, médium, grave)
- Un **Rack** de 2 banques de 16 pads pour placer chaque instrument sur le pad de ton Drum Rack
- « Tenter un drop » : garde ton pattern et le pousse en version drop
- « Breakdown » : garde ton pattern et le dépouille (plus de kick ni de backbeat), avec un retour en fin de boucle
- **Dynamique** : accents sur les temps et variations de vélocité propres à chaque instrument, pour des patterns moins mécaniques
- Historique des 5 derniers beats, sauvegarde avec le set Live

---

## 1. Télécharger le plugin

Le dépôt ne contient que le code source. Le plugin prêt à installer est fabriqué automatiquement par GitHub à chaque modification et publié sur la page **Releases**.

1. Ouvre la page **[Releases](../../releases/latest)** du dépôt (colonne de droite sur la page d'accueil du dépôt, rubrique *Releases*).
2. Dans **Assets**, télécharge **`Kickstart-Windows.zip`** (ou `Kickstart-macOS.zip` sur Mac).
3. Fais un clic droit sur le zip, puis **Extraire tout**. Tu obtiens :
   - `Kickstart.vst3` : **le plugin** (c'est un dossier, c'est normal) ;
   - `Kickstart.exe` : une version autonome, pour essayer l'interface sans Live ;
   - `README.md` : ce fichier.

> Si la page Releases est vide, la première compilation n'est pas terminée : regarde l'onglet **Actions** (environ 10 minutes).

## 2. Installer (Windows)

1. Copie le dossier **`Kickstart.vst3`** dans :
   ```
   C:\Program Files\Common Files\VST3
   ```
   Windows demande une confirmation administrateur : clique **Continuer**.
2. Dans Live : **Options > Préférences > Plug-ins**.
   - Active **Utiliser les dossiers système VST3** (*Use VST3 Plug-in System Folders*).
   - Clique **Réanalyser** (*Rescan*).
3. Kickstart apparaît dans le navigateur de Live : **Plug-ins > VST3 > Erwan > Kickstart**.

**Mettre à jour :** télécharge la nouvelle release, ferme Live, remplace le dossier `Kickstart.vst3`, rouvre Live.

### Sur Mac

Copie `Kickstart.vst3` dans `~/Library/Audio/Plug-Ins/VST3` (et `Kickstart.component` dans `~/Library/Audio/Plug-Ins/Components` pour l'AU), puis réanalyse dans Live. Le plugin n'est pas signé : au premier lancement, autorise-le dans *Réglages Système > Confidentialité et sécurité*.

## 3. Brancher Kickstart sur ta batterie dans Live

Dans Live, une piste MIDI ne peut contenir qu'**un seul instrument**. Kickstart et ton Drum Rack vivent donc sur **deux pistes** : Kickstart génère les notes, la piste drums les écoute et joue ses propres samples.

```
┌───────────────────────┐        ┌──────────────────────────────┐
│ Piste « Kickstart »   │  MIDI  │ Piste « Drums »              │
│  Kickstart (VST3)     │ ─────▶ │  MIDI From : Kickstart       │
│  (ne fait aucun son)  │        │  Monitor : In                │
└───────────────────────┘        │  Drum Rack (tes samples)     │
                                 └──────────────────────────────┘
```

### Étape par étape

1. **Ta piste drums** : garde-la telle quelle, avec ton Drum Rack (par exemple *909 Core Kit*).
2. **Crée une piste MIDI vide** : *Créer > Insérer une piste MIDI* (Ctrl+Maj+T). Renomme-la « Kickstart » (Ctrl+R).
3. **Charge Kickstart** dessus en le glissant depuis *Plug-ins > VST3*. Tu n'as rien à régler sur cette piste.
4. **Sur la piste drums**, dans la section *Entrée/Sortie* du mixeur (si elle est cachée, active-la avec le petit bouton **I/O** en bas à droite de la vue Session, ou *Affichage > Entrée/Sortie*) :

   | Réglage | Valeur |
   |---|---|
   | **MIDI From** (1er menu) | la piste **Kickstart** |
   | 2e menu | **Kickstart** (pas « Post FX ») |
   | **Monitor** | **In** |
   | **Sortie audio** | comme tes autres pistes (Master ou ton groupe) |

5. **Lance la lecture** dans Live : le pattern joue dans ton Drum Rack, calé sur le tempo.

### Grouper les deux pistes

Pour les garder ensemble et les replier d'un clic :

1. Clique sur le titre de la piste **Kickstart**, puis **Ctrl+clic** sur le titre de la piste **drums** pour sélectionner les deux.
2. **Ctrl+G** (*Grouper les pistes*). Renomme le groupe, par exemple « DRUMS ».
3. Le routage continue de fonctionner à l'intérieur du groupe : rien à refaire.

### Ne plus jamais refaire le branchement

Une fois les deux pistes prêtes dans un set vide : **Fichier > Enregistrer le set Live en tant que modèle**. Chaque nouveau projet démarrera avec Kickstart déjà branché sur ta batterie.

### Plusieurs batteries ?

Chaque piste drums peut écouter son propre Kickstart. Tu peux aussi brancher plusieurs pistes drums sur le même Kickstart : elles joueront le même pattern.

## 4. Utiliser Kickstart

La fenêtre a deux onglets : **Pattern** (le Rack, les réglages et le séquenceur) et **Style & kit**.

1. Dans **Style & kit**, choisis un **style** (un clic génère un beat) et un **kit** : un kit prêt à l'emploi, ou les instruments un par un.
2. Dans **Pattern**, règle le **type** (Classique ou Surprenant), la **longueur** (liste déroulante), le **swing**, la **densité** et la **dynamique** (glisse sur la valeur, molette, double-clic pour revenir à la valeur par défaut). La densité et la dynamique régénèrent le beat quand tu relâches.
3. **Générer** (touche G) jusqu'à trouver un groove qui te plaît.
4. Ajuste : clique ou glisse sur les cases, **Maj + clic** pour une note fantôme, **molette sur une note allumée** pour régler sa vélocité (plus la case est claire, plus elle est forte), cadenas pour verrouiller une piste (elle survit à Générer), haut-parleur pour la couper.
5. **Tenter un drop** (touche D) : même structure, version drop, avec un crash sur le premier temps. Appuie encore pour une autre variante.
6. **Breakdown** (touche B) : même structure, version dépouillée, en trois saveurs (Dépouillé, Percussif, Respiration). Le drop et le breakdown partent toujours de ton pattern d'origine : tu peux passer de l'un à l'autre. Clique « revenir à l'original » pour retrouver ton pattern.

### Poser le pattern dans un clip

- **Maintiens « ⇲ Glisser le MIDI »** et lâche-le sur la piste drums (ou dans un slot) : Live crée le clip.
- En secours : **double-clic** sur ce bouton (ou touche **E**) exporte un fichier `.mid` dans `Documents\Kickstart MIDI`, à glisser ensuite dans Live.

Une fois le pattern figé dans un clip, remets le **Monitor** de la piste drums sur **Auto** pour n'entendre que le clip (sinon Kickstart et le clip jouent en même temps).

### Raccourcis

| Touche | Action |
|---|---|
| G | Générer |
| D | Tenter un drop |
| B | Breakdown |
| Z | Annuler |
| 1 / 2 | Classique / Surprenant |
| ← / → | Style précédent / suivant |
| E | Exporter en .mid |
| Maj + clic | Note fantôme |

### Le Rack et les notes MIDI

Le **Rack**, en haut de l'onglet Pattern, représente les pads de ton Drum Rack : **2 banques de 16 pads** (boutons *C1 – D#2* et *E2 – G3*), en 2 rangées de 8, dans l'ordre des notes. Sur chaque pad, la note en haut et l'instrument en bas. Seuls les instruments du kit s'affichent : un pad dont l'instrument n'est pas dans le kit est « vide ».

Par défaut, la **banque 1** reprend la disposition des kits d'Ableton et la **banque 2** accueille les derniers venus :

```
Banque 1    C1  Kick         C#1 Rim          D1  Snare        D#1 Clap
            E1  Conga grave  F1  Conga méd.   F#1 Hat fermé    G1  Conga aiguë
            G#1 Tom grave    A1  Tom médium   A#1 Hat ouvert   B1  Tom aigu
            C2  Cowbell      C#2 Tambourin    D2  Shaker       D#2 Ride

Banque 2    E2  Crash        F2  Rimshot      F#2 Snap         G2  Clave
            G#2 Woodblock    A2  Hat pédale
```

Les pads de la banque 1 jouent ce que ton kit y a mis : dans un 909 Core Kit, les congas sonneront par exemple comme un second kick ou une snare. Pour changer un instrument de pad :

- **glisse-le** sur un autre pad de la même banque : si le pad est pris, les deux instruments s'échangent ;
- ou clique le chevron **⌄** d'un pad et choisis l'instrument dans la liste (ça marche d'une banque à l'autre, et ça ajoute l'instrument au kit s'il n'y était pas) ;
- le menu **Preset** (en haut à droite du Rack) applique une disposition toute faite : **Par défaut** (celle ci-dessus) ou **909 Core Kit** (la disposition du Core Kit 909 d'Ableton : kick C1, rim C#1, snare D1, clap D#1, hats F#1 et A#1, toms G#1 à B1, crash C2, ride D2). Le 909 n'a pas de sample pour les congas, le shaker, le tambourin, le cowbell, le snap, le rimshot, la clave, le woodblock ni le hat pédale : ces instruments passent sur des notes sans pad (banque 2) et restent muets, et Kickstart te prévient quand ils font partie de ton kit. Après un réglage à la main, le menu affiche **Perso**.

Les notes de la banque 2 (E2 à A2) ne sonneront que si ton Drum Rack a des pads à ces notes : dans Live, passe à la page suivante des pads du Drum Rack pour les remplir.

## 5. Ça ne marche pas ?

| Problème | Solution |
|---|---|
| Kickstart n'apparaît pas dans Live | Vérifie que le dossier est bien `C:\Program Files\Common Files\VST3\Kickstart.vst3`, que *Utiliser les dossiers système VST3* est activé, puis **Réanalyser**. |
| Charger Kickstart remplace mon Drum Rack | Normal : un seul instrument par piste. Mets Kickstart sur **sa propre piste** (section 3). |
| Pas de son | Sur la piste drums : **Monitor sur In** (pas Auto), **MIDI From** sur Kickstart, et la lecture de Live doit être lancée. |
| Je n'entends qu'une partie du kit, ou un élément joue le mauvais son | Ouvre le **Rack** (onglet Pattern) et place chaque instrument sur le pad de ton Drum Rack qui porte le bon son. Les instruments de la banque 2 (crash, rimshot, snap, clave, woodblock, hat pédale) demandent des pads aux notes E2 à A2. |
| La fenêtre du plugin reste blanche | Installe ou mets à jour *Microsoft Edge WebView2 Runtime* (déjà présent sur la plupart des Windows 10/11). |
| Le glisser-déposer ne crée pas de clip | Utilise l'export `.mid` (double-clic ou touche E), puis glisse le fichier depuis `Documents\Kickstart MIDI`. |

---

## Développement

- `Source/` : processeur JUCE (lecture MIDI calée sur l'hôte, sauvegarde de l'état), fenêtre WebView2, export MIDI.
- `ui/src/` : interface (HTML, moteur de génération, liaison avec le plugin, police Manrope). `python3 ui/build_ui.py` assemble `ui/kickstart_plugin.html`, embarqué dans le plugin.
- Compilation locale : `cmake -B build` puis `cmake --build build --config Release --target Kickstart_VST3`. Sous Windows, le SDK WebView2 s'installe via NuGet (voir `.github/workflows/build.yml`).
- Chaque push sur `main` compile Windows et macOS (GitHub Actions) et met à jour la release **latest**.

JUCE 8 (formule Starter / AGPLv3), SDK VST3 (licence MIT) et police Manrope (SIL Open Font License).
