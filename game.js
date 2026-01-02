// ================== CANVAS ==================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ================== GAME STATE ==================
let score = 0;
let gameOver = false;
let speed = 5;

const scoreEl = document.getElementById("score");

// ================== SNAKE ==================
const snake = {
    x: 100,
    y: 300,
    w: 50,
    h: 50,
    velY: 0,
    gravity: 1,
    jump: -16
};

let onGround = false;

// ================== SNAKE IMAGE ==================
const snakeImg = new Image();
snakeImg.src = "snake.png"; // MUST be in same folder

let snakeImgLoaded = false;
snakeImg.onload = () => snakeImgLoaded = true;

// ================== WALLS ==================
let walls = [];

function spawnWall() {
    return {
        type: "wall",
        x: WIDTH + 50,
        w: 40,
        h: 80 + Math.random() * 60
    };
}

// ================== SPIKES ==================
let spikes = [];

function spawnSpike(double = false) {
    const baseX = WIDTH + 50;
    return double ? [
        { type: "spike", x: baseX, size: 30 },
        { type: "spike", x: baseX + 35, size: 30 }
    ] : [
        { type: "spike", x: baseX, size: 30 }
    ];
}

// ================== INPUT ==================
function jump() {
    if (onGround && !gameOver) {
        snake.velY = snake.jump;
    }
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

canvas.addEventListener("mousedown", jump);
canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
});

// ================== GAME LOOP ==================
function loop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (gameOver) {
        ctx.fillStyle = "#000";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", WIDTH / 2 - 120, HEIGHT / 2);
        return;
    }

    // SPEED SCALE (GOD MODE)
    if (score >= 10) {
        speed = 5 + (score - 9) * 0.4;
    }

    // ================== PHYSICS ==================
    snake.velY += snake.gravity;
    snake.y += snake.velY;

    if (snake.y + snake.h >= 350) {
        snake.y = 350 - snake.h;
        snake.velY = 0;
        onGround = true;
    } else {
        onGround = false;
    }

    // ================== SPAWN LOGIC ==================
    if (walls.length === 0 && spikes.length === 0) {
        if (score >= 10 && Math.random() < 0.5) {
            spikes.push(...spawnSpike(Math.random() < 0.5));
        } else {
            walls.push(spawnWall());
        }
    }

    // ================== UPDATE WALLS ==================
    walls.forEach(w => w.x -= speed);
    walls = walls.filter(w => w.x + w.w > 0);

    // ================== UPDATE SPIKES ==================
    spikes.forEach(s => s.x -= speed);
    spikes = spikes.filter(s => s.x + s.size > 0);

    // ================== COLLISIONS ==================
    for (let w of walls) {
        const wy = 350 - w.h;
        if (
            snake.x < w.x + w.w &&
            snake.x + snake.w > w.x &&
            snake.y < wy + w.h &&
            snake.y + snake.h > wy
        ) {
            gameOver = true;
        }
    }

    for (let s of spikes) {
        if (
            snake.x + snake.w > s.x &&
            snake.x < s.x + s.size &&
            snake.y + snake.h > 350 - s.size
        ) {
            gameOver = true;
        }
    }

    // ================== SCORE ==================
    if (walls.length === 0 && spikes.length === 0) {
        score++;
        scoreEl.textContent = score;
    }

    // ================== DRAW ==================

    // Sky
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Ground
    ctx.fillStyle = "#00c800";
    ctx.fillRect(0, 350, WIDTH, 50);

    // Walls
    ctx.fillStyle = "#8b4513";
    walls.forEach(w => {
        ctx.fillRect(w.x, 350 - w.h, w.w, w.h);
    });

    // Spikes
    ctx.fillStyle = "#000";
    spikes.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s.x, 350);
        ctx.lineTo(s.x + s.size / 2, 350 - s.size);
        ctx.lineTo(s.x + s.size, 350);
        ctx.closePath();
        ctx.fill();
    });

    // Snake
    if (snakeImgLoaded) {
        ctx.drawImage(snakeImg, snake.x, snake.y, snake.w, snake.h);
    } else {
        ctx.fillStyle = "red"; // fallback
        ctx.fillRect(snake.x, snake.y, snake.w, snake.h);
    }

    requestAnimationFrame(loop);
}

loop();
