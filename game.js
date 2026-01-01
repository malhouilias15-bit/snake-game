// ==================== SETUP ====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
document.getElementById("score").textContent = score;

let gameOver = false;

// ==================== SNAKE ====================
const snake = {
    x: 100,
    y: 300,
    width: 40,
    height: 20,
    yVel: 0,
    gravity: 1,
    jump: -15
};

let onGround = false;

// ==================== WALLS & SPIKES ====================
let obstacles = [];
const SPEED = 5;

function createObstacle() {
    const wallHeight = Math.floor(Math.random() * 40) + 40;

    const obstacle = {
        x: WIDTH + 50,
        wall: {
            y: 350 - wallHeight,
            width: 30,
            height: wallHeight
        },
        spike: null
    };

    // AFTER SCORE 10 → ADD SPIKE WITH WALL
    if (score >= 10) {
        obstacle.spike = {
            size: 30
        };
    }

    return obstacle;
}

// spawn first wall
obstacles.push(createObstacle());

// ==================== INPUT ====================
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && onGround && !gameOver) {
        snake.yVel = snake.jump;
    }
});

// ==================== GAME LOOP ====================
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (gameOver) {
        ctx.fillStyle = "#000";
        ctx.font = "36px Arial";
        ctx.fillText("GAME OVER - Refresh", 220, 200);
        return;
    }

    // ----- PHYSICS -----
    snake.yVel += snake.gravity;
    snake.y += snake.yVel;

    if (snake.y + snake.height >= 350) {
        snake.y = 350 - snake.height;
        snake.yVel = 0;
        onGround = true;
    } else {
        onGround = false;
    }

    // ----- MOVE OBSTACLES -----
    obstacles.forEach(o => o.x -= SPEED);

    // ----- COLLISION -----
    for (let o of obstacles) {
        // WALL COLLISION
        if (
            snake.x < o.x + o.wall.width &&
            snake.x + snake.width > o.x &&
            snake.y < o.wall.y + o.wall.height &&
            snake.y + snake.height > o.wall.y
        ) {
            gameOver = true;
        }

        // SPIKE COLLISION (only if exists)
        if (o.spike) {
            if (
                snake.x + snake.width > o.x &&
                snake.x < o.x + o.spike.size &&
                snake.y + snake.height > 350 - o.spike.size
            ) {
                gameOver = true;
            }
        }
    }

    // ----- CLEAN & SPAWN -----
    obstacles = obstacles.filter(o => o.x + 40 > 0);

    if (
        obstacles.length === 0 ||
        obstacles[obstacles.length - 1].x < WIDTH - 350
    ) {
        obstacles.push(createObstacle());
        score++;
        document.getElementById("score").textContent = score;
    }

    // ==================== DRAW ====================
    // Ground
    ctx.fillStyle = "#00c800";
    ctx.fillRect(0, 350, WIDTH, 50);

    obstacles.forEach(o => {
        // Wall
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(o.x, o.wall.y, o.wall.width, o.wall.height);

        // Spike (only after score 10)
        if (o.spike) {
            ctx.fillStyle = "#555";
            ctx.beginPath();
            ctx.moveTo(o.x, 350);
            ctx.lineTo(o.x + o.spike.size / 2, 350 - o.spike.size);
            ctx.lineTo(o.x + o.spike.size, 350);
            ctx.closePath();
            ctx.fill();
        }
    });

    // Snake
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(snake.x, snake.y, snake.width, snake.height);

    requestAnimationFrame(gameLoop);
}

gameLoop();
