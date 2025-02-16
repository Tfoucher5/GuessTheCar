// api.js
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
    db.query('SELECT * FROM marques', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des marques:', err);
            return res.status(500).send('Erreur interne du serveur');
        }
        res.json(results);
    });
});

// Route pour récupérer les modèles d'une marque
app.get('/api/models/:makeId', (req, res) => {
    const makeId = req.params.makeId;
    db.query('SELECT * FROM modeles WHERE marque_id = ?', [makeId], (err, results) => {
        if (err) {
            console.error(`Erreur lors de la récupération des modèles pour la marque ${makeId}:`, err);
            return res.status(500).send('Erreur interne du serveur');
        }
        res.json(results);
    });
});

// Route pour récupérer une voiture aléatoire
app.get('/api/random-car', async (req, res) => {
    try {
        const makes = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM marques', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        
        if (!makes || makes.length === 0) {
            return res.status(404).send('Aucune marque disponible');
        }
        
        const randomMake = makes[Math.floor(Math.random() * makes.length)];
        const models = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM modeles WHERE marque_id = ?', [randomMake.id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (!models || models.length === 0) {
            return res.status(404).send(`Aucun modèle disponible pour ${randomMake.nom}`);
        }

        const randomModel = models[Math.floor(Math.random() * models.length)];

        res.json({
            make: randomMake.nom,
            model: randomModel.nom,
            makeId: randomMake.id,
            country: randomMake.pays,
            modelLength: randomModel.nom.length,
            makeLength: randomMake.nom.length,
            firstLetter: randomMake.nom[0],
            modelFirstLetter: randomModel.nom[0]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).send('Erreur interne du serveur');
    }
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`API en cours d'exécution sur http://localhost:${port}`);
});
