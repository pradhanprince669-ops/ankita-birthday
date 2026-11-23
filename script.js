/* =========================================
   ANKITA BIRTHDAY WEBSITE
   Countdown + Fireworks + Cake + Gift
========================================= */

"use strict";

/* =========================================
   1. SETTINGS
========================================= */

// Birthday: 25 November 2026, 12:00 AM IST
const BIRTHDAY_DATE = new Date(
    "2026-11-25T00:00:00+05:30"
).getTime();

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);

let currentPage = "";
let countdownInterval = null;
let backgroundInterval = null;
let petalInterval = null;

let birthdayCelebrated = false;
let candlesBlown = false;
let giftOpened = false;


/* =========================================
   2. PAGE NAVIGATION
========================================= */

function showPage(pageId) {
    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
        console.error("Page not found:", pageId);
        return;
    }

    if (currentPage === pageId) {
        return;
    }

    const previousPage = currentPage;

    // Stop effects belonging to the previous page.
    stopRosePetals();

    $$(".page").forEach((page) => {
        page.classList.remove("active");
    });

    targetPage.classList.add("active");

    currentPage = pageId;

    // Return the page to the top.
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    // Start page-specific effects.
    if (pageId === "birthday-page") {
        startBirthdayCelebration();
    }

    if (pageId === "rose-page") {
        startRosePetals();
    }

    if (pageId === "finale-page") {
        startFinalCelebration();
    }

    // Clean up fireworks if navigating away from celebration pages.
    if (
        pageId !== "birthday-page" &&
        pageId !== "finale-page"
    ) {
        stopFireworks();
    }

    // Accessibility: update the document title.
    const pageTitles = {
        "countdown-page": "A Surprise Is Coming ♡",
        "birthday-page": "Happy Birthday Ankita! 🎂",
        "cake-page": "Make a Wish 🎂",
        "letter-page": "A Little Letter 💌",
        "rose-page": "A Garden of Wishes 🌹",
        "gallery-page": "Beautiful Moments 📸",
        "reasons-page": "10 Things That Make You Special ♡",
        "gift-page": "A Little Surprise 🎁",
        "finale-page": "Happy Birthday Ankita! 🎆"
    };

    document.title =
        pageTitles[pageId] || "For Ankita ❤️";
}


// Buttons that navigate to another page.
$$("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
        const nextPage = button.dataset.next;
        showPage(nextPage);
    });
});


/* =========================================
   3. LIVE COUNTDOWN
========================================= */

const countdownPage = $("#countdown-page");

function updateCountdown() {
    const now = Date.now();
    const remaining = BIRTHDAY_DATE - now;

    // Automatically advance when the countdown finishes.
    if (remaining <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;

        if (countdownPage) {
            countdownPage.style.display = "none";
        }

        showPage("birthday-page");
        return;
    }

    const days = Math.floor(
        remaining / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (remaining / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (remaining / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (remaining / 1000) % 60
    );

    $("#days").textContent = String(days).padStart(2, "0");

    $("#hours").textContent = String(hours).padStart(2, "0");

    $("#minutes").textContent =
        String(minutes).padStart(2, "0");

    $("#seconds").textContent =
        String(seconds).padStart(2, "0");
}


function initializeWebsite() {
    // If the birthday has already arrived, skip the countdown.
    if (Date.now() >= BIRTHDAY_DATE) {
        showPage("birthday-page");
        return;
    }

    showPage("countdown-page");

    updateCountdown();

    countdownInterval = setInterval(
        updateCountdown,
        1000
    );
}


/* =========================================
   4. BACKGROUND STARS AND HEARTS
========================================= */

const backgroundEffects = $("#background-effects");

function createStar() {
    if (!backgroundEffects) return;

    const star = document.createElement("span");

    star.className = "bg-star";
    star.textContent = Math.random() > 0.5 ? "✦" : "✧";

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    star.style.fontSize =
        (7 + Math.random() * 12) + "px";

    star.style.animationDelay =
        Math.random() * 3 + "s";

    backgroundEffects.appendChild(star);

    setTimeout(() => {
        star.remove();
    }, 8000);
}


function createFloatingHeart() {
    if (!backgroundEffects) return;

    const heart = document.createElement("span");

    heart.className = "bg-heart";

    const heartSymbols = ["♡", "♥", "💗", "✧"];

    heart.textContent =
        heartSymbols[
            Math.floor(Math.random() * heartSymbols.length)
        ];

    heart.style.left = Math.random() * 100 + "%";

    heart.style.fontSize =
        (12 + Math.random() * 18) + "px";

    heart.style.color =
        Math.random() > 0.5 ? "#ff9ebc" : "#d8c4ff";

    heart.style.animationDuration =
        (9 + Math.random() * 8) + "s";

    backgroundEffects.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 18000);
}


function startBackgroundEffects() {
    if (backgroundInterval !== null) return;

    // Create a small initial star field.
    for (let i = 0; i < 25; i++) {
        createStar();
    }

    backgroundInterval = setInterval(() => {
        createStar();

        if (Math.random() > 0.35) {
            createFloatingHeart();
        }
    }, 650);
}


/* =========================================
   5. FIREWORKS ENGINE
========================================= */

const canvas = $("#fireworks-canvas");
const ctx = canvas.getContext("2d");

let canvasWidth = 0;
let canvasHeight = 0;

let fireworks = [];
let particles = [];

let fireworksAnimation = null;
let fireworksTimer = null;
let fireworksActive = false;


function resizeCanvas() {
    const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);

    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}


