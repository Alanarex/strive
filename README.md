# Strive

> A Strava-style mobile app built with React Native and Expo: record GPS activities, see your route on a map and track your stats, all stored on the device.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-expo--sqlite-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

**Résumé (FR)** : application mobile de suivi d'activités sportives (type Strava) en React Native / Expo. Elle enregistre le parcours GPS (démarrer, pause, reprise, arrêt), l'affiche sur une carte, calcule distance, durée et vitesse, et exporte en GPX/CSV. Tout est stocké localement dans SQLite, sans serveur. Projet réalisé dans un cadre scolaire.

## Features

- Local accounts: sign up, log in, persistent session (`expo-secure-store`).
- Activity recording: start / pause / resume / stop, with GPS points sampled by distance and time.
- Background tracking while the screen is off (requires a development build, not Expo Go).
- Route map (`react-native-maps`) and per-activity details.
- Statistics: distance, duration, average speed, per-type stats and a line chart.
- Personal achievements screen and local milestone notifications.
- Export an activity as GPX or CSV.
- Profile editing with a photo and permission management.

## Architecture

```
src/
├── components/   # UI pieces (map, charts, stat panels, badges)
├── constants/    # theme, activity types
├── context/      # AuthContext, RecordingContext
├── hooks/        # location, permissions, map region
├── navigation/   # AppNavigator (stack + bottom tabs)
├── screens/      # Welcome, Login, Signup, Home, Recording, ActivityDetail, Leaderboard, Profile
├── services/     # database (SQLite), locationService, notificationService, backgroundStore
├── types/
└── utils/        # GPS maths (haversine), formatters, export (GPX/CSV), auth (password hashing)
```

Data is stored only on the device (SQLite). There is no backend and no synchronisation.

## Getting started

Requirements: Node.js 20+ (Expo SDK 54 tooling prefers 22+), npm, and Expo Go or an Android/iOS emulator.

```sh
npm install
npm start            # Expo dev server (scan the QR code with Expo Go)
npm run android      # development build on Android
npm run ios          # development build on iOS
```

Background location needs a development build (`npx expo prebuild` then `npm run android` / `npm run ios`); Expo Go limits it.

## Tests

No automated tests yet (see the open issues).

## What it demonstrates

- Cross-platform mobile development with React Native, Expo and strict TypeScript.
- Foreground and background geolocation, permissions handling and local notifications.
- Local persistence with SQLite and secure session storage.
- A React context based architecture with React Navigation.

## License

MIT, see [LICENSE](LICENSE).
