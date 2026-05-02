# 👾 Space Invaders Clone

A fun, retro-style Space Invaders game built with HTML5 Canvas and vanilla JavaScript. Play directly in your browser!

## 🎮 Game Features

- **Classic Space Invaders Gameplay**: Defend Earth from waves of alien invaders
- **Progressive Difficulty**: Each level increases enemy speed and shooting frequency
- **Score System**: Earn points for each enemy destroyed
- **Lives System**: You have 3 lives to survive
- **Pause Functionality**: Press P to pause/resume the game
- **Beautiful UI**: Modern, dark-themed interface with glowing effects
- **Responsive Design**: Works on desktop browsers

## 🕹️ Controls

| Control | Action |
|---------|--------|
| **← / A** | Move Left |
| **→ / D** | Move Right |
| **SPACE** | Shoot |
| **P** | Pause/Resume |

## 🚀 How to Play

1. Open `index.html` in your web browser
2. Use arrow keys or WASD to move your ship
3. Press SPACE to shoot at enemies
4. Destroy all enemies to advance to the next level
5. Avoid enemy fire and don't let them reach the bottom
6. Try to get the highest score!

## 📊 Scoring

- **10 points** × Level multiplier per enemy destroyed
- Difficulty increases with each level

## 🎯 Game Over Conditions

- You lose all 3 lives
- Enemies reach the bottom of the screen

## 🛠️ Technical Details

- **Language**: HTML5, CSS3, Vanilla JavaScript
- **Graphics**: HTML5 Canvas API
- **Physics**: Basic collision detection and sprite movement
- **Performance**: 60 FPS game loop with requestAnimationFrame

## 📋 Features Included

- ✅ Enemy wave generation
- ✅ Player-to-enemy collision detection
- ✅ Enemy bullet physics
- ✅ Pause mechanism
- ✅ Level progression
- ✅ HUD with live stats
- ✅ Game over screen
- ✅ Responsive layout
- ✅ Visual effects (glows, shadows)
- ✅ Grid background

## 🎨 Customization

Edit `game.js` to adjust:
- `GAME_WIDTH` / `GAME_HEIGHT`: Change game resolution
- `gameState.player.speed`: Adjust player movement speed
- `gameState.enemyShootChance`: Change enemy firing frequency
- Colors in `index.html` style section

## 📦 Browser Support

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 🎓 Learning Resources

This project demonstrates:
- Canvas API usage
- Game loop implementation
- Collision detection algorithms
- Event handling
- State management
- CSS animations and effects

## 📝 License

MIT License - Feel free to modify and use this project!

## 🚀 Have Fun!

Enjoy the game and happy destroying! 👾
