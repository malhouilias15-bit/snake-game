const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.7;
const jumpForce = -14;

let speed = 5;
let score = 0;
let gameOver = false;

const music = document.getElementById("bgMusic");

function startMusic() {
    if (music && music.paused) {
        music.volume = 0.5;
        music.play().catch(() => {});
    }
}

/* SNAKE */
const snake = {
    x: 150,
    y: canvas.height / 2,
    r: 14, // BIG GREEN DOT
    vy: 0
};

/* WALLS & SPIKES */
let obstacles = [];

function spawnWall() {
    const gap = 160;
    const wallWidth = 40;
    const topHeight = Math.random() * (canvas.height - gap - 200) + 100;

    obstacles.push({
        type: "wall",
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - (topHeight + gap)
    });
}

function spawnSpike() {
    const spikeY = canvas.height - 60;
    const isDouble = Math.random() < 0.5;

    obstacles.push({
        type: "spike",
        x: canvas.width,
        y: spikeY
    });

    if (isDouble) {
        obstacles.push({
            type: "spike",
            x: canvas.width + 30,
            y: spikeY
        });
    }
}

/* INPUT */
function jump() {
    if (gameOver) return;
    snake.vy = jumpForce;
    startMusic();
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

document.addEventListener("mousedown", jump);
document.getElementById("jumpBtn").addEventListener("touchstart", jump);

/* GAME LOOP */
let frame = 0;

function update() {
    if (gameOver) return;

    frame++;

    snake.vy += gravity;
    snake.y += snake.vy;

    if (snake.y + snake.r > canvas.height || snake.y - snake.r < 0) {
        gameOver = true;
    }

    if (frame % 90 === 0) {
        if (score < 10) {
            spawnWall();
        } else {
            spawnSpike();
        }
    }

    obstacles.forEach(o => o.x -= speed);

    obstacles = obstacles.filter(o => o.x > -100);

    // COLLISIONS
    obstacles.forEach(o => {
        if (o.type === "wall") {
            if (
                snake.x + snake.r > o.x &&
                snake.x - snake.r < o.x + 40 &&
                (snake.y - snake.r < o.top ||
                 snake.y + snake.r > canvas.height - o.bottom)
            ) {
                gameOver = true;
            }
        }

        if (o.type === "spike") {
            if (
                snake.x + snake.r > o.x &&
                snake.x - snake.r < o.x + 20 &&
                snake.y + snake.r > o.y
            ) {
                gameOver = true;
            }
        }
    });

    if (frame % 120 === 0) {
        score++;
        if (score >= 10) speed += 0.3; // GOD MODE SPEED
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // SNAKE
    ctx.fillStyle = "#00ff6a";
    ctx.beginPath();
    ctx.arc(snake.x, snake.y, snake.r, 0, Math.PI * 2);
    ctx.fill();

    // OBSTACLES
    obstacles.forEach(o => {
        if (o.type === "wall") {
            ctx.fillStyle = "#555";
            ctx.fillRect(o.x, 0, 40, o.top);
            ctx.fillRect(o.x, canvas.height - o.bottom, 40, o.bottom);
        }

        if (o.type === "spike") {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(o.x + 10, o.y - 20);
            ctx.lineTo(o.x + 20, o.y);
            ctx.closePath();
            ctx.fill();
        }
    });

    // SCORE
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
