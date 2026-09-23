# Signature & Cachet Manager

> **Studio professionnel d'apposition de signatures manuscrites, de cachets d'entreprise et de papier à en-tête sur documents PDF avec aperçu interactif en temps réel, moteur de variations naturelles et piste d'audit cryptographique.**

---

## 📋 Table des matières

1. [Présentation du projet](#-présentation-du-projet)
2. [Fonctionnalités principales](#-fonctionnalités-principales)
   - [Gestion des documents et fichiers](#gestion-des-documents-et-fichiers)
   - [Visualiseur interactif haute résolution](#visualiseur-interactif-haute-résolution)
   - [Réglage d'opacité et transparence du tampon](#réglage-dopacité-et-transparence-du-tampon)
   - [Intégration avancée du papier à en-tête](#intégration-avancée-du-papier-à-en-tête)
   - [Atelier Générateur de Cachet Pro](#atelier-générateur-de-cachet-pro)
   - [Pavé de signature tactile & souris](#pavé-de-signature-tactile--souris)
   - [Moteur de variations naturelles déterministes](#moteur-de-variations-naturelles-déterministes)
   - [Piste d'audit cryptographique (.jsonl)](#piste-daudit-cryptographique-jsonl)
3. [Raccourcis clavier](#-raccourcis-clavier)
4. [Architecture technique & Stack](#-architecture-technique--stack)
5. [Structure du projet](#-structure-du-projet)
6. [Installation & Démarrage](#-installation--démarrage)
7. [Guide d'utilisation pas à pas](#-guide-dutilisation-pas-à-pas)
8. [Sécurité & Confidentialité](#-sécurité--confidentialité)

---

## 🌟 Présentation du projet

**Signature & Cachet Manager** est une application web conçue pour répondre aux exigences administratives, juridiques et comptables des entreprises (SARL, SAS, professions libérales, notaires, administrations). 

Elle permet de signer, tamponner et habiller de papier à en-tête des documents PDF de plusieurs pages avec une fidélité vectorielle absolue, sans pixelliser ni dégrader le document original, et en conservant un contrôle millimétré sur chaque élément.

Le traitement s'effectue **intégralement dans le navigateur client**, garantissant la confidentialité absolue des données bancaires, contractuelles ou personnelles.

---

## ✨ Fonctionnalités principales

### Gestion des documents et fichiers
- **Document principal PDF** : prise en charge des PDF multipages sans limite de pages, calcul d'empreinte SHA-256 à l'importation.
- **Signature manuscrite** : import d'images (PNG avec fond transparent, JPEG, SVG, WebP) ou création directe via le pad de signature tactile intégré.
- **Cachet / Tampon encreur** : import d'images ou conception sur-mesure grâce à l'atelier générateur de cachet.
- **Papier à en-tête (Letterhead)** : import d'un PDF d'en-tête (mono ou multipages) pour habiller automatiquement les pages avec logos, bandeaux et pieds de page.
- **Jeu d'échantillons en 1 clic** : chargement instantané d'un document type devis/facture avec signature, tampon et en-tête pour tester immédiatement l'outil.

### Visualiseur interactif haute résolution
- **Rendu fidèle vectoriel** basé sur PDF.js avec ratio d'aspect strict préservé.
- **Glisser-déposer interactif (Drag & Drop)** de la signature et du cachet directement sur la page du document.
- **Liaison cinématique (Link Mode)** : lier la signature au cachet pour déplacer le bloc en un seul geste tout en préservant leur écartement relatif.
- **Affichage des coordonnées en direct** : badges d'assistance avec pourcentages X/Y, rotation et niveau d'opacité.
- **Modes d'affichage** :
  - Mode Plein écran immersif (`F` ou `Échap`).
  - Mode Élargi (`W`) pour donner la priorité au visualiseur.
  - Mode Épinglé / Sticky (`S`) maintenant le visualiseur visible lors du défilement des panneaux.
  - Zoom fluide de 50% à 200% (`+`, `-`, `0`).

### Réglage d'opacité et transparence du tampon
- **Curseur de réglage fluide** de 10% à 100% d'opacité (pas de 5%) avec boutons fins `[-]` et `[+]`.
- **4 Préréglages rapides** :
  - `100% Opaque` : tampon plein sans transparence.
  - `85% Encre naturelle` : simulation d'un tampon encreur physique sur papier.
  - `70% Atténué` : laisse transparaître nettement le texte et les tableaux sous le cachet.
  - `45% Filigrane` : effet discret pour les visas ou mentions d'archive.
- **Application native dans le PDF exporté** via `pdf-lib` (`page.drawImage(..., { opacity })`).
- Enregistrement du niveau d'opacité dans la piste d'audit.

### Intégration avancée du papier à en-tête
- **Mode de calque au choix** :
  - *Arrière-plan (sous texte)* : le texte original reste parfaitement au-dessus grâce au mode de fusion optique `multiply` qui rend le fond blanc transparent.
  - *Premier plan (par-dessus)* : idéal pour les bordures décoratives ou mentions de sécurité.
- **Bascule en 1 clic** directement sur le visualiseur via un badge in-document ou le raccourci `L`.
- **Sélection des pages cibles** : appliquer l'en-tête à toutes les pages ou uniquement à des pages spécifiques (ex: première page seulement).

### Atelier Générateur de Cachet Pro
Composant interactif permettant de fabriquer un cachet officiel sans logiciel externe :
- **4 Géométries** :
  - *Rond officiel* (cercles concentriques, arcs de cercle courbés, motif central).
  - *Rectangle d'entreprise* (cartouche légal, forme juridique, SIRET, capital).
  - *Ovale notarial* (double ellipse administrative).
  - *Badge biseauté* (pans coupés, bannières pour visas d'impact : PAYÉ, CONFIDENTIEL).
- **6 Modèles prêts à l'emploi** :
  - Direction Générale
  - Société / SIRET
  - Facture Payée
  - Copie Conforme
  - Visa Notarial / Juridique
  - Strictement Confidentiel
- **Effet d'encre réaliste (Grunge / Weathering)** : curseur de vieillissement (0% à 45%) ajoutant des micro-aspérités et porosités naturelles.
- **Typographies** : Moderne (Sans-serif), Juridique (Serif), Machine à écrire (Monospace).
- **6 Emblèmes centraux vectoriels** : Étoile (`★`), Bouclier (`🛡`), Coche (`✓`), Balance de justice (`⚖`), Bâtiment (`🏛`), ou aucun (`—`).
- **Nuancier & Pipette personnalisée** : 7 teintes officielles + sélecteur couleur libre HTML5.
- **Export direct** : insertion dans le document ou téléchargement en **PNG 32-bit transparent** (500×500 px).

### Pavé de signature tactile & souris
- Canevas de signature fluide haute résolution avec lissage des courbes de Bézier.
- Choix de couleur d'encre (Bleu stylo plume `#1e3a8a`, Noir `#0f172a`, etc.) et d'épaisseur de trait.
- Nettoyage automatique et exportation en PNG transparent.

### Moteur de variations naturelles déterministes
- Simule l'imprécision humaine lors de la signature de liasses multipages (devis de 10 pages, contrats, etc.).
- Utilise un générateur pseudo-aléatoire déterministe (**Mulberry32**) : la page 3 aura *exactement* les mêmes variations lors de l'aperçu et dans l'export PDF final.
- Amplitudes réglables indépendamment :
  - Décalage de position ($\pm X\%, \pm Y\%$).
  - Angle de rotation ($\pm \theta^\circ$).
  - Facteur d'échelle ($\pm S\%$).

### Piste d'audit cryptographique (.jsonl)
- Lors de l'exportation finale, un fichier d'audit standardisé **NDJSON (.jsonl)** est généré.
- Contenu tracé :
  - Empreinte cryptographique **SHA-256** du PDF source et du PDF produit.
  - Horodatage ISO-8601 UTC de l'opération.
  - Liste détaillée des pages avec statut de chaque élément (présence, coordonnées, rotation, échelle, opacité, variations appliquées).
  - Métadonnées des fichiers sources (tailles en octets, formats).
- Visualiseur d'audit intégré avec recherche, coloration syntaxique et bouton de téléchargement.

---

## ⌨️ Raccourcis clavier

L'application intègre un système complet de navigation et d'actions rapides au clavier avec retour visuel immédiat (HUD Toast) :

| Raccourci | Action |
| :--- | :--- |
| `←` / `Page Up` | Page précédente |
| `→` / `Page Down` | Page suivante |
| `Home` | Première page |
| `End` | Dernière page |
| `+` / `=` | Zoom avant (+15%) |
| `-` | Zoom arrière (-15%) |
| `0` | Réinitialiser le zoom (100%) |
| `F` | Basculer en mode Plein écran |
| `W` | Basculer en mode Élargi (Wide Viewer) |
| `S` | Activer / Désactiver le visualiseur épinglé (Sticky) |
| `1` | Activer l'élément **Signature** |
| `2` | Activer l'élément **Cachet** |
| `T` | Activer / Désactiver Signature & Cachet sur la page courante |
| `E` | Activer / Désactiver le Papier à en-tête sur la page courante |
| `L` | Basculer le calque En-tête (*Arrière-plan* / *Premier plan*) |
| `Ctrl + E` / `Cmd + E` | Ouvrir la boîte d'exportation PDF |
| `?` | Afficher l'aide des raccourcis clavier |

---

## 🛠 Architecture technique & Stack

- **Runtime & Build** : [Vite 8](https://vite.dev/) avec Hot Module Replacement optimisé et configuration serveur Express.
- **Frontend Framework** : [React 19](https://react.dev/) en TypeScript strict (`@types/react`, `@types/react-dom`).
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/) avec `@tailwindcss/vite` pour des styles utilitaires légers et réactifs.
- **Rendu PDF côté client** : [PDF.js (`pdfjs-dist`)](https://mozilla.github.io/pdf.js/) pour le rendu vectoriel Canvas des pages PDF.
- **Manipulation & Assemblage PDF** : [pdf-lib](https://pdf-lib.js.org/) pour la fusion, l'apposition d'images transparentes avec rotation/opacité et l'exportation sans altération du texte d'origine.
- **Iconographie** : [Lucide React](https://lucide.dev/) pour des icônes vectorielles cohérentes et légères.
- **Cryptographie** : API native Web Crypto (`crypto.subtle.digest`) pour les hachages SHA-256 ultra-rapides.

---

## 📁 Structure du projet

```
signature-cachet-manager/
├── index.html                   # Point d'entrée HTML
├── metadata.json                # Métadonnées applicatives AI Studio
├── package.json                 # Dépendances et scripts npm
├── tsconfig.json                # Configuration TypeScript
├── vite.config.ts               # Configuration Vite et plugins
├── rapport.md                   # Rapport d'évolution et d'améliorations
├── README.md                    # Documentation complète du projet
├── src/
│   ├── main.tsx                 # Point de montage React
│   ├── App.tsx                  # Composant racine, orchestration d'état & HUD
│   ├── index.css                # Styles globaux Tailwind CSS
│   ├── types/
│   │   └── index.ts             # Interfaces TypeScript (OverlayElementConfig, LoadedFile...)
│   ├── components/
│   │   ├── FileImportCard.tsx       # Gestionnaire d'import des 4 types de fichiers
│   │   ├── InteractiveViewer.tsx    # Visualiseur PDF interactif avec drag & drop
│   │   ├── SettingsPanel.tsx        # Panneau de réglages (Position, Tailles, Opacité, Variations)
│   │   ├── HeaderSettings.tsx       # Configuration du papier à en-tête
│   │   ├── StampGeneratorModal.tsx  # Atelier complet de création de cachet officiel
│   │   ├── SignaturePadModal.tsx    # Pavé de dessin de signature manuscrite
│   │   ├── ExportModal.tsx          # Boîte de dialogue d'exportation et barre de progression
│   │   ├── AuditLogModal.tsx        # Visualiseur du journal d'audit cryptographique
│   │   ├── KeyboardShortcutsModal.tsx # Aide contextuelle des raccourcis clavier
│   │   ├── ShortcutToast.tsx        # Notification HUD discrète lors des frappes
│   │   └── ErrorDialog.tsx          # Boîte de dialogue des erreurs avec suggestions
│   └── services/
│       ├── auditLogger.ts           # Générateur de journal d'audit JSONL et SHA-256
│       ├── fileValidator.ts         # Validation stricte des fichiers (Magic Bytes, mime-types)
│       ├── pdfExporter.ts           # Moteur d'exportation PDF avec pdf-lib
│       ├── pdfRenderer.ts           # Service de rendu Canvas via PDF.js
│       ├── profiles.ts              # Profils de disposition par défaut
│       ├── sampleData.ts            # Générateur d'échantillons de test haute qualité
│       └── variationEngine.ts       # Moteur PRNG Mulberry32 de variations déterministes
```

---

## 🚀 Installation & Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

### Installation des dépendances
```bash
npm install
```

### Lancement du serveur de développement
```bash
npm run dev
```
L'application démarre immédiatement sur `http://localhost:3000`.

### Vérification du code (Linter)
```bash
npm run lint
```

### Compilation pour la production
```bash
npm run build
```
Les fichiers statiques prêts pour le déploiement sont générés dans le dossier `dist/`.

---

## 📖 Guide d'utilisation pas à pas

1. **Charger le document PDF** :
   - Glissez votre fichier PDF dans la zone dédiée ou cliquez sur *« Charger un exemple complet »* pour découvrir l'interface avec des données prêtes.
2. **Ajouter la signature et le cachet** :
   - Importez vos fichiers PNG transparents, ou utilisez l'**Atelier de cachet** pour concevoir votre tampon et le **Pavé de signature** pour dessiner votre paraphe.
3. **Ajuster la position et la transparence** :
   - Déplacez directement la signature et le tampon à la souris ou au doigt sur le document.
   - Dans le panneau de droite, ajustez l'**Opacité** (ex: *85% Encre naturelle*) pour un rendu réaliste.
   - Choisissez l'orientation et l'écartement relatif souhaité.
4. **Configurer l'en-tête (optionnel)** :
   - Importez votre papier à en-tête et sélectionnez si vous souhaitez le positionner en *Arrière-plan* ou au *Premier plan*.
5. **Appliquer aux autres pages** :
   - Cliquez sur *« Appliquer cette disposition à toutes les pages »* ou activez les *Variations naturelles* pour un effet d'apposition manuelle réaliste.
6. **Exporter** :
   - Cliquez sur *« Exporter le document final »* (`Ctrl + E`).
   - Téléchargez votre PDF signé ainsi que le fichier d'audit `.jsonl` attestant de l'opération.

---

## 🔒 Sécurité & Confidentialité

- **Traitement Zero-Cloud** : Tous les calculs, rendus et modifications PDF s'exécutent localement dans le bac à sable du navigateur client via WebAssembly / JavaScript.
- **Intégrité vérifiable** : Chaque PDF exporté dispose d'un hash SHA-256 calculé avant tout téléchargement et répertorié dans un fichier d'audit horodaté.
- **Préservation des métadonnées** : Les formulaires ou textes vectoriels du PDF source ne sont pas altérés ni convertis en image basse résolution.

---

*Développé pour les professionnels exigeants en matière de conformité, de rapidité et d'authenticité documentaire.*
