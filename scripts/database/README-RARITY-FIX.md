# 🔧 Guide de correction du système de rareté

## Problème résolu

**Erreur** : `structure of query does not match function result type`

**Cause** : La fonction PostgreSQL `get_random_car_weighted()` retournait une structure complexe incompatible avec Supabase RPC.

**Solution** : Nouvelle fonction simplifiée qui retourne seulement un INTEGER (l'ID de la voiture), le join avec la table `brands` est fait ensuite côté JavaScript.

---

## 📋 Instructions d'installation

### Étape 1 : Exécuter le script SQL

1. Va sur **Supabase Dashboard** → **SQL Editor**
2. Ouvre et exécute le fichier : `scripts/database/fix-weighted-random-function-v2.sql`

Ce script va :
- Supprimer l'ancienne fonction RPC
- Créer la nouvelle fonction optimisée
- Tester qu'elle fonctionne correctement

### Étape 2 : Redémarrer le bot

Les modifications JavaScript ont déjà été appliquées à `CarRepository.js`. Il suffit de :

```bash
npm start
```

### Étape 3 : Tester

Lance une partie avec `/play` et vérifie que :
- ✅ La voiture se charge sans erreur
- ✅ La rareté s'affiche correctement
- ✅ Les points correspondent à la rareté

---

## ✨ Ce qui a été modifié

### 1. Fonction SQL (`fix-weighted-random-function-v2.sql`)

**Avant** :
```sql
RETURNS TABLE (id INTEGER, name VARCHAR, ...) -- ❌ Incompatible avec Supabase
```

**Après** :
```sql
RETURNS INTEGER -- ✅ Retourne juste l'ID
```

### 2. Repository JavaScript (`CarRepository.js`)

**Avant** :
```javascript
const { data } = await supabase.rpc('get_random_car_weighted');
// Attendait un objet complet avec brand_name, etc.
```

**Après** :
```javascript
const { data: carId } = await supabase.rpc('get_random_car_weighted');
// Récupère l'ID, puis fait getCarById(carId) pour avoir les infos complètes
```

**Bonus** : Meilleure gestion d'erreur avec fallback amélioré si le RPC échoue.

---

## ❓ FAQ

### Puis-je supprimer la colonne `difficulty_level` ?

**Réponse** : **PAS ENCORE** ! ⚠️

Pour l'instant, garde-la pour :
1. Compatibilité avec les anciennes données
2. Fallback en cas de problème
3. Requêtes de statistiques qui l'utilisent encore

**Quand la supprimer ?** Une fois que :
1. ✅ Le système de rareté fonctionne parfaitement
2. ✅ Tu as testé plusieurs parties
3. ✅ Aucune erreur dans les logs pendant 24h

Je te fournirai ensuite un script propre pour la supprimer en toute sécurité.

---

## 🎯 Points de base après rééquilibrage (×10)

| Rareté | Emoji | Points | Spawn Weight | Probabilité |
|--------|-------|--------|--------------|-------------|
| Commune | 🟢 | **100** | 450 | 45% |
| Peu commune | 🔵 | **250** | 300 | 30% |
| Rare | 🟣 | **500** | 180 | 18% |
| Épique | 🟠 | **1,000** | 60 | 6% |
| Légendaire | 🔴 | **2,000** | 10 | 1% |

**Progression estimée** : ~1,800 parties pour atteindre Prestige 0 (environ 30 jours à 2h/jour).

---

## 🐛 En cas de problème

Si le bot ne démarre toujours pas :

1. Vérifie les logs d'erreur
2. Vérifie que le script SQL s'est bien exécuté :
   ```sql
   SELECT get_random_car_weighted() as test_car_id;
   ```
   Doit retourner un nombre (ID de voiture).

3. Vérifie que les colonnes existent :
   ```sql
   SELECT id, rarity, base_points, spawn_weight FROM models LIMIT 1;
   ```

4. Si ça ne fonctionne toujours pas, le fallback prendra le relais (sélection aléatoire simple).
