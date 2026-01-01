// -------------------- SETUP --------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
document.getElementById("score").textContent = score;

// -------------------- SNAKE --------------------
const snake = {
    x: 100,
    y: 300,
    width: 40,
    height: 20,
    yVelocity: 0,
    gravity: 1,
    jumpPower: -15
};

let onGround = false;
let gameOver = false;

// -------------------- WALLS --------------------
let walls = [];
const WALL_SPEED = 5;

function createWall() {
    const height = Math.floor(Math.random() * 40) + 40;
    return {
        x: WIDTH + Math.random() * 200,
        y: 350 - height,
        width: 30,
        height: height
    };
}

// fewer walls
walls.push(createWall());

// -------------------- SPIKES --------------------
let spikes = [];

function createSpike() {
    return {
        x: WIDTH + Math.random() * 300,
        y: 350,
        size: 30
    };
}

spikes.push(createSpike());

// -------------------- INPUT --------------------
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && onGround && !gameOver) {
        snake.yVelocity = snake.jumpPower;
    }
});

// -------------------- GAME LOOP --------------------
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (gameOver) {
        ctx.fillStyle = "#000";
        ctx.font = "36px Arial";
        ctx.fillText("GAME OVER - Refresh", 220, 200);
        return;
    }

    // GRAVITY
    snake.yVelocity += snake.gravity;
    snake.y += snake.yVelocity;

    // GROUND
    if (snake.y + snake.height >= 350) {
        snake.y = 350 - snake.height;
        snake.yVelocity = 0;
        onGround = true;
    } else {
        onGround = false;
    }

    // MOVE WALLS
    walls.forEach(w => w.x -= WALL_SPEED);

    // MOVE SPIKES
    spikes.forEach(s => s.x -= WALL_SPEED);

    // COLLISION WITH WALLS
    for (let w of walls) {
        if (
            snake.x < w.x + w.width &&
            snake.x + snake.width > w.x &&
            snake.y < w.y + w.height &&
            snake.y + snake.height > w.y
        ) {
            gameOver = true;
        }
    }

    // COLLISION WITH SPIKES
    for (let s of spikes) {
        if (
            snake.x + snake.width > s.x &&
            snake.x < s.x + s.size &&
            snake.y + snake.height > s.y - s.size
        ) {
            gameOver = true;
        }
    }

    // CLEAN & SPAWN
    walls = walls.filter(w => w.x + w.width > 0);
    spikes = spikes.filter(s => s.x + s.size > 0);

    if (walls.length === 0 || walls[walls.length - 1].x < WIDTH - 500) {
        walls.push(createWall());
        score++;
        document.getElementById("score").textContent = score;
    }

    if (spikes.length === 0 || spikes[spikes.length - 1].x < WIDTH - 400) {
        spikes.push(createSpike());
    }

    // -------------------- DRAW --------------------
    // Ground
    ctx.fillStyle = "#00c800";
    ctx.fillRect(0, 350, WIDTH, 50);

    // Walls
    ctx.fillStyle = "#8b4513";
    walls.forEach(w => ctx.fillRect(w.x, w.y, w.width, w.height));

    // Spikes
    ctx.fillStyle = "#555";
    spikes.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.size / 2, s.y - s.size);
        ctx.lineTo(s.x + s.size, s.y);
        ctx.closePath();
        ctx.fill();
    });

    // Snake
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(snake.x, snake.y, snake.width, snake.height);

    requestAnimationFrame(gameLoop);
}

gameLoop();

