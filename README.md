# ⚡ Neon Ricochet: Rogue Synth
> **Commercial HTML5 / 2D Physics Breaker Roguelite Web Game**  
> Turnkey browser game package built for high retention, ad monetization, and resale on Flippa.

🎮 **Jouer en ligne (Live Demo)** : [https://ame729.github.io/neon-ricochet/](https://ame729.github.io/neon-ricochet/)  
📁 **Dépôt GitHub** : [https://github.com/AME729/neon-ricochet](https://github.com/AME729/neon-ricochet)  
🕹️ **Genre & Style** : Physics Breaker / Peglin-Style Roguelite avec esthétique Rétro Synthwave Géométrique

---

## 🎮 Aperçu du Jeu (Game Overview)

**Neon Ricochet: Rogue Synth** est un jeu d'arcade roguelite 2D combinant la physique addictive de ricochet (style *Peglin*, *BBTAN* et *Breakout*) avec la profondeur tactique des choix de reliques d'un roguelite moderne. 

Le joueur vise et propulse des volées d'orbes d'énergie néon contre des grilles géométriques descendantes (Hexagones, Cristaux de Diamant, Prismes Réflecteurs, Bombes Plasma, Nœuds Lasers et Boss Titans).

### Caractéristiques Principales
- **Zero-Dependency Sound Synth** : Synthétiseur procédural Web Audio API qui génère des arpèges pentatoniques harmoniques à chaque ricochet (l'impact répété crée une mélodie synthwave en temps réel !), basses profondes, lasers et fanfare de victoire sans aucun MP3 externe.
- **Moteur Canvas 2D 60 FPS** : Physique de ricochet vectorielle ultra-fluide avec calcul de trajectoire prédictive en pointillés, tremblement d'écran, explosions de particules néon et textes de dégâts flottants.
- **Système de Reliques Roguelite (Draft)** :
  - *Splitter Matrix* : 22% de chance de cloner des mini-orbes à chaque impact.
  - *Arc Discharge* : Les impacts projettent des éclairs sur les nœuds adjacents.
  - *Quantum Piercer* : Transperce les nœuds sans rebondir.
  - *Plasma Nova* : Libère une onde de choc tous les 8 rebonds.
  - *Kinetic Stacker* : Augmente les dégâts à chaque rebond consécutif.
  - *Multi-Ball Booster* : Augmente la réserve permanente d'orbes.
- **Métaprogression Permanente (Synth Lab)** : Crédits récoltés pour acheter des améliorations définitives (Batterie d'orbes initiale, Amplification plasma, Coups critiques, Barrière EMP).
- **Multiplateforme Mobile & Desktop** : Visez et tirez intuitivement à la souris ou au doigt sur écran tactile.
- **Classement Mondial Persistant** : Sauvegarde des scores, vagues et builds via API REST Express et fichier `leaderboard.json`.

---

## 💰 Architecture de Monétisation Intégrée (Flippa Ready)

Le jeu intègre une infrastructure prête pour la rentabilité immédiate :

1. **Publicités Récompensées (Rewarded Video Ads)** :
   - *Réanimation d'urgence* : Nettoie les lignes critiques et restaure +2 boucliers si la grille est franchie.
   - *Multiplicateur x2 de crédits* : Double les gains de fin de partie.
   - Compatible avec Google AdSense for Games (H5), CrazyGames SDK, AdinPlay ou Poki.
2. **Boutique d'Achats Intégrés (IAP)** :
   - Packs de crédits ($1.99, $4.99, $9.99).
   - *Pass VIP Synthwave* ($14.99) : Débloque tous les skins d'orbes + multiplicateur permanent 2x crédits.
   - Simulateur de passerelle sécurisée (prêt pour Stripe / PayPal).
3. **Tableau de Bord Propriétaire Flippa (`⚙️ FLIPPA`)** :
   - Indicateurs en temps réel : sessions, impressions publicitaires, eCPM moyen et revenus simulés.
   - Outils de test et triche pour acheteurs : ajout de crédits, God Mode, apparition instantanée du Boss Titan.

---

## 🚀 Installation & Lancement Rapide

### Option A : Lancement direct sans serveur (Static HTML)
Double-cliquez simplement sur `public/index.html` dans n'importe quel navigateur moderne (Chrome, Firefox, Safari, Edge).

### Option B : Lancement avec le Serveur Node.js (Recommandé)
```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur
npm start

# 3. Ouvrir votre navigateur sur :
# http://localhost:3000
```

### Option C : Déploiement Conteneurisé Docker
```bash
docker build -t neon-ricochet .
docker run -p 3000:3000 neon-ricochet
```

---

## 📁 Structure du Projet

```text
neon-ricochet/
├── Dockerfile                  # Configuration conteneur Docker
├── package.json                # Dépendances Node.js & Express
├── server.js                   # Serveur API REST & Leaderboard JSON
├── leaderboard.json            # Base de données persistante des scores
├── README.md                   # Documentation technique
├── FLIPPA_LISTING_TEMPLATE.md  # Modèle d'annonce prêt à copier pour Flippa
└── public/
    ├── index.html              # Interface utilisateur & arène Canvas
    ├── css/
    │   └── style.css           # Thème rétro synthwave & animations glow
    └── js/
        ├── config.js           # Équilibrage physique, reliques, skins & IAP
        ├── audio.js            # Synthétiseur sonore procédural Web Audio
        ├── meta.js             # Persistance localStorage & lab d'améliorations
        ├── monetization.js     # Gestionnaire des pubs récompensées & checkout IAP
        ├── entities.js         # Classes Ball, GameNode, Particles, FloatingText
        ├── engine.js           # Moteur Canvas 2D 60 FPS & trajectoire laser
        ├── admin.js            # Panneau propriétaire Flippa & simulateur de métriques
        └── app.js              # Orchestrateur des écrans, inputs & modales
```

---

## 📄 Licence Commerciale
Ce package est fourni avec une licence commerciale complète libre de droits, prêt pour la mise en vente immédiate sur Flippa ou toute marketplace d'actifs numériques.
