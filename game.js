// Game configuration
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 30;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 15;

// Game state
let gameState = {
    player: {
        x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: GAME_HEIGHT - 60,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: 6
    },
    enemies: [],
    bullets: [],
    enemyBullets: [],
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    paused: false,
    enemyShootChance: 0.003
};

let keys = {};
let canvas, ctx;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // Set up event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Create initial enemy wave
    createEnemyWave();
    
    // Start game loop
    gameLoop();
}

// Create wave of enemies
function createEnemyWave() {
    gameState.enemies = [];
    const enemiesPerRow = 8;
    const rows = 3;
    const spacing = 60;
    const startX = 40;
    const startY = 30;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < enemiesPerRow; col++) {
            gameState.enemies.push({
                x: startX + col * spacing,
                y: startY + row * spacing,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                speed: 1.5 + gameState.level * 0.3,
                direction: 1,
                health: 1
            });
        }
    }
}

// Handle keyboard input
function handleKeyDown(e) {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        shoot();
    }
    
    if (e.key.toLowerCase() === 'p') {
        gameState.paused = !gameState.paused;
    }
}

function handleKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
}

// Player movement
function updatePlayer() {
    if (keys['arrowleft'] || keys['a']) {
        gameState.player.x = Math.max(0, gameState.player.x - gameState.player.speed);
    }
    if (keys['arrowright'] || keys['d']) {
        gameState.player.x = Math.min(GAME_WIDTH - gameState.player.width, gameState.player.x + gameState.player.speed);
    }
}

// Shoot bullet
function shoot() {
    if (!gameState.gameOver && !gameState.paused) {
        gameState.bullets.push({
            x: gameState.player.x + gameState.player.width / 2 - BULLET_WIDTH / 2,
            y: gameState.player.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            speed: 8
        });
    }
}

// Update bullets
function updateBullets() {
    // Player bullets
    gameState.bullets = gameState.bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
    });
    
    // Enemy bullets
    gameState.enemyBullets = gameState.enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y < GAME_HEIGHT;
    });
}

// Update enemies
function updateEnemies() {
    let moveDown = false;
    let minX = GAME_WIDTH;
    let maxX = 0;
    
    // Find boundaries
    for (let enemy of gameState.enemies) {
        minX = Math.min(minX, enemy.x);
        maxX = Math.max(maxX, enemy.x + enemy.width);
    }
    
    // Check if should change direction
    if (minX <= 10 || maxX >= GAME_WIDTH - 10) {
        moveDown = true;
        for (let enemy of gameState.enemies) {
            enemy.direction *= -1;
        }
    }
    
    // Update enemy positions
    for (let enemy of gameState.enemies) {
        enemy.x += enemy.speed * enemy.direction;
        if (moveDown) {
            enemy.y += 40;
        }
        
        // Enemies shoot
        if (Math.random() < gameState.enemyShootChance) {
            gameState.enemyBullets.push({
                x: enemy.x + enemy.width / 2 - BULLET_WIDTH / 2,
                y: enemy.y + enemy.height,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                speed: 4
            });
        }
    }
}

// Collision detection
function checkCollisions() {
    // Player bullets hitting enemies
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            if (isColliding(gameState.bullets[i], gameState.enemies[j])) {
                gameState.bullets.splice(i, 1);
                gameState.enemies.splice(j, 1);
                gameState.score += 10 * gameState.level;
                break;
            }
        }
    }
    
    // Enemy bullets hitting player
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        if (isColliding(gameState.enemyBullets[i], gameState.player)) {
            gameState.enemyBullets.splice(i, 1);
            gameState.lives--;
            
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                document.getElementById('gameOverScreen').classList.add('show');
                document.getElementById('finalScore').textContent = gameState.score;
            }
        }
    }
    
    // Enemies reaching bottom
    for (let enemy of gameState.enemies) {
        if (enemy.y + enemy.height >= GAME_HEIGHT - 60) {
            gameState.gameOver = true;
            document.getElementById('gameOverScreen').classList.add('show');
            document.getElementById('finalScore').textContent = gameState.score;
        }
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update HUD
function updateHUD() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('enemies').textContent = gameState.enemies.length;
}

// Draw functions
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw grid
    drawGrid();
    
    // Draw player
    drawPlayer();
    
    // Draw enemies
    drawEnemies();
    
    // Draw bullets
    drawBullets();
    
    // Draw pause indicator
    if (gameState.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < GAME_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_HEIGHT);
        ctx.stroke();
    }
    
    for (let i = 0; i < GAME_HEIGHT; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_WIDTH, i);
        ctx.stroke();
    }
}

function drawPlayer() {
    // Player body
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    
    // Glow effect
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(gameState.player.x - 2, gameState.player.y - 2, gameState.player.width + 4, gameState.player.height + 4);
    
    // Cockpit detail
    ctx.fillStyle = '#1754e6';
    ctx.fillRect(gameState.player.x + gameState.player.width / 2 - 3, gameState.player.y + 5, 6, 8);
}

function drawEnemies() {
    for (let enemy of gameState.enemies) {
        // Enemy body
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Glow effect
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.shadowBlur = 0;
        
        // Eyes
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 4, 4);
        ctx.fillRect(enemy.x + enemy.width - 9, enemy.y + 5, 4, 4);
    }
}

function drawBullets() {
    // Player bullets
    ctx.fillStyle = '#60a5fa';
    for (let bullet of gameState.bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
        ctx.shadowBlur = 8;
    }
    ctx.shadowBlur = 0;
    
    // Enemy bullets
    ctx.fillStyle = '#fbbf24';
    for (let bullet of gameState.enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Game loop
function gameLoop() {
    if (!gameState.gameOver && !gameState.paused) {
        updatePlayer();
        updateBullets();
        updateEnemies();
        checkCollisions();
        
        // Level progression
        if (gameState.enemies.length === 0) {
            gameState.level++;
            gameState.enemyShootChance += 0.0005;
            createEnemyWave();
        }
    }
    
    updateHUD();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game when page loads
window.addEventListener('load', init);
