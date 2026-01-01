// ================= SETUP =================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
document.getElementById("score").textContent = score;

let gameOver = false;

// ================= SNAKE =================
const snake = {
    x: 100,
    y: 300,
    w: 40,
    h: 20,
    yVel: 0,
    gravity: 1,
    jumpPower: -15
};

let onGround = false;

// ================= SPEED =================
let speed = 5;
const MAX_SPEED = 14;

function updateSpeed() {
    if (score >= 10 ()){
        speed = Math.min(5 + Math.floor((score - 10) / 3), MAX_SPEED);
    }
}

// ================= WALLS =================
let walls = [];

function createWall() {
    const h = Math.random() * 40 + 40;
    return { x: WIDTH + 100, y: 350 - h, w: 30, h };
}

walls.push(createWall());

// ================= SPIKES =================
let spikes = [];

function createSpike() {
    return {
        x: WIDTH + 100,
        size: 30,
        count: Math.random() < 0.5 ? 2 : 1
    };
}

// ================= JUMP =================
function jump() {
    if (onGround && !gameOver) {
        snake.yVel = snake.jumpPower;
    }
}

// KEYBOARD
document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

// MOBILE BUTTON (FIXED)
const jumpBtn = document.getElementById("jumpBtn");

jumpBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
}, { passive: false });

jumpBtn.addEventListener("click", e => {
    e.preventDefault();
    jump();
});

// ================= GAME LOOP =================
function loop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "36px Arial";
        ctx.fillText("GAME OVER - Refresh", 200, 200);
        return;
    }

    // Physics
    snake.yVel += snake.gravity;
    snake.y += snake.yVel;

    if (snake.y + snake.h >= 350) {
        snake.y = 350 - snake.h;
        snake.yVel = 0;
        onGround = true;
    } else {
        onGround = false;
    }

    // Move
    walls.forEach(w => w.x -= speed);
    spikes.forEach(s => s.x -= speed);

    // Collisions
    walls.forEach(w => {
        if (
            snake.x < w.x + w.w &&
            snake.x + snake.w > w.x &&
            snake.y < w.y + w.h &&
            snake.y + snake.h > w.y
        ) gameOver = true;
    });

    spikes.forEach(s => {
        if (
            snake.x + snake.w > s.x &&
            snake.x < s.x + s.size * s.count &&
            snake.y + snake.h > 350 - s.size
        ) gameOver = true;
    });

    // Cleanup
    walls = walls.filter(w => w.x + w.w > 0);
    spikes = spikes.filter(s => s.x + s.size * s.count > 0);

    // Spawn
    if (walls.length === 0 || walls[walls.length - 1].x < WIDTH - 300) {
        walls.push(createWall());
        score++;
        document.getElementById("score").textContent = score;
        updateSpeed();
        if (score >= 10) spikes.push(createSpike());
    }

    // Draw
    ctx.fillStyle = "#00c800";
    ctx.fillRect(0, 350, WIDTH, 50);

    ctx.fillStyle = "#8b4513";
    walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));

    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    spikes.forEach(s => {
        for (let i = 0; i < s.count; i++) {
            const x = s.x + i * s.size;
            ctx.beginPath();
            ctx.moveTo(x, 350);
            ctx.lineTo(x + s.size / 2, 350 - s.size);
            ctx.lineTo(x + s.size, 350);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    });

    ctx.fillStyle = "red";
    ctx.fillRect(snake.x, snake.y, snake.w, snake.h);

    requestAnimationFrame(loop);
}

loop();
