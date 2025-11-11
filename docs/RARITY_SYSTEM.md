# Système de Rareté des Voitures

## Vue d'ensemble

Le système de rareté classe les voitures en 5 catégories basées sur leur présence **INDIVIDUELLE** en France. Chaque rareté a :
- **Points de base** différents
- **Probabilité d'apparition** (spawn rate)
- **Poids de spawn** pour le random weighted

⚠️ **Important** : La rareté est assignée **modèle par modèle**, pas par marque. Une même marque peut avoir des modèles de différentes raretés.

## Niveaux de Rareté

| Rareté | Emoji | Probabilité | Points | Spawn Weight | Exemples |
|--------|-------|-------------|--------|--------------|----------|
| **Commune** | 🟢 | 45% | 10 | 450 | Clio, 208, Corolla, Golf, Polo |
| **Peu commune** | 🔵 | 30% | 25 | 300 | 3008, RAV4, Model 3, Classe E |
| **Rare** | 🟣 | 18% | 50 | 180 | Supra, F-150, Model S, Cayenne |
| **Épique** | 🟠 | 6% | 100 | 60 | M5, R8, Corvette, AMG GT, NSX |
| **Légendaire** | 🔴 | 1% | 200 | 10 | Ferrari, Lamborghini, Bugatti, McLaren |

## Distribution des Voitures

### 🟢 Commune (45% de spawn rate)
Voitures très courantes en France - modèles de base des marques populaires.

**Exemples :**
- **Marques françaises :** Peugeot 208, 308, 2008 | Renault Clio, Megane, Captur, Zoe, Twingo | Citroën C3, C4, Berlingo
- **Marques européennes :** Volkswagen Golf, Polo, T-Roc | BMW Série 1, 3, X1 | Mercedes Classe A, C, GLA | Audi A3
- **Marques asiatiques :** Toyota Corolla, Yaris | Honda Civic | Nissan Juke, Micra | Hyundai i20, i30
- **Marques low-cost :** Dacia (tous modèles), Fiat 500, Panda

### 🔵 Peu commune (30% de spawn rate)
Voitures assez courantes mais plus premium ou spécifiques.

**Exemples :**
- **SUVs moyens :** Peugeot 3008, 5008 | Renault Kadjar, Arkana | Toyota RAV4 | Nissan Qashqai, X-Trail
- **Berlines premium :** Peugeot 508 | Audi A4, A6 | BMW Série 5 | Mercedes Classe E, S
- **Électriques mainstream :** Tesla Model 3, Model Y | Hyundai Ioniq 5 | Kia EV6
- **SUVs premium :** Audi Q3, Q5, Q7 | BMW X3, X5 | Mercedes GLC, GLE | Volvo XC40, XC60

### 🟣 Rare (18% de spawn rate)
Voitures peu courantes en France - modèles sportifs, américains, ou très premium.

**Exemples :**
- **Sportives japonaises :** Toyota Supra, Land Cruiser
- **Modèles US :** Ford F-150, Bronco, Explorer, Ranger | Chevrolet Cruze, Malibu, Equinox, Traverse
- **Électriques premium :** Tesla Model S, Model X (base) | BMW i4, iX | Audi e-tron
- **SUVs premium :** Porsche Cayenne, Macan | Lexus RX, NX | Jaguar F-Pace
- **Sportives premium :** Mercedes SL | Volvo XC90

### 🟠 Épique (6% de spawn rate)
Voitures rares - sportives haute performance et supercars d'entrée de gamme.

**Exemples :**
- **Sportives allemandes :** BMW M3, M5 | Audi R8, RS6 | Mercedes AMG GT | Porsche 911 GT3, Taycan Turbo
- **Sportives américaines :** Chevrolet Corvette, Camaro | Dodge Challenger (base)
- **Trucks US premium :** Chevrolet Silverado, Tahoe, Suburban
- **Sportives japonaises :** Honda NSX
- **Supercars d'entrée :** Maserati, Aston Martin, Lotus
- **Électriques premium :** Tesla Roadster

### 🔴 Légendaire (1% de spawn rate)
Supercars et hypercars - véhicules d'exception extrêmement rares.

**Marques complètes :**
- **Ferrari** (tous modèles) : F8 Tributo, Roma, Portofino, SF90 Stradale, 296 GTB, LaFerrari, Purosangue, 812 Superfast
- **Lamborghini** : Aventador, Huracán, Urus, Revuelto
- **Bugatti** : Chiron, Veyron
- **McLaren** : 720S, Artura, GT
- **Pagani** : Huayra, Zonda
- **Koenigsegg** : Jesko, Regera
- **Ultra-luxury :** Rolls-Royce (tous), Bentley (tous)

