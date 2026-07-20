const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');

// D-Pad Touch Buttons
const dpadUp = document.getElementById('dpadUp');
const dpadDown = document.getElementById('dpadDown');
const dpadLeft = document.getElementById('dpadLeft');
const dpadRight = document.getElementById('dpadRight');
const dpadCenter = document.getElementById('dpadCenter');

const gridSize = 20;
const tileCountX = canvas.width / gridSize;
const tileCountY = canvas.height / gridSize;

let snake = [];
let velocity = { x: 0, y: 0 };
let inputBuffer = [];
let fruit = { x: 0, y: 0 };
let score = 0;
let bestScore = parseInt(localStorage.getItem('snake_best_score') || '0', 10);
let gameOver = false;
let paused = false;
let gameStarted = false;

// Speed Control (in milliseconds per frame update)
const BASE_SPEED = 100;
let currentSpeed = BASE_SPEED;
let lastRenderTime = 0;

// Particle System for Food Effects
let particles = [];

// Audio Context setup for retro sound effects
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        if (type === 'eat') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'gameover') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'move') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        }
    } catch (e) {
        // Ignore audio errors if blocked by browser policy
    }
}

function spawnParticles(x, y) {
    const px = x * gridSize + gridSize / 2;
    const py = y * gridSize + gridSize / 2;
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color: '#ff8b5c'
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function resetGame() {
    const startX = Math.floor(tileCountX / 2);
    const startY = Math.floor(tileCountY / 2);
    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
    velocity = { x: 1, y: 0 };
    inputBuffer = [];
    score = 0;
    currentSpeed = BASE_SPEED;
    gameOver = false;
    paused = false;
    gameStarted = false;
    particles = [];
    fruit = randomFruitPosition();
    updateScores();
    if (pauseButton) pauseButton.textContent = 'Pause';
}

function randomFruitPosition() {
    let position;
    let valid = false;
    while (!valid) {
        position = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY),
        };
        valid = !snake.some(segment => segment.x === position.x && segment.y === position.y);
    }
    return position;
}

function updateScores() {
    scoreEl.textContent = score;
    bestScoreEl.textContent = bestScore;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0b1734');
    gradient.addColorStop(1, '#091327');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;

        ctx.save();
        if (isHead) {
            ctx.fillStyle = '#7acce0';
            ctx.shadowColor = '#7acce0';
            ctx.shadowBlur = 12;
            
            // Draw head rounded rectangle
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, 6);
            ctx.fill();

            // Draw eyes on snake head
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#08121f';
            let eyeX1 = x + 5, eyeY1 = y + 5, eyeX2 = x + 13, eyeY2 = y + 5;
            if (velocity.x === 1) { eyeX1 = x + 13; eyeY1 = y + 5; eyeX2 = x + 13; eyeY2 = y + 13; }
            else if (velocity.x === -1) { eyeX1 = x + 5; eyeY1 = y + 5; eyeX2 = x + 5; eyeY2 = y + 13; }
            else if (velocity.y === 1) { eyeX1 = x + 5; eyeY1 = y + 13; eyeX2 = x + 13; eyeY2 = y + 13; }

            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
            ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const alpha = 1 - (index / snake.length) * 0.4;
            ctx.fillStyle = `rgba(90, 140, 255, ${alpha})`;
            ctx.shadowColor = '#5a8cff';
            ctx.shadowBlur = 6;

            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, gridSize - 4, gridSize - 4, 4);
            ctx.fill();
        }
        ctx.restore();
    });
}

