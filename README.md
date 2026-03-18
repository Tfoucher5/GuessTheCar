
# 🚗 GuessTheCar — Discord Bot (Archivé & Open‑Source)

https://img.shields.io/badge/Status-Archived-lightgrey
https://img.shields.io/badge/License-MIT-yellow.svg

**GuessTheCar** est un bot Discord développé pour proposer un jeu de devinettes automobile.  
Le projet est désormais **archivé**, mais le code source est **public** et **réutilisable librement** sous licence MIT.

---

## 📌 Statut du projet

- Le développement est **arrêté**
- Le bot **n’est plus en ligne ni maintenu**
- Le dépôt GitHub est **public**
- Tout le monde peut **fork**, **modifier**, **réutiliser** et **redistribuer** le code
- La licence choisie est **MIT**, permissive et adaptée à la réutilisation

---

## 🎯 Objectif du bot

GuessTheCar proposait un jeu où les joueurs tentaient de deviner :

- Une **marque**
- Puis un **modèle**

…à partir d’indices générés automatiquement.

Le but : offrir une expérience fun aux passionnés d’automobile.

---

## 🕹️ Fonctionnement du jeu (avant archivage)

### ✔️ Déroulement d’une partie

1. Un joueur lance une partie avec la commande `/guesscar`
2. Le bot affiche le **pays d’origine**
3. Le joueur propose une **marque**
4. Une fois trouvée, il doit deviner le **modèle**
5. Le bot donne des **indices progressifs**
6. Le joueur gagne des **points** selon :
   - la vitesse
   - la précision
   - le nombre d’indices utilisés

---

### 🧩 Commandes principales

| Commande | Description |
|----------|-------------|
| `/guesscar` | Lance une nouvelle partie |
| `/profile` | Affiche les statistiques du joueur |
| `/leaderboard` | Affiche le classement global |
| `/collection` | Montre les voitures gagnées |
| `/help` | Liste les commandes et explique les règles |
| `/giveup` | Abandonne la partie en cours |

---

## 🏆 Fonctionnalités principales

- 🔍 Jeu de devinettes automobile basé sur marques & modèles  
- 🌍 Indices (pays, lettres, catégories…)  
- 🏅 Système de points et classement  
- 📊 Statistiques avancées des joueurs  
- 🎒 Collection virtuelle de voitures trouvées  
- 🤖 Fonctionne sur plusieurs serveurs Discord  
- 🧩 Architecture modulaire (commands, handlers, utils)

---

## 🔓 Open‑Source & Réutilisation

Le dépôt est en open‑source : chacun est libre de l’utiliser.

### ✔️ Autorisé :
- Lire le code  
- Le modifier  
- Le forker  
- Le réutiliser dans un autre projet  
- Le redistribuer  
- Créer une version améliorée du bot  

### ❗ Obligations :
- Conserver la licence MIT dans les versions dérivées

---

## 📄 Licence

Le projet est distribué sous licence **MIT**.

Retrouvez le texte complet dans le fichier `LICENSE`.

---

## 📦 Installation (pour relancer le bot)

### 🔧 1. Cloner le repository

```bash
git clone https://github.com/your-username/GuessTheCar.git
cd GuessTheCar
```

### 📦 2. Installer les dépendances

```bash
npm install
```

ou

```bash
yarn install
```

### 🔑 3. Ajouter votre token Discord

Créer un fichier `.env` :

```
DISCORD_TOKEN=votre_token_ici
```

### ▶️ 4. Lancer le bot

```bash
node index.js
```

---

## 🛠️ Technologies utilisées

- **Node.js**
- **Discord.js**
- Scripts internes pour la logique du jeu
- Base de données JSON / DB (selon versions)

---

## 🙌 Contribution

Le dépôt est archivé → les contributions directes ne seront pas mergées.  
MAIS :  
➡️ Vous êtes libre de créer vos propres forks, versions, ou améliorations.  
➡️ Le code est un point de départ pour tout projet similaire.

---

## 👨‍💻 Développeur

Projet conçu et développé par **Théo Foucher**.

---

## 🗃️ Statut final

Le bot n’est plus en ligne, mais son code reste disponible pour la communauté.  
Bonne exploration et bon développement 🚗💡