## Modèles Supprimés

Seuls les **modèles de base** sont conservés. Toutes les variantes ont été supprimées :

### Variantes supprimées :
- **Variantes électriques :** e-208, e-2008, EQC, EQE, EQfortwo, etc.
- **Variantes performance :** Model S Plaid, Model X Plaid, Model 3 Performance, Hellcat, Demon
- **Trim levels :** Turbo S, GT3 RS, GT2 RS, Carrera 4S, Carrera S, STO, Tecnica, Performante, SVJ
- **Éditions spéciales :** JCW, Brabus, Dream Edition, Sapphire, Grand Touring, Competition, M Competition
- **Concepts cars :** Concept One, Concept Two, et tous les concepts

### Exemples de suppressions :
- ✅ **Garde :** 208 | ❌ **Supprime :** e-208 (variante électrique)
- ✅ **Garde :** Model S | ❌ **Supprime :** Model S Plaid (variante performance)
- ✅ **Garde :** 911 | ❌ **Supprime :** 911 Turbo S, 911 GT3 RS (trim levels)
- ✅ **Garde :** Huracán | ❌ **Supprime :** Huracán STO, Huracán Tecnica (variantes)
- ✅ **Garde :** Challenger | ❌ **Supprime :** Challenger Hellcat, Demon (variantes performance)

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
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/database/update-car-rarity-system-individual.sql
```

Ou via l'interface Supabase :
1. Va dans l'éditeur SQL de Supabase
2. Copie-colle le contenu de `scripts/database/update-car-rarity-system-individual.sql`
3. Exécute le script (cela va prendre quelques secondes)
4. Vérifie les statistiques avec les requêtes de vérification ci-dessous

## Vérification

Après migration, vérifie que tout est correct :

```sql
-- 1. Afficher les statistiques par rareté
SELECT * FROM v_rarity_statistics;
-- Devrait montrer ~45% commune, ~30% peu_commune, ~18% rare, ~6% epique, ~1% legendaire

-- 2. Vérifier les voitures légendaires (Ferrari, Lamborghini, Bugatti, McLaren, etc.)
SELECT b.name as marque, m.name as modele, m.base_points, m.spawn_weight
FROM models m
JOIN brands b ON m.brand_id = b.id
WHERE m.rarity = 'legendaire'
ORDER BY b.name, m.name;

-- 3. Vérifier les voitures épiques (M5, R8, Corvette, NSX, etc.)
SELECT b.name as marque, m.name as modele, m.base_points, m.spawn_weight
FROM models m
JOIN brands b ON m.brand_id = b.id
WHERE m.rarity = 'epique'
ORDER BY b.name, m.name;

-- 4. Vérifier que les variantes ont été supprimées
SELECT * FROM models WHERE
    name ILIKE '%Plaid%' OR
    name ILIKE '%Performance%' OR
    name ILIKE '%Hellcat%' OR
    name ILIKE 'e-%' OR
    name ILIKE '%Turbo S%' OR
    name ILIKE '%Concept%';
-- Doit retourner 0 ligne

-- 5. Vérifier qu'aucune voiture n'a été oubliée (sans rareté)
SELECT b.name as marque, m.name as modele
FROM models m
JOIN brands b ON m.brand_id = b.id
WHERE m.rarity IS NULL OR m.spawn_weight = 0 OR m.base_points = 0;
-- Doit retourner 0 ligne

-- 6. Compter les voitures par rareté
SELECT
    rarity,
    COUNT(*) as nombre_de_modeles
FROM models
GROUP BY rarity
ORDER BY
    CASE rarity
        WHEN 'commune' THEN 1
        WHEN 'peu_commune' THEN 2
        WHEN 'rare' THEN 3
        WHEN 'epique' THEN 4
        WHEN 'legendaire' THEN 5
    END;
```

## Améliorations Futures

- **Événements spéciaux** : Augmenter temporairement le spawn rate des légendaires
- **Collection rewards** : Récompenses pour compléter une rareté
- **Pity system** : Garantir une épique/légendaire après X parties sans
- **Streak bonus** : Bonus de points pour les raretés élevées trouvées en série
- **Rareté du jour** : Une rareté avec spawn rate augmenté chaque jour