function drawFruit() {
    const fx = fruit.x * gridSize + gridSize / 2;
    const fy = fruit.y * gridSize + gridSize / 2;

    ctx.save();
    ctx.fillStyle = '#ff8b5c';
    ctx.shadowColor = '#ff8b5c';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(fx, fy, gridSize / 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Fruit shine overlay
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(fx - 2, fy - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawStartOverlay() {
    ctx.fillStyle = 'rgba(5, 10, 24, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#7acce0';
    ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SNAKE GAME', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#f0f6ff';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText('Tap D-Pad / Swipe / Keys to Start', canvas.width / 2, canvas.height / 2 + 24);
}

function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(5, 10, 24, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#90a7c7';
    ctx.fillText('Tap Pause / Space / P to resume', canvas.width / 2, canvas.height / 2 + 30);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(5, 10, 24, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 36px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);

    ctx.fillStyle = '#f0f6ff';
    ctx.font = '20px Inter, system-ui, sans-serif';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

    ctx.fillStyle = '#7acce0';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText('Tap Restart to play again', canvas.width / 2, canvas.height / 2 + 45);
}

function update() {
    if (gameOver || paused || !gameStarted) return;

    // Process buffered inputs
    if (inputBuffer.length > 0) {
        const nextVel = inputBuffer.shift();
        if (nextVel.x !== -velocity.x && nextVel.y !== -velocity.y) {
            velocity = nextVel;
        }
    }

    const nextHead = {
        x: snake[0].x + velocity.x,
        y: snake[0].y + velocity.y,
    };

    // Collision Check: Wall or Self
    if (
        nextHead.x < 0 ||
        nextHead.x >= tileCountX ||
        nextHead.y < 0 ||
        nextHead.y >= tileCountY ||
        snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y)
    ) {
        gameOver = true;
        playSound('gameover');
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('snake_best_score', bestScore.toString());
        }
        updateScores();
        return;
    }

    snake.unshift(nextHead);

    // Food Collision Check
    if (nextHead.x === fruit.x && nextHead.y === fruit.y) {
        score += 10;
        spawnParticles(fruit.x, fruit.y);
        playSound('eat');
        fruit = randomFruitPosition();
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('snake_best_score', bestScore.toString());
        }
        updateScores();

        // Speed up slightly as score grows
        currentSpeed = Math.max(50, BASE_SPEED - Math.floor(score / 50) * 5);
    } else {
        snake.pop();
    }
}

function draw() {
    drawBackground();
    drawGrid();
    drawFruit();
    drawParticles();
    drawSnake();

    if (!gameStarted && !gameOver) {
        drawStartOverlay();
    } else if (paused) {
        drawPauseOverlay();
    } else if (gameOver) {
        drawGameOver();
    }
}

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastRenderTime;
    if (deltaTime < currentSpeed) return;

    lastRenderTime = currentTime;

    updateParticles();
    update();
    draw();
}

function moveDirection(dir) {
    initAudio();
    if (gameOver) return;

    const lastVel = inputBuffer.length > 0 ? inputBuffer[inputBuffer.length - 1] : velocity;

    if (dir === 'UP' && lastVel.y === 0) {
        inputBuffer.push({ x: 0, y: -1 });
        gameStarted = true;
    } else if (dir === 'DOWN' && lastVel.y === 0) {
        inputBuffer.push({ x: 0, y: 1 });
        gameStarted = true;
    } else if (dir === 'LEFT' && lastVel.x === 0) {
        inputBuffer.push({ x: -1, y: 0 });
        gameStarted = true;
    } else if (dir === 'RIGHT' && lastVel.x === 0) {
        inputBuffer.push({ x: 1, y: 0 });
        gameStarted = true;
    }
}

function togglePause() {
    initAudio();
    if (gameStarted && !gameOver) {
        paused = !paused;
        if (pauseButton) {
            pauseButton.textContent = paused ? 'Resume' : 'Pause';
        }
    }
}

// Keyboard Event Listener
window.addEventListener('keydown', event => {
    initAudio();

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault(); // Prevent scrolling page
    }

    if (gameOver) {
        if (event.key === 'r' || event.key === 'R') {
            resetGame();
        }
        return;
    }

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            moveDirection('UP');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            moveDirection('DOWN');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            moveDirection('LEFT');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            moveDirection('RIGHT');
            break;
        case ' ':
        case 'p':
        case 'P':
            togglePause();
            break;
    }
});

// D-Pad Button Click & Touch Listeners
if (dpadUp) dpadUp.addEventListener('pointerdown', (e) => { e.preventDefault(); moveDirection('UP'); });
if (dpadDown) dpadDown.addEventListener('pointerdown', (e) => { e.preventDefault(); moveDirection('DOWN'); });
if (dpadLeft) dpadLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); moveDirection('LEFT'); });
if (dpadRight) dpadRight.addEventListener('pointerdown', (e) => { e.preventDefault(); moveDirection('RIGHT'); });
if (dpadCenter) dpadCenter.addEventListener('pointerdown', (e) => { e.preventDefault(); togglePause(); });

if (pauseButton) pauseButton.addEventListener('click', togglePause);
if (restartButton) restartButton.addEventListener('click', () => {
    initAudio();
    resetGame();
});

// Canvas Touch Swipe Gestures
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    initAudio();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
    if (gameOver) {
        resetGame();
        return;
    }

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;
    const minSwipeDistance = 20;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) moveDirection('RIGHT');
            else moveDirection('LEFT');
        }
    } else {
        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0) moveDirection('DOWN');
            else moveDirection('UP');
        }
    }
}, { passive: true });

resetGame();
requestAnimationFrame(gameLoop);
