# Refactor de `Chess.tsx`

Cette version sépare l'ancienne page en petits fichiers, sans changer volontairement les événements Socket.IO ni les fonctionnalités du jeu.

## Arborescence à copier dans ton frontend

```text
src/
├── pages/
│   └── Chess.tsx
├── features/
│   └── chess/
│       ├── components/
│       │   ├── CapturedTray.tsx
│       │   ├── ChessBoard.tsx
│       │   ├── ChessGameControls.tsx
│       │   ├── ChessLobby.tsx
│       │   └── PromotionDialog.tsx
│       ├── constants/
│       │   └── board.ts
│       ├── hooks/
│       │   └── useChessGame.ts
│       ├── utils/
│       │   ├── capturedPieces.ts
│       │   └── pieces.ts
│       └── types.ts
└── ... tes fichiers existants ...
```

## Installation

1. Copie le dossier `features/chess` dans `frontend/src/features/chess`.
2. Remplace `frontend/src/pages/Chess.tsx` par celui fourni ici.
3. Garde tes fichiers existants `src/assets/pieces_pink`, `src/assets/pieces_blue`, `src/assets/pieces_brown`, `src/components/Header.tsx`, `Footer.tsx`, `DrawOfferDialog.tsx`, `src/context/ThemeContext.tsx`, `src/services/socket.ts`, `src/services/users.ts` et `src/utils/random.ts` : les nouveaux fichiers les importent toujours.
4. Lance `npm run build` depuis le dossier frontend pour repérer les éventuelles différences de types avec les versions réelles de tes services.

## Rôle de chaque fichier

- `pages/Chess.tsx` : assemble les composants et place les éléments sur la page.
- `hooks/useChessGame.ts` : état de la partie, écoute des événements Socket.IO, actions de partie, clics/déplacements, coups légaux et promotion.
- `components/ChessBoard.tsx` : affiche les cases, les pièces, les marqueurs de coups possibles et la pièce déplacée à la souris.
- `components/ChessLobby.tsx` : créer/rejoindre une partie, choisir la difficulté du bot, attente d'un adversaire et résultat de partie.
- `components/PromotionDialog.tsx` : choix de la pièce lors d'une promotion.
- `components/CapturedTray.tsx` : affiche les pièces prises.
- `components/ChessGameControls.tsx` : abandon, proposition de nulle et informations du joueur.
- `constants/board.ts` : correspondance des cases avec les coordonnées d'échecs.
- `utils/pieces.ts` : images des pièces et thèmes du plateau.
- `utils/capturedPieces.ts` : calcule les pièces manquantes sur le plateau.
- `types.ts` : types TypeScript partagés.

> Je n'ai pas pu lancer `npm run build` sur ton projet complet, car seul le fichier `Chess.tsx` a été fourni. Vérifie le build après avoir copié les fichiers dans ton dépôt.
