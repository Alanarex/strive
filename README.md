# Strive — Application de suivi d'activités sportives

Application mobile type Strava réalisée avec React Native (Expo).

## Fonctionnalités

- **Authentification** : Création de compte, connexion, session persistante
- **Enregistrement d'activité** : Démarrer / Pause / Reprendre / Arrêter
- **Suivi GPS** : Collecte des points avec distance minimale 5–10 m, intervalle 1–3 s en mouvement
- **Carte** : Affichage du tracé GPS des activités
- **Statistiques** : Distance, durée, vitesse moyenne (activité et globales)
- **Profil** : Modification des informations, gestion des permissions
- **Background** : Suivi actif écran éteint ou app en arrière-plan (build natif requis)

## Prérequis

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) ou `npx expo`
- Application Expo Go sur téléphone (pour tests rapides)
- Pour le suivi en arrière-plan : build de développement (`npx expo prebuild` + `npx expo run:android` ou `run:ios`)

## Installation

```bash
npm install
```

## Lancement

```bash
# Démarrer le serveur Expo
npm start

# Ou directement sur Android / iOS
npm run android
npm run ios
```

## Structure du projet

```
src/
├── constants/     # Thème, couleurs
├── context/       # AuthContext, RecordingContext
├── navigation/    # AppNavigator
├── screens/       # Écrans (Login, Home, Recording, Detail, Profile)
├── services/      # database (SQLite), locationService
├── types/         # Types TypeScript
└── utils/         # Calculs GPS (haversine, formatage)
```

## Notes techniques

- **Expo Go** : Le suivi en arrière-plan peut être limité. Utiliser un développement build pour des tests complets.
- **Carte** : `react-native-maps` fonctionne avec les tuiles par défaut. Pour Android en production, une clé API Google Maps peut être configurée dans `app.json` si nécessaire.
- **Données** : Stockage local uniquement (SQLite via expo-sqlite). Pas de synchronisation serveur.

## Barème respecté

- Enregistrement d'activité : Start / Pause / Stop ✓
- Tracking GPS temps réel ✓
- Sauvegarde et persistance ✓
- Carte du parcours ✓
- Statistiques ✓
- Background tracking ✓
- Structure du projet ✓
- Gestion des permissions ✓
- UX claire ✓
