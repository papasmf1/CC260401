# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains a single-file browser-based Breakout (블럭깨기) game written in vanilla HTML/CSS/JavaScript. No build tools, dependencies, or server required — open `breakout.html` directly in a browser to run.

## Running the Game

```bash
# Open directly in a browser (Windows)
start breakout.html

# Or serve locally to avoid potential CORS issues
npx serve .
python -m http.server 8080
```

## Architecture

All game logic lives in `breakout.html` as one self-contained file:

- **CSS** (lines 7–111): Dark neon UI theme, canvas centering, overlay/button styles.
- **HTML** (lines 113–130): Canvas element, HUD (`#scoreDisplay`, `#levelDisplay`, `#livesDisplay`), overlay `#overlay`.
- **JavaScript** (lines 132–511): Entire game engine.

### Game State Machine
`gameState` drives the loop: `'idle'` → `'playing'` ↔ `'paused'` → `'over'` | `'win'`

### Key Functions
| Function | Purpose |
|---|---|
| `initGame()` | Reset all state, hide overlay, start game |
| `update()` | Per-frame physics: paddle, ball, wall/block collisions, life loss |
| `draw()` | Per-frame render: background grid, blocks, paddle, ball trail, particles |
| `buildBlocks()` | Generate 5×10 block grid; top rows have higher HP |
| `collideAABB()` | Circle-vs-AABB collision detection |
| `resolveBlock()` | Determine bounce axis on block hit |
| `nextLevel()` | Increment level, rebuild blocks, reset ball; win at level > 5 |
| `spawnParticles()` | Emit particle burst at position |
| `loop()` | `requestAnimationFrame` game loop |

### Game Constants
- Canvas: 520×600px
- Block grid: 5 rows × 10 cols, each block `44×18px` with 4px padding
- Ball speed: `4 + level × 0.4` px/frame
- Win condition: clear all 5 levels
