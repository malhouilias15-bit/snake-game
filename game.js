// ================= CANVAS =================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 320;

// ================= SCORE =================
let score = 0;
const scoreEl = document.getElementById("score");

// ================= SNAKE IMAGE =================
const snakeImg = new Image();
snakeImg.src = "snake.png";
let snakeLoaded = false;

snakeImg.onload = () => {
    snakeLoaded = true;
};

// ================= SNAKE =================
const snake = {
    x: 100,
    y: GROUND_Y - 50,
    w: 50,
    h: 50,
    vy: 0
};

const GRAVITY = 0.8;
const JUMP_FORCE = -14;
let onGround = true;
let gameOver = false;

// ================= SPEED =================
let speed = 4;

// ================= WALLS =================
let walls = [];

function spawnWall() {
    const h = 40 + Math.random() * 60;
    walls.push({
        x: WIDTH + 200, // spawn farther → FIX instant death
        y: GROUND_Y - h,
        w: 30,
        h
    });
}

// ================= SPIKES =================
let spikes = [];

function spawnSpikes() {
    const baseX = WIDTH + 200;
    const doubleSpike = Math.random() < 0.5;

    spikes.push({ x: baseX, size: 25 });
    if (doubleSpike) {
        spikes.push({ x: baseX + 28, size: 25 });
    }
}

// ================= INPUT =================
function jump() {
    if (onGround && !gameOver) {
        snake.vy = JUMP_FORCE;
        onGround = false;
    }
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

const jumpBtn = document.getElementById("jumpBtn");
if (jumpBtn) {
    jumpBtn.addEventListener("touchstart", e => {
        e.preventDefault();
        jump();
    });
    jumpBtn.addEventListener("click", jump);
}

// ================= GAME LOOP =================
function loop() {
    if (!snakeLoaded) {
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("Loading...", WIDTH / 2 - 50, HEIGHT / 2);
        requestAnimationFrame(loop);
        return;
    }

    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", WIDTH / 2 - 90, HEIGHT / 2);
        return;
    }

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Speed scaling
    if (score >= 10) {
        speed = 4 + (score - 10) * 0.2;
    }

    // Gravity
    snake.vy += GRAVITY;
    snake.y += snake.vy;

    if (snake.y + snake.h >= GROUND_Y) {
        snake.y = GROUND_Y - snake.h;
        snake.vy = 0;
        onGround = true;
    }

    // Move
    walls.forEach(w => w.x -= speed);
    spikes.forEach(s => s.x -= speed);

    // Collisions
    if (score < 10) {
        for (let w of walls) {
            if (
                snake.x < w.x + w.w &&
                snake.x + snake.w > w.x &&
                snake.y < w.y + w.h &&
                snake.y + snake.h > w.y
            ) gameOver = true;
        }
    } else {
        for (let s of spikes) {
            if (
                snake.x + snake.w > s.x &&
                snake.x < s.x + s.size &&
                snake.y + snake.h > GROUND_Y - s.size
            ) gameOver = true;
        }
    }

    // Cleanup
    walls = walls.filter(w => w.x + w.w > 0);
    spikes = spikes.filter(s => s.x + s.size > 0);

    // Spawn
    if (score < 10) {
        spikes = [];
        if (walls.length === 0 || walls[walls.length - 1].x < WIDTH - 500) {
            spawnWall();
            score++;
        }
    } else {
        walls = [];
        if (spikes.length === 0 || spikes[spikes.length - 1].x < WIDTH - 400) {
            spawnSpikes();
            score++;
        }
    }

    scoreEl.textContent = score;

    // Draw ground
    ctx.fillStyle = "#00c800";
    ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

    // Draw walls
    ctx.fillStyle = "#8b4513";
    walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));

    // Draw spikes
    ctx.fillStyle = "#555";
    spikes.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s.x, GROUND_Y);
        ctx.lineTo(s.x + s.size / 2, GROUND_Y - s.size);
        ctx.lineTo(s.x + s.size, GROUND_Y);
        ctx.fill();
    });

    // Draw snake IMAGE
    ctx.drawImage(snakeImg, snake.x, snake.y, snake.w, snake.h);

    requestAnimationFrame(loop);
}

loop();

