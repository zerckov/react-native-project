EduManager est une application mobile développée avec React Native permettant aux étudiants de gérer leurs cours, tâches et notes, avec une base de données locale expo-SQLite pour un fonctionnement offline-first.

## Installation

2. Installer les dépendances

```bash
npm install
```

2. Lancer le projet:

```bash
npm start
```

3. Ouvrir l'application sur Expo Go.

## Connexion
Vous pouvez vous connecter avec les identifiants:
- email: user@example.com
- Password: Password

Ou vous pouvez créer un nouveau compte et vous connecter ensuite.

## Fonctionnalités

- Authentification locale avec création de compte et connexion.
- Tableau de bord avec moyenne générale, matières et cours récents.
- Gestion des matières, notes et fichiers associés.
- Suivi visuel de la progression par matière.
- Gestion des tâches avec ajout, validation et suppression.
- Profil utilisateur avec photo et changement de mot de passe.

## Technologies utilisées

- React Native
- Expo
- expo-sqlite
- expo-document-picker
- expo-file-system
- expo-sharing
- @expo/vector-icons
- react-native-safe-area-context

## Structure du projet

- App.js: point d'entrée principal et orchestration globale de l'application.
- index.js: bootstrap Expo.
- src/components: composants d'interface réutilisables.
- src/screens: écrans principaux de l'application.
- src/data: accès aux données locales, auth et stockage de fichiers.
- src/theme: couleurs et constantes visuelles.
- assets: ressources statiques.

## Base de données

L'application utilise une base locale SQLite via expo-sqlite. Les données sont séparées par utilisateur connecté et stockées dans une logique offline-first.

- `auth_users` pour les comptes locaux.
- `auth_session` pour la session courante.
- `subjects` pour les matières.
- `subject_notes` pour les notes.
- `courses` pour les fichiers de cours.
- `tasks` pour les tâches.

Les fichiers importés sont copiés localement afin de rester accessibles.
