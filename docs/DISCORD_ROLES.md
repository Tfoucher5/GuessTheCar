# Système de Rôles Discord pour GuessTheCar

## Vue d'ensemble

Le bot GuessTheCar attribue automatiquement des rôles Discord à vos membres en fonction de leur progression dans le jeu. Les rôles sont mis à jour automatiquement lorsque les joueurs montent de niveau ou changent de prestige.

**⚠️ Important** : La gestion des rôles est **uniquement active sur le serveur officiel** configuré dans les variables d'environnement. Sur les autres serveurs, le bot fonctionne normalement mais ne gère pas les rôles.

## Types de rôles

### Rôles de Prestige

Les rôles de prestige sont attribués en fonction du niveau de prestige du joueur :

| Prestige | Nom du rôle | Couleur |
|----------|-------------|---------|
| 0 | `[GuessTheCar] Normal` | Gris (#808080) |
| 1 | `[GuessTheCar] Bronze` | Bronze (#CD7F32) |
| 2 | `[GuessTheCar] Bronze II` | Bronze foncé (#B87333) |
| 3 | `[GuessTheCar] Argent` | Argent (#C0C0C0) |
| 4 | `[GuessTheCar] Argent II` | Argent foncé (#A8A8A8) |
| 5 | `[GuessTheCar] Or` | Or (#FFD700) |
| 6 | `[GuessTheCar] Or II` | Or foncé (#FFA500) |
| 7 | `[GuessTheCar] Diamant` | Diamant (#B9F2FF) |
| 8 | `[GuessTheCar] Diamant II` | Diamant foncé (#00CED1) |
| 9 | `[GuessTheCar] Maître` | Violet (#9400D3) |
| 10 | `[GuessTheCar] LÉGENDE` | Rouge (#FF0000) |

### Rôles de Niveau

Les rôles de niveau sont attribués par paliers :

| Niveau | Nom du rôle | Couleur |
|--------|-------------|---------|
| 5+ | `[GuessTheCar] Niveau 5+` | Gris-bleu (#95A5A6) |
| 10+ | `[GuessTheCar] Niveau 10+` | Bleu (#3498DB) |
| 15+ | `[GuessTheCar] Niveau 15+` | Violet (#9B59B6) |
| 20 | `[GuessTheCar] Niveau 20 (Max)` | Rouge (#E74C3C) |

## Configuration requise

### 0. Configuration du serveur officiel

**Première étape obligatoire** : Configurer l'ID de votre serveur Discord officiel.

#### Comment obtenir l'ID de votre serveur :

1. Activez le **Mode Développeur** dans Discord :
   - Paramètres utilisateur → Avancés → Mode Développeur ✅

2. Faites un clic droit sur votre serveur (dans la liste de gauche)

3. Cliquez sur **Copier l'identifiant du serveur**

4. Ajoutez cet ID dans votre fichier `.env` :
   ```env
   OFFICIAL_GUILD_ID=123456789012345678
   ```

5. Redémarrez le bot

⚠️ **Sans cette configuration, la gestion des rôles sera désactivée sur tous les serveurs.**

### 1. Permissions du bot

Le bot a besoin des permissions suivantes pour gérer les rôles :

- **Gérer les rôles** (Manage Roles)
- **Voir les membres** (View Members)

### 2. Activation de l'intent GuildMembers

Dans le [Discord Developer Portal](https://discord.com/developers/applications) :

1. Sélectionnez votre application
2. Allez dans l'onglet **Bot**
3. Dans la section **Privileged Gateway Intents**, activez :
   - ✅ **Server Members Intent**

⚠️ **Important** : Sans cet intent, le bot ne pourra pas gérer les rôles.

### 3. Hiérarchie des rôles

Pour que le bot puisse attribuer des rôles, assurez-vous que :

1. Le rôle du bot est **plus haut** dans la hiérarchie que les rôles `[GuessTheCar]`
2. Les rôles `[GuessTheCar]` sont créés automatiquement au premier lancement

Vous pouvez réorganiser les rôles dans : **Paramètres du serveur → Rôles**

## Fonctionnement

### Synchronisation automatique

Les rôles sont automatiquement synchronisés dans les situations suivantes :

1. **Après chaque partie gagnée** - Les rôles sont mis à jour si le joueur monte de niveau
2. **Lors d'un prestige** - Le rôle de prestige est mis à jour, et le rôle de niveau revient au niveau 1
3. **En cas de points partiels** - Si le joueur trouve la marque mais pas le modèle et gagne des points

### Synchronisation manuelle

En cas de problème, vous pouvez synchroniser manuellement les rôles avec :

```
/syncroles
```

Options :
- Sans option : Synchronise vos propres rôles
- Avec `@utilisateur` : Synchronise les rôles d'un utilisateur spécifique (nécessite la permission "Gérer les rôles")

## Personnalisation

### Modifier les couleurs des rôles

Les couleurs des rôles peuvent être modifiées dans :
```
src/core/roles/RoleManager.js
```

Modifiez les valeurs hexadécimales dans les objets `prestigeRoles` et `levelMilestones`.

### Modifier les paliers de niveau

Pour ajuster les paliers de niveau (par exemple, ajouter un palier à 25), éditez :
```javascript
this.levelMilestones = [
    { level: 5, name: 'Niveau 5+', color: '#95A5A6' },
    { level: 10, name: 'Niveau 10+', color: '#3498DB' },
    { level: 15, name: 'Niveau 15+', color: '#9B59B6' },
    { level: 20, name: 'Niveau 20 (Max)', color: '#E74C3C' },
    // Ajoutez de nouveaux paliers ici
];
```

### Désactiver le système de rôles

Pour désactiver temporairement le système de rôles sans modifier le code :

1. Retirez la permission "Gérer les rôles" au bot
2. Le bot continuera à fonctionner normalement, mais ne gérera plus les rôles

## Dépannage

### Les rôles ne sont pas attribués

1. ✅ **Vérifiez que `OFFICIAL_GUILD_ID` est configuré dans `.env`**
2. ✅ **Vérifiez que vous êtes sur le bon serveur** (l'ID doit correspondre)
3. ✅ Vérifiez que le bot a la permission "Gérer les rôles"
4. ✅ Vérifiez que l'intent "Server Members" est activé dans le Developer Portal
5. ✅ Vérifiez que le rôle du bot est plus haut que les rôles `[GuessTheCar]`
6. ✅ Essayez `/syncroles` pour forcer la synchronisation

### Les rôles ne sont pas mis à jour après une partie

1. Vérifiez les logs du bot pour des erreurs
2. Utilisez `/syncroles` pour mettre à jour manuellement
3. Redémarrez le bot si nécessaire

### Rôles dupliqués

Si des rôles sont dupliqués, vous pouvez :

1. Supprimer manuellement les anciens rôles via les paramètres du serveur
2. Utiliser `/syncroles` pour tous les joueurs

### Nettoyer les rôles obsolètes

Si vous modifiez le système de rôles, vous pouvez nettoyer les anciens rôles manuellement ou utiliser :

```javascript
// Dans la console du bot (développeurs uniquement)
await roleManager.cleanupRoles(guild);
```

## Support

Pour toute question ou problème avec le système de rôles :

1. Consultez les logs du bot
2. Vérifiez que toutes les permissions sont correctement configurées
3. Ouvrez une issue sur le dépôt GitHub du projet

## Notes techniques

- Les rôles sont préfixés par `[GuessTheCar]` pour éviter les conflits avec d'autres rôles
- Un joueur ne peut avoir qu'**un seul rôle de prestige** et **un seul rôle de niveau** à la fois
- Les rôles sont créés automatiquement s'ils n'existent pas
- La synchronisation des rôles est non-bloquante : une erreur de rôle n'interrompra pas le jeu
- **La gestion des rôles est limitée au serveur officiel uniquement** pour éviter :
  - La pollution de serveurs tiers avec des rôles non désirés
  - Des conflits de permissions sur d'autres serveurs
  - Une charge inutile sur le bot

## Multi-serveurs

Si votre bot est présent sur plusieurs serveurs Discord :

- ✅ Le **jeu fonctionne normalement** sur tous les serveurs
- ✅ Les **statistiques sont séparées** par serveur (via `guildId`)
- ✅ Les **classements** sont indépendants par serveur
- ❌ Les **rôles** ne sont gérés **que sur le serveur officiel** configuré

Pour obtenir des rôles sur d'autres serveurs, vous devriez :
1. Créer une instance séparée du bot pour chaque communauté
2. Ou configurer manuellement les rôles sur les autres serveurs (sans synchronisation automatique)
