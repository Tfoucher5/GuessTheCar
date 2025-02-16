const axios = require('axios');

class CarApiService {
    static async getAllMakes() {
        try {
            const response = await axios.get('https://www.carqueryapi.com/api/0.3/?cmd=getMakes');
            return response.data.Makes;
        } catch (error) {
            console.error('Erreur lors de la récupération des marques:', error);
            return null;
        }
    }

    static async getModelsForMake(make) {
        try {
            const response = await axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${make}`);
            return response.data.Models;
        } catch (error) {
            console.error(`Erreur lors de la récupération des modèles pour ${make}:`, error);
            return null;
        }
    }

    static async getRandomCar() {
        try {
            const makes = await this.getAllMakes();
            if (!makes?.length) throw new Error('Aucune marque disponible');

            const randomMake = makes[Math.floor(Math.random() * makes.length)];
            const models = await this.getModelsForMake(randomMake.make_id);
            if (!models?.length) throw new Error(`Aucun modèle disponible pour ${randomMake.make_display}`);

            const randomModel = models[Math.floor(Math.random() * models.length)];

            return {
                make: randomMake.make_display,
                model: randomModel.model_name,
                makeId: randomMake.make_id,
                country: randomMake.make_country,
                isCommon: randomMake.make_is_common === "1",
                modelLength: randomModel.model_name.length,
                makeLength: randomMake.make_display.length,
                firstLetter: randomMake.make_display[0],
                modelFirstLetter: randomModel.model_name[0]
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return null;
        }
    }
}

module.exports = CarApiService;