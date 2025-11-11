class Car {
    constructor(id, model, brand, difficulty = 1, imageUrl = null, brandId = null, country = null, modelDate = null) {
        this.id = id;
        this.model = model;
        this.brand = brand;
        this.difficulty = difficulty;
        this.imageUrl = imageUrl;
        this.brandId = brandId;
        this.country = country || 'Inconnu';
        this.modelDate = modelDate || new Date().getFullYear();
    }

    /**
     * Crée une instance Car depuis les données de base
     */
    static fromDatabase(data) {
        return new Car(
            data.id,
            data.model,
            data.brand,
            data.difficulty || data.difficulty_level || 1,
            data.imageUrl || data.image_url || null,
            data.brandId || data.brand_id || null,
            data.country || 'Inconnu',
            data.modelDate || data.year || new Date().getFullYear()
        );
    }

    /**
     * Vérifie si la voiture est valide pour le jeu
     */
    isValid() {
        return !!(
            this.id &&
            this.model &&
            this.brand &&
            this.model.length > 0 &&
            this.brand.length > 1 &&
            this.difficulty >= 1 &&
            this.difficulty <= 3
        );
    }

    /**
     * Obtient le nom complet de la voiture
     */
    getFullName() {
        return `${this.brand} ${this.model}`;
    }

    /**
     * Obtient le texte de difficulté
     */
    getDifficultyText() {
        return this.getDifficultyName();
    }

    /**
     * Propriétés utilisées dans GameState pour les indices
     */
    get makeLength() {
        return this.brand ? this.brand.replace(/\s/g, '').length : 0;
    }

    get modelLength() {
        return this.model ? this.model.replace(/\s/g, '').length : 0;
    }

    get firstLetter() {
        return this.brand ? this.brand.charAt(0).toUpperCase() : '';
    }

    get modelFirstLetter() {
        return this.model ? this.model.charAt(0).toUpperCase() : '';
    }

    get make() {
        return this.brand; // Alias pour compatibilité
    }

    get makeId() {
        return this.brandId; // Alias pour compatibilité
    }

    /**
     * Convertit en format base de données
     */
    toDatabase() {
        return {
            id: this.id,
            name: this.model,
            brand_id: this.brandId,
            difficulty_level: this.difficulty,
            image_url: this.imageUrl,
            year: this.modelDate
        };
    }

    /**
     * Vérifie si une réponse correspond à la marque
     */
    checkBrand(guess) {
        if (!guess || typeof guess !== 'string') return false;
        const normalizedGuess = this.normalizeString(guess);
        const normalizedBrand = this.normalizeString(this.brand);
        return normalizedBrand.includes(normalizedGuess) || normalizedGuess.includes(normalizedBrand);
    }

    /**
     * Vérifie si une réponse correspond au modèle
     */
    checkModel(guess) {
        if (!guess || typeof guess !== 'string') return false;
        const normalizedGuess = this.normalizeString(guess);
        const normalizedModel = this.normalizeString(this.model);
        return normalizedModel.includes(normalizedGuess) || normalizedGuess.includes(normalizedModel);
    }

    /**
     * Vérifie si une réponse correspond à la marque ET au modèle
     */
    checkFullCar(guess) {
        if (!guess || typeof guess !== 'string') return false;
        const normalizedGuess = this.normalizeString(guess);
        const fullCar = this.normalizeString(`${this.brand} ${this.model}`);
        return fullCar.includes(normalizedGuess) || (this.checkBrand(guess) && this.checkModel(guess));
    }

    /**
     * Normalise une chaîne pour la comparaison
     */
    normalizeString(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Retire les accents
            .replace(/[^a-z0-9\s]/g, '') // Garde seulement lettres, chiffres, espaces
            .replace(/\s+/g, ' ') // Normalise les espaces
            .trim();
    }

    /**
     * Obtient les points de base selon la difficulté
     */
    getBasePoints() {
        switch (this.difficulty) {
        case 1: return 10; // Facile
        case 2: return 15; // Moyen
        case 3: return 25; // Difficile
        default: return 10;
        }
    }


    /**
     * Obtient le nom de la difficulté
     */
    getDifficultyName() {
        switch (this.difficulty) {
        case 1: return 'Facile';
        case 2: return 'Moyen';
        case 3: return 'Difficile';
        default: return 'Inconnu';
        }
    }

    /**
     * Convertit en JSON pour l'affichage
     */
    toJSON() {
        return {
            id: this.id,
            model: this.model,
            brand: this.brand,
            country: this.country,
            modelDate: this.modelDate,
            difficulty: this.difficulty,
            difficultyName: this.getDifficultyName(),
            basePoints: this.getBasePoints(),
            imageUrl: this.imageUrl,
            brandId: this.brandId,
            fullName: this.getFullName(),
            makeLength: this.makeLength,
            modelLength: this.modelLength,
            firstLetter: this.firstLetter,
            modelFirstLetter: this.modelFirstLetter
        };
    }

    /**
     * Obtient une représentation textuelle
     */
    toString() {
        return `${this.brand} ${this.model} (Difficulté: ${this.getDifficultyName()})`;
    }
}

module.exports = Car;
