class Car {
    constructor(id, model, brand, difficulty = 1, imageUrl = null, brandId = null, country = null, modelDate = null, rarity = 'commune', basePoints = 10, spawnWeight = 450) {
        this.id = id;
        this.model = model;
        this.brand = brand;
        this.difficulty = difficulty; // Gardé pour compatibilité mais non utilisé
        this.imageUrl = imageUrl;
        this.brandId = brandId;
        this.country = country || 'Inconnu';
        this.modelDate = modelDate || new Date().getFullYear();

        // Nouveau système de rareté
        this.rarity = rarity || 'commune';
        this.basePoints = basePoints || 10;
        this.spawnWeight = spawnWeight || 450;
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
            data.modelDate || data.year || new Date().getFullYear(),
            data.rarity || 'commune',
            data.basePoints || data.base_points || 10,
            data.spawnWeight || data.spawn_weight || 450
        );
    }

    /**
     * Vérifie si la voiture est valide pour le jeu
     */
    isValid() {
        const validRarities = ['commune', 'peu_commune', 'rare', 'epique', 'legendaire'];
        return !!(
            this.id &&
            this.model &&
            this.brand &&
            this.model.length > 0 &&
            this.brand.length > 1 &&
            validRarities.includes(this.rarity) &&
            this.basePoints > 0 &&
            this.spawnWeight > 0
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
            difficulty_level: this.difficulty, // Pour compatibilité
            rarity: this.rarity,
            base_points: this.basePoints,
            spawn_weight: this.spawnWeight,
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
     * Obtient les points de base selon la rareté
     */
    getBasePoints() {
        return this.basePoints;
    }

    /**
     * Obtient le nom de la rareté
     */
    getRarityName() {
        switch (this.rarity) {
        case 'commune': return 'Commune';
        case 'peu_commune': return 'Peu commune';
        case 'rare': return 'Rare';
        case 'epique': return 'Épique';
        case 'legendaire': return 'Légendaire';
        default: return 'Commune';
        }
    }

    /**
     * Obtient l'emoji de la rareté
     */
    getRarityEmoji() {
        switch (this.rarity) {
        case 'commune': return '🟢';
        case 'peu_commune': return '🔵';
        case 'rare': return '🟣';
        case 'epique': return '🟠';
        case 'legendaire': return '🔴';
        default: return '🟢';
        }
    }

    /**
     * Obtient le texte complet de la rareté (emoji + nom)
     */
    getRarityText() {
        return `${this.getRarityEmoji()} ${this.getRarityName()}`;
    }

    /**
     * Obtient le nom de la difficulté (pour compatibilité)
     * @deprecated Utilisez getRarityName() à la place
     */
    getDifficultyName() {
        return this.getRarityName();
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
            difficulty: this.difficulty, // Pour compatibilité
            rarity: this.rarity,
            rarityName: this.getRarityName(),
            rarityEmoji: this.getRarityEmoji(),
            rarityText: this.getRarityText(),
            basePoints: this.getBasePoints(),
            spawnWeight: this.spawnWeight,
            imageUrl: this.imageUrl,
            brandId: this.brandId,
            fullName: this.getFullName(),
            makeLength: this.makeLength,
            modelLength: this.modelLength,
            firstLetter: this.firstLetter,
            modelFirstLetter: this.modelFirstLetter,
            // Pour compatibilité avec l'ancien système
            difficultyName: this.getRarityName()
        };
    }

    /**
     * Obtient une représentation textuelle
     */
    toString() {
        return `${this.brand} ${this.model} (${this.getRarityText()})`;
    }
}

module.exports = Car;
