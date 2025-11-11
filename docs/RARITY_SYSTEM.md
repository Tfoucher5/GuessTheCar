# Système de Rareté des Voitures

## Vue d'ensemble

Le système de rareté classe les voitures en 5 catégories basées sur leur présence en France. Chaque rareté a :
- **Points de base** différents
- **Probabilité d'apparition** (spawn rate)
- **Poids de spawn** pour le random weighted

## Niveaux de Rareté

| Rareté | Emoji | Probabilité | Points | Spawn Weight | Exemples |
|--------|-------|-------------|--------|--------------|----------|
| **Commune** | 🟢 | 45% | 10 | 450 | Clio, 208, Corolla |
| **Peu commune** | 🔵 | 30% | 25 | 300 | Mustang, Classe E, RAV4 |
| **Rare** | 🟣 | 18% | 50 | 180 | Supra, Land Cruiser, AMG GT |
| **Épique** | 🟠 | 6% | 100 | 60 | M5, R8, Corvette, NSX |
| **Légendaire** | 🔴 | 1% | 200 | 10 | Tous les Ferrari |

## Distribution des Voitures

### 🟢 Commune (37 modèles)
Voitures très courantes en France, majoritairement françaises et quelques modèles populaires européens.

**Marques :** Peugeot (208, 308, 3008, 5008, 2008, Rifter, Partner), Renault (Clio, Megane, Captur, Scenic, Zoe, Twingo), Toyota (Corolla, Yaris), Ford (Focus, Fiesta), BMW (Série 1, 3, X1), Mercedes (Classe A, C, GLA), Audi (A3), Honda (Civic)

### 🔵 Peu commune (19 modèles)
Voitures assez courantes mais moins omniprésentes.

**Marques :** Peugeot (508), Renault (Kadjar, Talisman, Koleos, Arkana), Toyota (Camry, RAV4, Prius), Ford (Mustang), BMW (Série 5, X3, X5), Mercedes (Classe E, GLC, GLE, Classe S, EQS), Audi (A4, A6, Q3, Q5, Q7, TT), Honda (Accord, CR-V, HR-V)

### 🟣 Rare (21 modèles)
Voitures peu courantes en France (sportives, modèles US, électriques haut de gamme).

**Marques :** Toyota (Highlander, Supra, Land Cruiser, Avalon, Sienna), Ford (F-150, Explorer, Escape, Bronco, Edge, Ranger, Expedition), BMW (M3, i4, iX), Mercedes (AMG GT, SL), Audi (e-tron), Honda (Pilot, Odyssey, Passport, Ridgeline, Insight), Chevrolet (Cruze, Malibu, Equinox, Traverse, Blazer)

### 🟠 Épique (11 modèles)
Voitures rares : sportives premium et modèles US haut de gamme.

**Marques :** BMW (M5), Audi (R8, RS6), Chevrolet (Silverado, Camaro, Corvette, Tahoe, Suburban), Honda (NSX)

### 🔴 Légendaire (10 modèles)
Supercars et hypercars Ferrari - extrêmement rares.

**Modèles :** F8 Tributo, Roma, Portofino, SF90 Stradale, 296 GTB, LaFerrari, Purosangue, 812 Superfast, Monza SP1, Daytona SP3

## Modèles Supprimés

Les variantes électriques suivantes ont été supprimées car ce sont des doublons :
- **e-208** (id 39) → doublon de 208
- **e-2008** (id 40) → doublon de 2008

## Intégration dans le Code

### 1. Sélection Aléatoire Pondérée

Pour sélectionner une voiture en fonction de sa rareté :

```javascript
// Dans CarManager.js ou équivalent
async getRandomCarByWeight() {
    // Récupérer toutes les voitures avec leur spawn_weight
    const { data: cars, error } = await this.supabase
        .from('models')
        .select('*, brands(*)')
        .order('spawn_weight', { ascending: false });

    if (error || !cars || cars.length === 0) {
        throw new Error('Impossible de charger les voitures');
    }

    // Calculer le total des poids
    const totalWeight = cars.reduce((sum, car) => sum + car.spawn_weight, 0);

    // Générer un nombre aléatoire
    let random = Math.random() * totalWeight;

    // Sélectionner la voiture
    for (const car of cars) {
        random -= car.spawn_weight;
        if (random <= 0) {
            return car;
        }
    }

    // Fallback (ne devrait jamais arriver)
    return cars[0];
}
```

### 2. Affichage de la Rareté

