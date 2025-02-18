const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000; // Ou un autre port disponible

// Connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'theo',
    password: 'Not24get',
    database: 'voitures'
});

// Stockage des marques et des modèles en mémoire
let makesCache = [];
let modelsCache = {};

const loadData = async () => {
    try {
        // Charger les marques
        makesCache = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM marques', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Charger les modèles pour chaque marque
        for (let make of makesCache) {
            modelsCache[make.id] = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM modeles WHERE marque_id = ?', [make.id], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        }

        console.log('Données préchargées avec succès.');
    } catch (error) {
        console.error('Erreur lors du préchargement des données:', error);
    }
};

// Charger les données au démarrage
loadData();

// Vérifier la connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        process.exit(1);  // Sortir si la connexion échoue
    }
    console.log('Connecté à la base de données MySQL');
});

// Route pour récupérer toutes les marques
app.get('/api/makes', (req, res) => {
    res.json(makesCache); // Retourner les marques stockées en mémoire
});

// Route pour récupérer les modèles d'une marque
app.get('/api/models/:makeId', (req, res) => {
    const makeId = req.params.makeId;
    const models = modelsCache[makeId];
    if (models) {
        res.json(models); // Retourner les modèles en mémoire pour la marque donnée
        console.log('Modèles pour la marque', makeId, ':', models);
    } else {
        res.status(404).send('Aucun modèle trouvé pour cette marque');
    }
});

// Route pour récupérer une voiture aléatoire
app.get('/api/random-car', (req, res) => {
    if (makesCache.length === 0) {
        return res.status(404).send('Aucune marque disponible');
    }

    const randomMake = makesCache[Math.floor(Math.random() * makesCache.length)];
    const models = modelsCache[randomMake.id];
    if (!models || models.length === 0) {
        return res.status(404).send(`Aucun modèle disponible pour ${randomMake.nom}`);
    }

    const randomModel = models[Math.floor(Math.random() * models.length)];

    console.log('Voiture aléatoire:', randomMake.nom, randomModel.nom);

    res.json({
        make: randomMake.nom,
        model: randomModel.nom,
        makeId: randomMake.id,
        modelDifficulte: randomModel.difficulte,
        modelDate: randomModel.annee,
        country: randomMake.pays,
        modelLength: randomModel.nom.length,
        makeLength: randomMake.nom.length,
        firstLetter: randomMake.nom[0],
        modelFirstLetter: randomModel.nom[0]
    });
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`API en cours d'exécution sur http://localhost:${port}`);
});
