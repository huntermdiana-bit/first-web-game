# AGENTS.md

## Project Goal

This is a beginner-friendly Phaser web game project.

The goal is to make small, fun, browser-playable casual games that can eventually be shared on GitHub Pages or itch.io.

The user is young/beginner, so keep the project simple and avoid unnecessary complexity.

## Development Commands

Use these commands:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Before considering work complete, run:

```bash
npm run build
```

Fix any build errors.

## Game Development Rules

Always build in this order:

1. Game idea
2. Game seed
3. Mechanics
4. MVP scope
5. Small playable prototype
6. Playtest notes
7. Polish
8. Publishable build

Do not start by adding lots of features.

The first version should be playable in 60 seconds.

The player should understand what to do within 5 seconds.

Every game must have:

- clear player goal
- simple controls
- score or progress feedback
- way to lose or fail
- restart
- basic difficulty increase
- no console errors
- successful production build

Avoid:

- multiplayer
- accounts
- stores
- complex inventory
- giant maps
- advanced asset pipelines
- unnecessary frameworks

## Phaser Rules

Use Phaser and the existing Vite structure.

Favor simple 2D arcade games.

Use shapes, text, emoji, or simple placeholder art until the game is fun.

Only add art polish after the core game loop works.

## Documentation Files

Maintain these files:

- docs/GAME_SEED.md
- docs/MECHANICS.md
- docs/MVP_SCOPE.md
- docs/PLAYTEST_LOG.md
- docs/POLISH_LOG.md

If these files do not exist, create them.

## Playtest Checklist

After each playable version, answer:

- Is the goal obvious?
- Are the controls clear?
- Is it fun within 30 seconds?
- Is losing understandable?
- Is the difficulty fair?
- What is the single best next improvement?

Then save it.
