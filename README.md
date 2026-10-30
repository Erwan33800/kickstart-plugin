# Kickstart

Générateur de patterns de drums pour Ableton Live (et tout logiciel qui accepte les VST3).
En un clic, tu obtiens un squelette de batterie qui s'écoute, puis tu le peaufines.

- 9 styles : House, Techno, Afro house, Dub techno, Dub, UK garage, Breakbeat, Drum & bass, Dubstep
- 3 types de pattern : **Classique**, **Surprenant**, **Drop**
- Boucles de 1 à 4 mesures (4 à 16 temps)
- Kit à composer : kick, snare, clap, rim, hats, ride, cowbell, shaker, tambourin, congas, toms
- « Tenter un drop » : garde ton pattern et le pousse en version drop
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

1. Choisis un **style**, un **type** (Classique, Surprenant, Drop) et une **longueur**.
2. **Générer** (touche G) jusqu'à trouver un groove qui te plaît.
3. Ajuste : clique ou glisse sur les cases, **Maj + clic** pour une note fantôme, **Kit** pour ajouter ou retirer des éléments.
4. **Tenter un drop** (touche D) : même structure, version drop. Appuie encore pour une autre variante.

### Poser le pattern dans un clip

- **Maintiens « ⇲ Glisser le MIDI »** et lâche-le sur la piste drums (ou dans un slot) : Live crée le clip.
- En secours : **double-clic** sur ce bouton (ou touche **E**) exporte un fichier `.mid` dans `Documents\Kickstart MIDI`, à glisser ensuite dans Live.

Une fois le pattern figé dans un clip, remets le **Monitor** de la piste drums sur **Auto** pour n'entendre que le clip (sinon Kickstart et le clip jouent en même temps).

### Raccourcis

| Touche | Action |
|---|---|
| G | Générer |
| D | Tenter un drop |
| Z | Annuler |
| 1 / 2 / 3 | Classique / Surprenant / Drop |
| ← / → | Style précédent / suivant |
| E | Exporter en .mid |
| Maj + clic | Note fantôme |

### Notes MIDI

Par défaut, Kickstart suit la convention des Drum Racks d'Ableton (Kick = C1, Snare = D1, Clap = D#1, Hat fermé = F#1, Hat ouvert = A#1…). Si ton kit est rangé autrement, change les notes dans le menu **⋯** en haut à droite du séquenceur.

## 5. Ça ne marche pas ?

| Problème | Solution |
|---|---|
| Kickstart n'apparaît pas dans Live | Vérifie que le dossier est bien `C:\Program Files\Common Files\VST3\Kickstart.vst3`, que *Utiliser les dossiers système VST3* est activé, puis **Réanalyser**. |
| Charger Kickstart remplace mon Drum Rack | Normal : un seul instrument par piste. Mets Kickstart sur **sa propre piste** (section 3). |
| Pas de son | Sur la piste drums : **Monitor sur In** (pas Auto), **MIDI From** sur Kickstart, et la lecture de Live doit être lancée. |
| Je n'entends qu'une partie du kit | Les notes de ton Drum Rack ne correspondent pas : ajuste-les dans le menu **⋯**. |
| La fenêtre du plugin reste blanche | Installe ou mets à jour *Microsoft Edge WebView2 Runtime* (déjà présent sur la plupart des Windows 10/11). |
| Le glisser-déposer ne crée pas de clip | Utilise l'export `.mid` (double-clic ou touche E), puis glisse le fichier depuis `Documents\Kickstart MIDI`. |

---

## Développement

- `Source/` : processeur JUCE (lecture MIDI calée sur l'hôte, sauvegarde de l'état), fenêtre WebView2, export MIDI.
- `ui/src/` : interface (HTML, moteur de génération, liaison avec le plugin). `python3 ui/build_ui.py` assemble `ui/kickstart_plugin.html`, embarqué dans le plugin.
- Compilation locale : `cmake -B build` puis `cmake --build build --config Release --target Kickstart_VST3`. Sous Windows, le SDK WebView2 s'installe via NuGet (voir `.github/workflows/build.yml`).
- Chaque push sur `main` compile Windows et macOS (GitHub Actions) et met à jour la release **latest**.

JUCE 8 (formule Starter / AGPLv3) et SDK VST3 (licence MIT).
