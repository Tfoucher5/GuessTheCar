const { validateDifficulty } = require('../../shared/utils/validation');

class Car {
    constructor(data) {
        this.id = data.id || null;
        this.make = data.make;
        this.model = data.model;
        this.makeId = data.makeId || data.marque_id;
        this.country = data.country || data.pays;
        this.modelDate = data.modelDate || data.annee;
        this.difficulty = validateDifficulty(data.difficulty || data.difficulte);

        // Propriétés calculées
        this.makeLength = this.make ? this.make.length : 0;
        this.modelLength = this.model ? this.model.length : 0;
        this.firstLetter = this.make ? this.make[0].toUpperCase() : '';
        this.modelFirstLetter = this.model ? this.model[0].toUpperCase() : '';
    }

    /**
     * Obtient le texte de difficulté
     */
    getDifficultyText() {
        switch (this.difficulty) {
            case 1: return 'facile';
            case 2: return 'moyen';
            case 3: return 'difficile';
            default: return 'inconnue';
        }
    }

    /**
     * Obtient la réponse complète
     */
    getFullName() {
        return `${this.make} ${this.model}`;
    }

    /**
     * Vérifie si la voiture est valide
     */
    isValid() {
        return !!(this.make && this.model && this.country && this.difficulty);
    }

    /**
     * Convertit en objet simple
     */
    toJSON() {
        return {
            id: this.id,
            make: this.make,
            model: this.model,
            makeId: this.makeId,
            country: this.country,
            modelDate: this.modelDate,
            difficulty: this.difficulty,
            difficultyText: this.getDifficultyText(),
            makeLength: this.makeLength,
            modelLength: this.modelLength,
            firstLetter: this.firstLetter,
            modelFirstLetter: this.modelFirstLetter
        };
    }

    /**
     * Crée une instance depuis des données de base
     */
    static fromDatabase(dbData) {
        return new Car({
            id: dbData.id,
            make: dbData.marque_nom || dbData.make,
            model: dbData.nom || dbData.model,
            makeId: dbData.marque_id || dbData.makeId,
            country: dbData.pays || dbData.country,
            modelDate: dbData.annee || dbData.modelDate,
            difficulty: dbData.difficulte || dbData.difficulty
        });
    }
}

module.exports = Car;