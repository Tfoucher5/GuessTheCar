const mysql = require('mysql2');

class CarApiService {
    // Créer une connexion à la base de données
    static db = mysql.createConnection({
        host: '10.192.145.15',
        user: 'theo',
        password: 'Not24get',
        database: 'voitures'
    });

    // Méthode pour récupérer toutes les marques
    static async getAllMakes() {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM marques', (err, results) => {
                if (err) {
                    console.error('Erreur lors de la récupération des marques:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }

    // Méthode pour récupérer les modèles d'une marque donnée
    static async getModelsForMake(makeId) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM modeles WHERE marque_id = ?', [makeId], (err, results) => {
                if (err) {
                    console.error(`Erreur lors de la récupération des modèles pour la marque ID ${makeId}:`, err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }

    // Méthode pour récupérer une voiture aléatoire
    static async getRandomCar() {
        try {
            const makes = await this.getAllMakes();
            if (!makes?.length) throw new Error('Aucune marque disponible');

            const randomMake = makes[Math.floor(Math.random() * makes.length)];
            const models = await this.getModelsForMake(randomMake.id);
            if (!models?.length) throw new Error(`Aucun modèle disponible pour ${randomMake.nom}`);

            const randomModel = models[Math.floor(Math.random() * models.length)];

            return {
                make: randomMake.nom,
                model: randomModel.nom,
                makeId: randomMake.id,
                country: randomMake.pays,
                modelLength: randomModel.nom.length,
                makeLength: randomMake.nom.length,
                firstLetter: randomMake.nom[0],
                modelFirstLetter: randomModel.nom[0]
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return null;
        }
    }
}

module.exports = CarApiService;
