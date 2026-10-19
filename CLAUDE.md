# CLAUDE.md

## Stack
- React Native 0.81, React 19, Expo SDK 54 (new architecture enabled), TypeScript (strict).
- React Navigation 7, `expo-sqlite`, `expo-secure-store`, `expo-location`, `expo-task-manager`, `expo-notifications`, `expo-crypto`, `react-native-maps`, `react-native-svg`.
- No backend, no CI, no automated tests, no Docker.

## Structure
- `App.tsx`, `index.ts`: entry points. `app.json` / `eas.json`: Expo and EAS config.
- `src/`: `components`, `constants`, `context` (Auth, Recording), `hooks`, `navigation`, `screens`, `services` (database, location, notifications, backgroundStore), `types`, `utils`.

## Commands
- Install: `npm install`
- Dev server: `npm start`; native: `npm run android` / `npm run ios`
- Type-check: `npx tsc --noEmit` (known pre-existing error in `App.tsx`, `GestureHandlerRootView` import)
- Dependency alignment: `npx expo install --check`, `npx expo-doctor`
- Lint / tests / build scripts: none yet

## Conventions
- Default branch is `master`. Work on `refresh/<topic>` branches and open a PR; never commit directly to `master`.
- TypeScript strict, function components and hooks, French UI strings in places.
- Use `expo install` (not plain `npm install`) for Expo-managed packages so versions match the SDK.
- Parameterised SQL only (see `src/services/database.ts`).

## Repo rules
- No secrets or `.env` in git. No history rewrite or force push without explicit approval. Do not alter commit dates or authors.

## Known issues
- Dependencies: remaining audit findings are in Expo/Metro tooling and need an SDK major upgrade.
- GPX export writes a constant elevation of 0 and does not escape XML text (`src/utils/exportUtils.ts`).
- Passwords are hashed with salted, iterated SHA-256, not a memory-hard KDF.
