// ---------------- CANVAS ----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 330;

// ---------------- SCORE ----------------
let score = 0;
const scoreEl = document.getElementById("score");

// ---------------- SNAKE (BIG GREEN DOT) ----------------
const snake = {
    x: 120,
    y: GROUND_Y - 20,
    r: 18,          // radius (BIG DOT)
    vy: 0
};

const GRAVITY = 1;
const JUMP_POWER = -15;
let onGround = true;
let gameOver = false;

// ---------------- SPEED ----------------
let speed = 5;

// ---------------- OBSTACLES ----------------
let obstacles = [];
let spawnTimer = 0;

// WALL
function createWall() {
    return {
        type: "wall",
        x: WIDTH,
        w: 30,
        h: 60,
        y: GROUND_Y - 60
    };
}

// SPIKE
function createSpike(doubleSpike = false) {
    return {
        type: "spike",
        x: WIDTH,
        size: 30,
        double: doubleSpike
    };
}

// ---------------- INPUT ----------------
function jump() {
    if (onGround && !gameOver) {
        snake.vy = JUMP_POWER;
        onGround = false;
    }
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

document.getElementById("jumpBtn").addEventListener("click", jump);

// ---------------- COLLISION ----------------
function circleRectHit(cx, cy, r, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < r * r;
}

// ---------------- GAME LOOP ----------------
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (gameOver) {
        ctx.fillStyle = "#000";
        ctx.font = "36px Arial";
        ctx.fillText("GAME OVER", WIDTH / 2 - 110, HEIGHT / 2);
        return;
    }

    // SPEED INCREASE
    if (score >= 10) {
        speed = 5 + Math.floor(score / 5);
    }

    // GRAVITY
    snake.vy += GRAVITY;
    snake.y += snake.vy;

    // GROUND
    if (snake.y + snake.r >= GROUND_Y) {
        snake.y = GROUND_Y - snake.r;
        snake.vy = 0;
        onGround = true;
    }

    // MOVE OBSTACLES
    obstacles.forEach(o => o.x -= speed);
    obstacles = obstacles.filter(o => o.x + 60 > 0);

    // SPAWN LOGIC (FIXED – NO EMPTY SCREEN)
    spawnTimer++;
    if (spawnTimer > 90) {
        spawnTimer = 0;

        if (score >= 10) {
            obstacles.push(createSpike(Math.random() < 0.5));
        } else {
            obstacles.push(createWall());
        }

        score++;
        scoreEl.textContent = score;
    }

    // COLLISION CHECK
    obstacles.forEach(o => {
        if (o.type === "wall") {
            if (
                circleRectHit(
                    snake.x,
                    snake.y,
                    snake.r,
                    { x: o.x, y: o.y, w: o.w, h: o.h }
                )
            ) {
                gameOver = true;
            }
        } else {
            const count = o.double ? 2 : 1;
            for (let i = 0; i < count; i++) {
                const rect = {
                    x: o.x + i * o.size,
                    y: GROUND_Y - o.size,
                    w: o.size,
                    h: o.size
                };
                if (circleRectHit(snake.x, snake.y, snake.r, rect)) {
                    gameOver = true;
                }
            }
        }
    });

    // ---------------- DRAW ----------------
    // Ground
    ctx.fillStyle = "#00c800";
    ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

    // Snake (GREEN DOT)
    ctx.fillStyle = "#2ecc71";
    ctx.beginPath();
    ctx.arc(snake.x, snake.y, snake.r, 0, Math.PI * 2);
    ctx.fill();

    // Obstacles
    obstacles.forEach(o => {
        if (o.type === "wall") {
            ctx.fillStyle = "#8b4513";
            ctx.fillRect(o.x, o.y, o.w, o.h);
        } else {
            ctx.fillStyle = "#000";
            const count = o.double ? 2 : 1;
            for (let i = 0; i < count; i++) {
                const x = o.x + i * o.size;
                ctx.beginPath();
                ctx.moveTo(x, GROUND_Y);
                ctx.lineTo(x + o.size / 2, GROUND_Y - o.size);
                ctx.lineTo(x + o.size, GROUND_Y);
                ctx.closePath();
                ctx.fill();
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