function createFirework(x, y) {
    const colors = [
        "#ff8db3",
        "#ffe7a5",
        "#d6aaff",
        "#a9edff",
        "#ffffff",
        "#ffb0d0",
        "#ffcc88"
    ];

    const color =
        colors[Math.floor(Math.random() * colors.length)];

    const particleCount = Math.floor(
        randomBetween(45, 85)
    );

    for (let i = 0; i < particleCount; i++) {
        const angle =
            (Math.PI * 2 * i) / particleCount;

        const speed = randomBetween(1.1, 4.2);

        particles.push({
            x,
            y,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,

            alpha: 1,

            radius: randomBetween(1, 2.5),

            color,

            decay: randomBetween(0.009, 0.018),

            gravity: 0.035
        });
    }
}


function launchFirework() {
    if (!fireworksActive) return;

    const x = randomBetween(
        canvasWidth * 0.12,
        canvasWidth * 0.88
    );

    const y = randomBetween(
        canvasHeight * 0.12,
        canvasHeight * 0.55
    );

    createFirework(x, y);
}


function animateFireworks() {
    if (!fireworksActive) {
        fireworksAnimation = null;
        return;
    }

    // A translucent fill creates gentle trails.
    ctx.fillStyle = "rgba(22, 14, 38, 0.17)";

    ctx.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.vy += particle.gravity;

        particle.vx *= 0.992;
        particle.vy *= 0.992;

        particle.alpha -= particle.decay;

        if (particle.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();

        ctx.globalAlpha = particle.alpha;

        ctx.fillStyle = particle.color;

        ctx.shadowBlur = 8;
        ctx.shadowColor = particle.color;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

    fireworksAnimation =
        requestAnimationFrame(animateFireworks);
}


function startFireworks() {
    if (fireworksActive) return;

    fireworksActive = true;

    ctx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    fireworksTimer = setInterval(() => {
        launchFirework();

        if (Math.random() > 0.55) {
            setTimeout(launchFirework, 250);
        }
    }, 750);

    animateFireworks();
}


function stopFireworks() {
    fireworksActive = false;

    if (fireworksTimer !== null) {
        clearInterval(fireworksTimer);
        fireworksTimer = null;
    }

    if (fireworksAnimation !== null) {
        cancelAnimationFrame(fireworksAnimation);
        fireworksAnimation = null;
    }

    particles = [];

    ctx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );
}


/* =========================================
   6. CONFETTI
========================================= */