```javascript
// Fonction helper pour obtenir l'emoji de rareté
getRarityEmoji(rarity) {
    const emojiMap = {
        'commune': '🟢',
        'peu_commune': '🔵',
        'rare': '🟣',
        'epique': '🟠',
        'legendaire': '🔴'
    };
    return emojiMap[rarity] || '⚪';
}

// Fonction helper pour obtenir la couleur de rareté
getRarityColor(rarity) {
    const colorMap = {
        'commune': '#95C455',      // Vert
        'peu_commune': '#5592C4',  // Bleu
        'rare': '#9B59B6',         // Violet
        'epique': '#E67E22',       // Orange
        'legendaire': '#E74C3C'    // Rouge
    };
    return colorMap[rarity] || '#95A5A6';
}
```

### 3. Calcul des Points

```javascript
// Dans ScoreCalculator.js
calculatePoints(car, timeSpent, attempts, prestigeMultiplier = 1.0) {
    // Points de base selon la rareté
    let points = car.base_points || 10;

    // Bonus de temps (plus rapide = plus de points)
    const timeBonus = this.calculateTimeBonus(timeSpent);

    // Bonus d'essais (moins d'essais = plus de points)
    const attemptsBonus = this.calculateAttemptsBonus(attempts);

    // Calcul final
    const finalPoints = points * (1 + timeBonus + attemptsBonus) * prestigeMultiplier;

    return Math.round(finalPoints);
}
```

### 4. Affichage dans les Embeds

```javascript
// Dans createGameStartEmbed
const rarityEmoji = this.getRarityEmoji(car.rarity);
const rarityColor = this.getRarityColor(car.rarity);

const embed = new EmbedBuilder()
    .setColor(rarityColor)
    .setTitle(`🚗 Nouvelle partie - ${rarityEmoji} ${car.rarity.replace('_', ' ').toUpperCase()}`)
    .setDescription(
        `Devinez cette voiture !\n\n` +
        `**Rareté:** ${rarityEmoji} ${car.rarity.replace('_', ' ')}\n` +
        `**Points possibles:** ${car.base_points} pts de base\n` +
        `**Pays:** ${car.brands.country || 'Inconnu'}`
    );
```

### 5. Collection de Voitures

Ajouter un système de collection par rareté :

```javascript
// Statistiques de collection par rareté
async getCollectionStatsByRarity(userId) {
    const { data, error } = await this.supabase
        .from('user_car_collection')
        .select(`
            model_id,
            models (
                rarity,
                base_points
            )
        `)
        .eq('user_id', userId);

    if (error) return null;

    // Grouper par rareté
    const stats = {
        commune: { found: 0, total: 0 },
        peu_commune: { found: 0, total: 0 },
        rare: { found: 0, total: 0 },
        epique: { found: 0, total: 0 },
        legendaire: { found: 0, total: 0 }
    };

    // Compter les trouvées
    data.forEach(item => {
        const rarity = item.models.rarity;
        stats[rarity].found++;
    });

    // Compter les totaux
    const { data: allCars } = await this.supabase
        .from('models')
        .select('rarity');

    allCars.forEach(car => {
        stats[car.rarity].total++;
    });

    return stats;
}
```

## Migration

Pour appliquer le système de rareté à ta base de données :

```bash
# Se connecter à Supabase et exécuter le script
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/database/update-car-rarity-system.sql
```

Ou via l'interface Supabase :
1. Va dans l'éditeur SQL
2. Copie-colle le contenu de `update-car-rarity-system.sql`
3. Exécute le script

## Vérification

Après migration, vérifie que tout est correct :

```sql
-- Afficher les statistiques par rareté
SELECT * FROM v_rarity_statistics;

-- Vérifier les voitures légendaires
SELECT b.name, m.name, m.base_points, m.spawn_weight
FROM models m
JOIN brands b ON m.brand_id = b.id
WHERE m.rarity = 'legendaire';

-- Vérifier que les variantes ont été supprimées
SELECT * FROM models WHERE name LIKE 'e-%';
-- Doit retourner 0 ligne
```

## Améliorations Futures

- **Événements spéciaux** : Augmenter temporairement le spawn rate des légendaires
- **Collection rewards** : Récompenses pour compléter une rareté
- **Pity system** : Garantir une épique/légendaire après X parties sans
- **Streak bonus** : Bonus de points pour les raretés élevées trouvées en série
- **Rareté du jour** : Une rareté avec spawn rate augmenté chaque jour
