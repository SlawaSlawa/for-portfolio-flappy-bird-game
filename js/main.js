"use strict";

const canvas = document.getElementById("canvas");
canvas.width = 288;
canvas.height = 512;
// canvas.width = 280;
// canvas.height = 446;
const ctx = canvas.getContext("2d");

const restartBtn = document.getElementById("restart-btn");
const overlayEl = document.getElementById("overlay");
const overlayScoreEl = document.getElementById("overlay-score");
const overlayRecordEl = document.getElementById("overlay-record");
const buttonSound = document.getElementById("button-sound");
const buttonNoSound = document.getElementById("button-no-sound");

const bird = new Image();
const bg = new Image();
const fg = new Image();
const pipeUp = new Image();
const pipeBottom = new Image();

bird.src = "images/flappy_bird_bird.png";
bg.src = "images/flappy_bird_bg.png";
fg.src = "images/flappy_bird_fg.png";
pipeUp.src = "images/flappy_bird_pipeUp.png";
pipeBottom.src = "images/flappy_bird_pipeBottom.png";

const flyAudio = new Audio();
const scoreAudio = new Audio();

flyAudio.src = "audio/fly.mp3";
scoreAudio.src = "audio/score.mp3";

const gap = 90;
let speed = 1;
let changeSpeed = true;
let changeScore = true;
let isMovePipes = true;
let gravity = 1;
let birdJump = 20;

let score = 0;
let record = localStorage.getItem("flappy-bird-game") || 0;
let animationId = null;
let isAudio = true;
let isGameOver = false;

const birdPosition = {
    x: 20,
    y: 150,
};
const pipePositions = [
    {
        x: canvas.width,
        y: 0,
    },
];

function moveBirdBottom() {
    birdPosition.y += gravity;
}

function moveBirdUp() {
    if (isAudio) flyAudio.play();
    birdPosition.y -= birdJump;
}

function movePipes() {
    for (let i = 0; i < pipePositions.length; i++) {
        pipePositions[i].x = pipePositions[i].x - speed;
        if (pipePositions[i].x < 50 && isMovePipes) {
            isMovePipes = false;
            pipePositions.push({
                x: canvas.width,
                y: Math.floor(Math.random() * pipeUp.height) - pipeUp.height,
            });
        }

        if (pipePositions[i].x < 0 - pipeUp.width - 10) {
            pipePositions.shift();
            isMovePipes = true;
            changeScore = true;
        }

        if (pipePositions[i].x < 10 && changeScore) {
            if (isAudio) scoreAudio.play();
            score++;
            changeScore = false;
            changeSpeed = true;
        }

        ctx.drawImage(pipeUp, pipePositions[i].x, pipePositions[i].y);
        ctx.drawImage(
            pipeBottom,
            pipePositions[i].x,
            pipePositions[i].y + pipeUp.height + gap
        );

        if (hasCollision(i)) gameOver();
    }
}

function hasCollision(index) {
    let collision = false;

    if (
        (birdPosition.x + bird.width >= pipePositions[index].x &&
            birdPosition.x <= pipePositions[index].x + pipeUp.width &&
            (birdPosition.y <= pipePositions[index].y + pipeUp.height ||
                birdPosition.y + bird.height >=
                    pipePositions[index].y + pipeUp.height + gap)) ||
        birdPosition.y + bird.height >= canvas.height - fg.height ||
        birdPosition.y <= 0
    ) {
        collision = true;
    }

    return collision;
}

function renderScore() {
    ctx.fillStyle = "green";
    ctx.font = "28px Arial";
    ctx.fillText(`Score: ${score}`, 10, canvas.height - 20);
}

function renderResultWindow() {
    overlayScoreEl.textContent = score;
    if (score > record) {
        record = score;
        localStorage.setItem("flappy-bird-game", record);
    }
    overlayRecordEl.textContent = record;
}

function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    document.removeEventListener("keydown", moveBirdUp);
    document.removeEventListener("click", moveBirdUp);
    overlayEl.classList.add("overlay--active");
    renderResultWindow();
}

function moveGame() {
    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(bird, birdPosition.x, birdPosition.y);
    moveBirdBottom();
    movePipes();
    ctx.drawImage(fg, 0, canvas.height - fg.height);
    renderScore();

    if (score % 3 === 0 && score !== 0 && changeSpeed) {
        speed++;
        gravity++;
        birdJump += 10;
        changeSpeed = false;
    }

    if (!isGameOver) {
        animationId = requestAnimationFrame(moveGame);
    }
}

document.addEventListener("keydown", moveBirdUp);
document.addEventListener("click", moveBirdUp);
restartBtn.addEventListener("click", () => {
    location.reload();
});
buttonSound.addEventListener("click", () => {
    buttonSound.classList.remove("sound-button--active");
    buttonNoSound.classList.add("sound-button--active");
    isAudio = false;
});
buttonNoSound.addEventListener("click", () => {
    buttonSound.classList.add("sound-button--active");
    buttonNoSound.classList.remove("sound-button--active");
    isAudio = true;
});
window.onload = moveGame;
