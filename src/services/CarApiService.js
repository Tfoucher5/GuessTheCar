const axios = require('axios');

class CarApiService {
    // Méthode pour récupérer toutes les marques via l'API
    static async getAllMakes() {
        try {
            const response = await axios.get('http://0.0.0.0:3000/api/makes');
            return response.data;  // Retourne les marques récupérées
        } catch (error) {
            console.error('Erreur lors de la récupération des marques:', error);
            return [];
        }
    }

    // Méthode pour récupérer les modèles d'une marque donnée via l'API
    static async getModelsForMake(makeId) {
        try {
            const response = await axios.get(`http://0.0.0.0:3000/api/models/${makeId}`);
            return response.data;  // Retourne les modèles récupérés pour cette marque
        } catch (error) {
            console.error(`Erreur lors de la récupération des modèles pour la marque ${makeId}:`, error);
            return [];
        }
    }

    // Méthode pour récupérer une voiture aléatoire via l'API
    static async getRandomCar() {
        try {
            const response = await axios.get('http://0.0.0.0:3000/api/random-car');
            return response.data;  // Retourne la voiture aléatoire récupérée
        } catch (error) {
            console.error('Erreur lors de la récupération des données de la voiture:', error);
            return null;
        }
    }
}

module.exports = CarApiService;