function createConfetti(amount = 100) {
    const colors = [
        "#ff9ebc",
        "#ffe3a1",
        "#c8b5ff",
        "#a9edff",
        "#ffffff"
    ];

    for (let i = 0; i < amount; i++) {
        const piece = document.createElement("span");

        const width = randomBetween(4, 9);
        const height = randomBetween(7, 14);

        piece.style.position = "fixed";

        piece.style.left =
            randomBetween(0, 100) + "vw";

        piece.style.top = "-20px";

        piece.style.width = width + "px";
        piece.style.height = height + "px";

        piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.borderRadius =
            Math.random() > 0.5 ? "50%" : "2px";

        piece.style.zIndex = "90";
        piece.style.pointerEvents = "none";

        document.body.appendChild(piece);

        const duration = randomBetween(2500, 5000);

        const horizontalDrift =
            randomBetween(-150, 150);

        const animation = piece.animate(
            [
                {
                    transform: "translate3d(0,0,0) rotate(0deg)",
                    opacity: 1
                },
                {
                    transform:
                        `translate3d(${horizontalDrift}px, ` +
                        `${window.innerHeight + 60}px, 0) ` +
                        `rotate(${randomBetween(300, 1000)}deg)`,
                    opacity: 0.1
                }
            ],
            {
                duration,
                easing: "cubic-bezier(.25,.46,.45,.94)",
                fill: "forwards"
            }
        );

        animation.onfinish = () => piece.remove();
    }
}


/* =========================================
   7. BIRTHDAY CELEBRATION
========================================= */

function startBirthdayCelebration() {
    if (!birthdayCelebrated) {
        birthdayCelebrated = true;

        startFireworks();

        createConfetti(130);

        // A second burst adds a more celebratory entrance.
        setTimeout(() => {
            if (currentPage === "birthday-page") {
                createConfetti(80);
            }
        }, 1300);
    } else {
        startFireworks();
    }
}


/* =========================================
   8. CANDLE BLOW INTERACTION
========================================= */

const blowButton = $("#blow-candles");
const cakeScene = $(".cake-scene");
const candleMessage = $("#candle-message");

if (blowButton) {
    blowButton.addEventListener("click", () => {
        if (candlesBlown) {
            candleMessage.textContent =
                "Your wish is on its way. Keep smiling! ♡";

            return;
        }

        candlesBlown = true;

        // Extinguish all flames.
        cakeScene.classList.add("candles-out");

        candleMessage.textContent =
            "Wish made! May your dreams come true. ✨💖";

        blowButton.textContent = "Wish Made! ❤️";

        blowButton.disabled = true;

        createConfetti(65);
    });
}


/* =========================================
   9. ROSE PETAL ANIMATION
========================================= */

const petalContainer = $("#petal-container");

function createPetal() {
    if (!petalContainer) return;

    // Prevent excessive elements on smaller phones.
    if (petalContainer.childElementCount > 35) {
        return;
    }

    const petal = document.createElement("span");

    petal.className = "petal";

    petal.style.left = randomBetween(0, 100) + "%";

    petal.style.width =
        randomBetween(9, 17) + "px";

    petal.style.height =
        randomBetween(13, 23) + "px";

    const duration = randomBetween(6, 12);

    petal.style.animationDuration = duration + "s";

    petal.style.opacity = randomBetween(0.45, 0.9);

    petalContainer.appendChild(petal);

    setTimeout(() => {
        petal.remove();
    }, duration * 1000 + 300);
}


function startRosePetals() {
    if (petalInterval !== null) return;

    for (let i = 0; i < 12; i++) {
        setTimeout(createPetal, i * 180);
    }

    petalInterval = setInterval(createPetal, 450);
}


function stopRosePetals() {
    if (petalInterval !== null) {
        clearInterval(petalInterval);
        petalInterval = null;
    }

    if (petalContainer) {
        petalContainer.replaceChildren();
    }
}


/* =========================================
   10. GIFT BOX REVEAL
========================================= */

const giftButton = $("#gift-button");
const giftMessage = $("#gift-message");

