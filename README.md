# Guess The Car Bot v2.0

Un bot Discord pour deviner les marques et modèles de voitures.

## Installation

1. Clonez le repository
2. Installez les dépendances: `npm install`
3. Copiez `.env.example` vers `.env` et configurez vos variables
4. Initialisez la base de données: `npm run migrate`
5. Importez les données: `npm run seed`
6. Démarrez l'application: `npm start`

## Développement

- `npm run dev` - Mode développement avec rechargement automatique
- `npm test` - Lance les tests
- `npm run lint` - Vérifie le code

## Structure du projet

- `src/api/` - API REST
- `src/bot/` - Bot Discord
- `src/core/` - Logique métier
- `src/shared/` - Code partagé

## Commands Discord

- `/guesscar` - Démarre une partie
- `/abandon` - Abandonne la partie
- `/classement` - Affiche le classement  
- `/stats` - Affiche les statistiques
- `/aide` - Affiche l'aide
