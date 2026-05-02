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
        speed: 6,
        shield: 1
    },
    enemies: [],
    bullets: [],
    enemyBullets: [],
    particles: [],
    explosions: [],
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    paused: false,
    enemyShootChance: 0.003,
    time: 0
};

let keys = {};
let canvas, ctx;

// Particle system
class Particle {
    constructor(x, y, vx, vy, color, life = 30) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.fillRect(this.x, this.y, 3, 3);
    }
}

// Explosion effect
class Explosion {
    constructor(x, y, color = 'rgb(239, 68, 68)') {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 25;
        this.speed = 1.5;
        this.color = color;
        this.alpha = 1;
    }

    update() {
        this.radius += this.speed;
        this.alpha = 1 - (this.radius / this.maxRadius);
    }

    draw(ctx) {
        ctx.fillStyle = this.color.replace(')', `, ${this.alpha * 0.6})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = this.color.replace(')', `, ${this.alpha})`).replace('rgb', 'rgba');
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    isDone() {
        return this.radius >= this.maxRadius;
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    createEnemyWave();
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
                health: 1,
                bobOffset: Math.random() * Math.PI * 2,
                type: Math.floor(row / 1) // Different enemy types
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
        
        // Particle effect
        for (let i = 0; i < 3; i++) {
            gameState.particles.push(new Particle(
                gameState.player.x + gameState.player.width / 2,
                gameState.player.y,
                (Math.random() - 0.5) * 2,
                Math.random() - 1,
                'rgb(96, 165, 250)',
                15
            ));
        }
    }
}

// Update bullets
function updateBullets() {
    gameState.bullets = gameState.bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
    });
    
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
    
    for (let enemy of gameState.enemies) {
        minX = Math.min(minX, enemy.x);
        maxX = Math.max(maxX, enemy.x + enemy.width);
    }
    
    if (minX <= 10 || maxX >= GAME_WIDTH - 10) {
        moveDown = true;
        for (let enemy of gameState.enemies) {
            enemy.direction *= -1;
        }
    }
    
    for (let enemy of gameState.enemies) {
        enemy.x += enemy.speed * enemy.direction;
        if (moveDown) {
            enemy.y += 40;
        }
        enemy.bobOffset += 0.05;
        
        if (Math.random() < gameState.enemyShootChance) {
            gameState.enemyBullets.push({
                x: enemy.x + enemy.width / 2 - BULLET_WIDTH / 2,
                y: enemy.y + enemy.height,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                speed: 4
            });
            
            // Particle effect for enemy shot
            for (let i = 0; i < 2; i++) {
                gameState.particles.push(new Particle(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height,
                    (Math.random() - 0.5) * 2,
                    Math.random(),
                    'rgb(251, 191, 36)',
                    12
                ));
            }
        }
    }
}

// Update particles
function updateParticles() {
    gameState.particles = gameState.particles.filter(p => {
        p.update();
        return p.life > 0;
    });
}

// Update explosions
function updateExplosions() {
    gameState.explosions = gameState.explosions.filter(e => {
        e.update();
        return !e.isDone();
    });
}

// Collision detection
function checkCollisions() {
    // Player bullets hitting enemies
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            if (isColliding(gameState.bullets[i], gameState.enemies[j])) {
                gameState.bullets.splice(i, 1);
                const enemy = gameState.enemies[j];
                
                // Create explosion
                gameState.explosions.push(new Explosion(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    'rgb(239, 68, 68)'
                ));
                
                // Particle burst
                for (let k = 0; k < 12; k++) {
                    const angle = (Math.PI * 2 * k) / 12;
                    gameState.particles.push(new Particle(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2,
                        Math.cos(angle) * 3,
                        Math.sin(angle) * 3,
                        'rgb(239, 68, 68)',
                        20
                    ));
                }
                
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
            
            // Explosion at player
            gameState.explosions.push(new Explosion(
                gameState.player.x + gameState.player.width / 2,
                gameState.player.y + gameState.player.height / 2,
                'rgb(96, 165, 250)'
            ));
            
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
    // Animated background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Animated background stars
    drawStarfield();
    
    // Draw grid
    drawGrid();
    
    // Draw enemies first (so they're behind other effects)
    drawEnemies();
    
    // Draw particles
    for (let particle of gameState.particles) {
        particle.draw(ctx);
    }
    
    // Draw explosions
    for (let explosion of gameState.explosions) {
        explosion.draw(ctx);
    }
    
    // Draw bullets
    drawBullets();
    
    // Draw player
    drawPlayer();
    
    // Draw pause indicator
    if (gameState.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.textAlign = 'left';
    }
}

function drawStarfield() {
    const time = gameState.time * 0.001;
    ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
    
    for (let i = 0; i < 50; i++) {
        const x = (i * 157 + time * 20) % GAME_WIDTH;
        const y = (i * 73) % GAME_HEIGHT;
        const size = (i % 3) + 0.5;
        ctx.fillRect(x, y, size, size);
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.08)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < GAME_WIDTH; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_HEIGHT);
        ctx.stroke();
    }
    
    for (let i = 0; i < GAME_HEIGHT; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_WIDTH, i);
        ctx.stroke();
    }
}

function drawPlayer() {
    const px = gameState.player.x;
    const py = gameState.player.y;
    const w = gameState.player.width;
    const h = gameState.player.height;
    
    // Glow/shield effect
    ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
    ctx.shadowBlur = 15;
    
    // Main body
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(px + w / 2, py);
    ctx.lineTo(px + w, py + h * 0.7);
    ctx.lineTo(px + w * 0.7, py + h);
    ctx.lineTo(px + w / 2, py + h * 0.8);
    ctx.lineTo(px + w * 0.3, py + h);
    ctx.lineTo(px, py + h * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#1754e6';
    ctx.beginPath();
    ctx.arc(px + w / 2, py + h * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine glow
    ctx.fillStyle = 'rgba(96, 165, 250, 0.6)';
    ctx.fillRect(px + w * 0.35, py + h * 0.75, w * 0.3, 3);
    
    ctx.shadowBlur = 0;
    
    // Outline
    ctx.strokeStyle = 'rgba(96, 165, 250, 1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px + w / 2, py);
    ctx.lineTo(px + w, py + h * 0.7);
    ctx.lineTo(px + w * 0.7, py + h);
    ctx.lineTo(px + w / 2, py + h * 0.8);
    ctx.lineTo(px + w * 0.3, py + h);
    ctx.lineTo(px, py + h * 0.7);
    ctx.closePath();
    ctx.stroke();
}

function drawEnemies() {
    for (let enemy of gameState.enemies) {
        const ex = enemy.x;
        const ey = enemy.y + Math.sin(gameState.time * 0.01 + enemy.bobOffset) * 3;
        const ew = enemy.width;
        const eh = enemy.height;
        
        // Glow effect
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.shadowBlur = 12;
        
        if (enemy.type === 0) {
            // Octopus-like enemy
            ctx.fillStyle = '#ef4444';
            
            // Head
            ctx.beginPath();
            ctx.arc(ex + ew / 2, ey + eh * 0.4, ew * 0.35, 0, Math.PI * 2);
            ctx.fill();
            
            // Tentacles
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ef4444';
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI / 3) + (i * Math.PI / 3);
                ctx.beginPath();
                ctx.moveTo(ex + ew / 2, ey + eh * 0.5);
                ctx.lineTo(
                    ex + ew / 2 + Math.cos(angle) * (ew * 0.4),
                    ey + eh * 0.5 + Math.sin(angle) * (eh * 0.5)
                );
                ctx.stroke();
            }
            
            // Eyes
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath();
            ctx.arc(ex + ew * 0.3, ey + eh * 0.3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + ew * 0.7, ey + eh * 0.3, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Spaceship-like enemy
            ctx.fillStyle = '#dc2626';
            
            ctx.beginPath();
            ctx.moveTo(ex + ew / 2, ey);
            ctx.lineTo(ex + ew, ey + eh * 0.5);
            ctx.lineTo(ex + ew * 0.6, ey + eh);
            ctx.lineTo(ex + ew * 0.4, ey + eh);
            ctx.lineTo(ex, ey + eh * 0.5);
            ctx.closePath();
            ctx.fill();
            
            // Window
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath();
            ctx.arc(ex + ew / 2, ey + eh * 0.4, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
    }
}

function drawBullets() {
    // Player bullets with glow
    ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#60a5fa';
    
    for (let bullet of gameState.bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Trailing light
        ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
        ctx.fillRect(bullet.x - 1, bullet.y + bullet.height, bullet.width + 2, 8);
        ctx.fillStyle = '#60a5fa';
    }
    
    ctx.shadowBlur = 0;
    
    // Enemy bullets with glow
    ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fbbf24';
    
    for (let bullet of gameState.enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Trailing light
        ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.fillRect(bullet.x - 1, bullet.y - 8, bullet.width + 2, 8);
        ctx.fillStyle = '#fbbf24';
    }
    
    ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
    gameState.time++;
    
    if (!gameState.gameOver && !gameState.paused) {
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateParticles();
        updateExplosions();
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