if (giftButton) {
    giftButton.addEventListener("click", () => {
        if (giftOpened) return;

        giftOpened = true;

        giftMessage.classList.add("show");

        giftButton.querySelector(".gift-box-emoji").textContent =
            "💝";

        giftButton.querySelector(".gift-open-label").textContent =
            "Your Gift Is Open!";

        giftButton.disabled = true;

        createConfetti(100);
    });
}


/* =========================================
   11. FINAL CELEBRATION
========================================= */

function startFinalCelebration() {
    startFireworks();

    // A gentle burst on entering the final page.
    createConfetti(100);
}


const finalFireworksButton = $("#final-fireworks");

if (finalFireworksButton) {
    finalFireworksButton.addEventListener("click", () => {
        startFireworks();

        createConfetti(120);

        // Add a couple of immediate fireworks.
        launchFirework();

        setTimeout(launchFirework, 300);
        setTimeout(launchFirework, 650);
    });
}


/* =========================================
   12. BACKGROUND MUSIC
   Generated gentle melody using Web Audio.
   No external audio file is required.
========================================= */

const musicToggle = $("#music-toggle");
const musicStatus = $("#music-status");

let audioContext = null;
let musicPlaying = false;
let musicTimer = null;
let noteIndex = 0;

let masterGain = null;

// A gentle original repeating sequence.
// Frequencies are musical notes, not a song recording.
const melody = [
    261.63, 329.63, 392.00, 329.63,
    293.66, 349.23, 440.00, 349.23,
    261.63, 329.63, 392.00, 523.25,
    440.00, 392.00, 329.63, 293.66
];


function playMusicNote(frequency) {
    if (!audioContext || !masterGain) return;

    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();

    const noteGain = audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
        frequency,
        now
    );

    noteGain.gain.setValueAtTime(
        0.0001,
        now
    );

    noteGain.gain.exponentialRampToValueAtTime(
        0.035,
        now + 0.08
    );

    noteGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.8
    );

    oscillator.connect(noteGain);

    noteGain.connect(masterGain);

    oscillator.start(now);

    oscillator.stop(now + 0.85);

    oscillator.onended = () => {
        oscillator.disconnect();
        noteGain.disconnect();
    };
}


async function startMusic() {
    const backgroundMusic = document.getElementById("background-music");

    if (!backgroundMusic) {
        musicStatus.textContent = "Music file not found";
        return;
    }

    try {
        await backgroundMusic.play();

        musicPlaying = true;
        musicStatus.textContent = "Music On";

        musicToggle.setAttribute(
            "aria-label",
            "Turn background music off"
        );
    } catch (error) {
        musicStatus.textContent = "Tap to Play";
    }
}

function stopMusic() {
    const backgroundMusic = document.getElementById("background-music");

    musicPlaying = false;

    if (backgroundMusic) {
        backgroundMusic.pause();
    }

    musicStatus.textContent = "Music Off";

    musicToggle.setAttribute(
        "aria-label",
        "Turn background music on"
    );
}


if (musicToggle) {
    musicToggle.addEventListener("click", async () => {
        if (musicPlaying) {
            stopMusic();
        } else {
            await startMusic();
        }
    });
}


/* =========================================
   13. VISIBILITY AND PERFORMANCE
========================================= */

// Pause the music while the tab is hidden.
// The countdown uses real time and will remain accurate.
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (musicPlaying && audioContext) {
            audioContext.suspend();
        }

        stopFireworks();
    } else {
        if (
            musicPlaying &&
            audioContext &&
            audioContext.state === "suspended"
        ) {
            audioContext.resume();
        }

        // Restart fireworks only on celebration pages.
        if (
            currentPage === "birthday-page" ||
            currentPage === "finale-page"
        ) {
            startFireworks();
        }

        // Re-check the countdown after returning to the tab.
        if (currentPage === "countdown-page") {
            updateCountdown();
        }
    }
});


/* =========================================
   14. START WEBSITE
========================================= */

function startWebsite() {
    startBackgroundEffects();

    initializeWebsite();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        startWebsite,
        { once: true }
    );
} else {
    startWebsite();
}
