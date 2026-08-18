/* =========================================================
   CINEMATIC BIRTHDAY EXPERIENCE
   Three-file version
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    photos: [
        "assets/photos/photo1.jpg",
        "assets/photos/photo2.jpg",
        "assets/photos/photo3.jpg",
        "assets/photos/photo4.jpg",
        "assets/photos/photo5.jpg",
        "assets/photos/photo6.jpg"
    ],

    captions: [
        ".....",
        "Your Smile Makes Even Ordinary Moments Special.....",
        "Some Memories Deserve to Stay Forever.....",
        "With You, Every Moment Feels Magical.....",
        "You Are My Only Happiness..",
        "And This is Only The Beginning of Our Story."
    ],

    memoryDuration: 3700,
    endingHoldDuration: 10000,
    endingFadeDuration: 5000,

    reducedMotion:
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
};


/* =========================================================
   HELPERS
========================================================= */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    [...document.querySelectorAll(selector)];

const wait = ms =>
    new Promise(resolve => setTimeout(resolve, ms));


/* =========================================================
   FIREWORK BURST
========================================================= */

const FIREWORK_COLORS = [
    "#ff6b6b", "#ffd166", "#06d6a0", "#4cc9f0", 
    "#c77dff", "#f72585", "#ffe1a8", "#ff9f1c"
];

function spawnFirework(container) {
    if (!container) return;

    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 55;
    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    const flash = document.createElement("span");
    flash.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: 6px;
        height: 6px;
        margin-left: -3px;
        margin-top: -3px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 18px #fff, 0 0 34px ${color};
    `;
    
    container.appendChild(flash);

    flash.animate(
        [
            { transform: "scale(.3)", opacity: 1 },
            { transform: "scale(3.2)", opacity: 0 }
        ],
        { duration: 350, easing: "ease-out" }
    ).onfinish = () => flash.remove();

    const particleCount = 20 + Math.floor(Math.random() * 10);

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.25;
        const distance = 45 + Math.random() * 55;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        const particle = document.createElement("span");
        particle.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: 4px;
            height: 4px;
            margin-left: -2px;
            margin-top: -2px;
            border-radius: 50%;
            background: ${color};
            box-shadow: 0 0 6px ${color}, 0 0 12px ${color};
        `;

        container.appendChild(particle);

        particle.animate(
            [
                { transform: "translate(0, 0) scale(1)", opacity: 1 },
                { transform: `translate(${dx}px, ${dy * 0.6}px) scale(.9)`, opacity: 1, offset: 0.5 },
                { transform: `translate(${dx}px, ${dy + 24}px) scale(.3)`, opacity: 0 }
            ],
            { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.25,.46,.45,.94)" }
        ).onfinish = () => particle.remove();
    }
}


/* =========================================================
   SCENE MANAGER
========================================================= */

const SceneManager = {
    current: null,

    change(sceneName) {
        $$(".scene").forEach(scene => scene.classList.remove("active"));
        const next = document.querySelector(`[data-scene="${sceneName}"]`);

        if (!next) {
            console.error("Scene not found:", sceneName);
            return;
        }

        next.classList.add("active");
        this.current = sceneName;
    },

    fadeOut(duration = 3000) {
        return new Promise(resolve => {
            const scene = document.querySelector(`[data-scene="${this.current}"]`);
            if (!scene) { resolve(); return; }

            const runDuration = CONFIG.reducedMotion ? 1 : duration;

            scene.animate(
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: runDuration, easing: "ease", fill: "forwards" }
            ).onfinish = () => {
                scene.classList.remove("active");
                resolve();
            };
        });
    }
};


/* =========================================================
   PARTICLES
========================================================= */

const ParticleSystem = {
    start() {
        if (CONFIG.reducedMotion) return;
        this.createDust();
        this.createSparkles();
    },

    createDust() {
        const container = $("#particles");
        if (!container) return;

        const count = window.innerWidth < 700 ? 35 : 75;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement("span");
            particle.className = "particle";

            particle.style.left = Math.random() * 100 + "%";
            particle.style.setProperty("--drift", `${(Math.random() * 180) - 90}px`);
            particle.style.setProperty("--duration", `${8 + Math.random() * 14}s`);
            particle.style.animationDelay = `${Math.random() * -20}s`;

            const size = 1 + Math.random() * 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = .15 + Math.random() * .55;

            container.appendChild(particle);
        }
    },

    createSparkles() {
        const container = $("#sparkles");
        if (!container) return;

        const count = window.innerWidth < 700 ? 10 : 20;

        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement("span");
            sparkle.className = "sparkle";

            sparkle.style.left = Math.random() * 100 + "%";
            sparkle.style.top = Math.random() * 100 + "%";
            sparkle.style.animationDelay = `${Math.random() * -5}s`;

            container.appendChild(sparkle);
        }
    }
};


/* =========================================================
   AUDIO
========================================================= */

const AudioManager = {
    audio: null,

    init() {
        this.audio = $("#background-audio");
        if (!this.audio) return;

        try {
            this.audio.volume = .35;
        } catch (e) {
            console.warn("Audio volume could not be set:", e);
        }
    },

    play() {
        if (!this.audio) return;
        
        const promise = this.audio.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {
                /* Autoplay restrictions are normal. Handled by Tap gesture. */
            });
        }
    },

    pause() {
        if (!this.audio || this.audio.paused) return;
        try {
            this.audio.pause();
        } catch (error) {
            console.warn("Audio pause prevented:", error);
        }
    },

    fadeOut(duration = 3000) {
        if (!this.audio) return;

        const start = this.audio.volume;
        const startTime = performance.now();

        const animate = now => {
            const progress = Math.min((now - startTime) / duration, 1);
            this.audio.volume = start * (1 - progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.pause();
            }
        };

        requestAnimationFrame(animate);
    }
};


/* =========================================================
   WELCOME
========================================================= */

const WelcomeScene = {
    async start() {
        SceneManager.change("welcome");

        const quote1 = $("#welcome-quote-1");
        const quote2 = $("#welcome-quote-2");
        const birthday = $("#welcome-birthday");
        const name = $("#welcome-name");

        await this.showElement(quote1, 2100);
        await wait(1200);
        await this.hideElement(quote1, 1000);

        await this.showElement(quote2, 1500);
        await wait(1500);
        await this.hideElement(quote2, 1000);

        await this.showElement(birthday, 1300);
        await wait(1200);
        await this.showElement(name, 1100);

        await wait(4000);

        await this.hideElement(birthday, 1800);
        await this.hideElement(name, 1000);

        await wait(400);

        CakeScene.start();
    },

    showElement(element, duration) {
        return new Promise(resolve => {
            if (!element) { resolve(); return; }

            element.animate(
                [
                    { opacity: 0, filter: "blur(10px)", transform: "scale(.92)" },
                    { opacity: 1, filter: "blur(0)", transform: "scale(1)" }
                ],
                {
                    duration: CONFIG.reducedMotion ? 1 : duration,
                    easing: "cubic-bezier(.22,.61,.36,1)",
                    fill: "forwards"
                }
            ).onfinish = resolve;
        });
    },

    hideElement(element, duration) {
        return new Promise(resolve => {
            if (!element) { resolve(); return; }

            element.animate(
                [
                    { opacity: 1, filter: "blur(0)", transform: "scale(1)" },
                    { opacity: 0, filter: "blur(8px)", transform: "scale(1.08)" }
                ],
                {
                    duration: CONFIG.reducedMotion ? 1 : duration,
                    easing: "ease-in",
                    fill: "forwards"
                }
            ).onfinish = resolve;
        });
    }
};


/* =========================================================
   FIREWORKS
========================================================= */

const Fireworks = {
    container: null,

    init(id = "fireworks") {
        this.container = document.getElementById(id);
        if (!this.container) return;
        this.run();
    },

    run() {
        if (CONFIG.reducedMotion) return;
        let rounds = 0;

        const interval = setInterval(() => {
            spawnFirework(this.container);
            rounds++;
            if (rounds >= 15) clearInterval(interval);
        }, 800);
    }
};


/* =========================================================
   BALLOONS
========================================================= */

const BalloonSystem = {
    colorClasses: [
        "float-rose", "gold-balloon", "float-maroon", "float-lilac",
        "float-crimson", "float-cream", "float-amber"
    ],

    init(id = "balloons") {
        const container = document.getElementById(id);
        if (!container || CONFIG.reducedMotion) return;

        for (let i = 0; i < 7; i++) {
            const balloon = document.createElement("div");
            balloon.className = `float-balloon ${this.colorClasses[i]}`;

            balloon.style.width = `${30 + Math.random() * 35}px`;
            balloon.style.height = `${40 + Math.random() * 45}px`;
            balloon.style.left = `${Math.random() * 100}%`;
            balloon.style.bottom = "-100px";

            const shine = document.createElement("span");
            shine.className = "balloon-shine";
            balloon.appendChild(shine);

            container.appendChild(balloon);

            balloon.animate(
                [
                    { transform: "translateY(0)" },
                    { transform: `translateY(-120vh) translateX(${Math.random() * 120 - 60}px)` }
                ],
                {
                    duration: 7000 + Math.random() * 5000,
                    delay: Math.random() * 4000,
                    easing: "linear",
                    iterations: Infinity
                }
            );
        }
    }
};


/* =========================================================
   CAKE
========================================================= */

const CakeScene = {
    async start() {
        SceneManager.change("cake");

        const cake = $("#cake");
        if (cake) cake.classList.add("visible");

        Fireworks.init("fireworks");
        BalloonSystem.init("balloons");

        await wait(2000);
        this.lightCandles();
        await wait(2500);
        this.cut();
    },

    lightCandles() {
        $$(".flame").forEach((flame, index) => {
            flame.style.opacity = "0";

            setTimeout(() => {
                flame.animate(
                    [
                        { opacity: 0, transform: "scale(.2)" },
                        { opacity: 1, transform: "scale(1)" }
                    ],
                    { duration: 300, fill: "forwards" }
                );
            }, index * 500);
        });
    },

    cut() {
        const cake = $("#cake");
        if (cake) {
            cake.animate(
                [
                    { transform: "translate(-50%,-42%) scale(1)" },
                    { transform: "translate(-50%,-42%) scale(.85)", opacity: .5, filter: "blur(5px)" }
                ],
                { duration: 1200, fill: "forwards" }
            );
        }

        $$(".flame").forEach(flame => {
            flame.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: "forwards" });
        });

        const message = $("#cake-message");
        message.classList.add("show");

        setTimeout(() => GiftScene.start(), 3500);
    }
};


/* =========================================================
   GIFT
========================================================= */

const GiftScene = {
    async start() {
        SceneManager.change("gift");

        const bouquet = $("#gift-bouquet");
        if (bouquet) bouquet.classList.add("arrived");

        await wait(2800);
        this.open();
    },

    async open() {
        const box = $("#gift-box");
        if (box) box.classList.add("open");

        await wait(1300);
        await this.seeGift();
    },

    async seeGift() {
        await wait(1500);
        SceneManager.change("fog");
        await wait(2500);
        MemoryScene.start();
    }
};


/* =========================================================
   MEMORY
========================================================= */

const MemoryScene = {
    index: 0,

    async start() {
        SceneManager.change("memory");
        this.index = 0;

        await wait(900);

        for (let i = 0; i < CONFIG.photos.length; i++) {
            this.index = i;
            await this.showPhoto(CONFIG.photos[i], CONFIG.captions[i]);
        }

        LetterScene.start();
    },

          showPhoto(src, caption) {
        return new Promise(async resolve => {
            const background = $("#memory-background");
            const image = $("#memory-photo");
            const wrapper = $("#memory-photo-wrapper");
            const captionElement = $("#memory-caption");

            const preloadImg = new Image();
            let hasStarted = false; /* <--- This is the lock that stops the double typing */

            const proceed = async () => {
                if (hasStarted) return; /* If it already started, stop! */
                hasStarted = true;     /* Lock the door */

                background.style.backgroundImage = `url("${src}")`;
                image.src = src;

                wrapper.classList.remove("show");
                captionElement.classList.remove("show");

                await wait(600);

                wrapper.classList.add("show");
                
                captionElement.textContent = "";
                captionElement.setAttribute("spellcheck", "false");
                captionElement.classList.add("show");

                await this.typeCaption(captionElement, caption);

                await wait(1800);

                wrapper.classList.remove("show");
                captionElement.classList.remove("show");

                await wait(1000);

                resolve();
            };

            // Attach handlers BEFORE setting src
            preloadImg.onload = proceed;
            
            // Error fallback
            preloadImg.onerror = () => {
                console.error("Failed to load image:", src);
                setTimeout(() => resolve(), 500);
            };

            preloadImg.src = src;

            /* If the image is already cached, load it immediately */
            if (preloadImg.complete) {
                proceed();
            }
        });
    },

    typeCaption(element, text) {
        return new Promise(resolve => {
            let index = 0;
            const speed = CONFIG.reducedMotion ? 1 : 35;

            const write = () => {
                if (index >= text.length) {
                    resolve();
                    return;
                }

                element.textContent += text[index++];
                setTimeout(write, speed);
            };

            write();
        });
    }
};


/* =========================================================
   LETTER
========================================================= */

const LetterScene = {
    async start() {
        SceneManager.change("letter");
        this.spawnPetals();

        await wait(600);

        const name = $("#letter-name");
        name.animate(
            [
                { opacity: 0, filter: "blur(8px)", transform: "translateY(15px)" },
                { opacity: 1, filter: "blur(0)", transform: "translateY(0)" }
            ],
            {
                duration: CONFIG.reducedMotion ? 1 : 1800,
                fill: "forwards"
            }
        );

        await wait(1800);

        const message =
`Every moment with you is a beautiful memory.
Every smile of yours brightens my day.
Thank you for being such a wonderful person.
All your needs will be done soon.
May your dreams come true, your heart always stay happy.`;

        await this.writeText($("#letter-text"), message);
        await wait(1000);
        await this.writeText($("#letter-signoff"), `With Love,`);
        await wait(1000);

        const signature = $("#letter-signature");
        signature.classList.add("show");

        await wait(3000);
        ProposalScene.start();
    },

    spawnPetals() {
        const field = $("#letter-petals");
        if (!field || field.dataset.spawned) return;
        field.dataset.spawned = "true";

        const count = 18;
        for (let i = 0; i < count; i++) {
            const p = document.createElement("div");
            p.className = "petal";

            const left = Math.random() * 100;
            const duration = 4 + Math.random() * 4;
            const delay = -(Math.random() * 8);
            const size = 10 + Math.random() * 10;
            const hue = 330 + Math.random() * 20;

            p.style.left = left + "%";
            p.style.width = size + "px";
            p.style.height = (size * 1.3) + "px";
            p.style.background = `hsl(${hue}, 55%, ${65 + Math.random() * 15}%)`;
            p.style.animationDuration = duration + "s";
            p.style.animationDelay = delay + "s";

            field.appendChild(p);
        }
    },

    writeText(element, text) {
        return new Promise(resolve => {
            element.textContent = "";
            let index = 0;

            const write = () => {
                if (index >= text.length) {
                    resolve();
                    return;
                }

                element.textContent += text[index++];

                let delay = CONFIG.reducedMotion ? 1 : 28;

                if (text[index - 1] === ".") delay = 300;
                if (text[index - 1] === "\n") delay = 500;

                setTimeout(write, delay);
            };

            write();
        });
    }
};


/* =========================================================
   PROPOSAL
========================================================= */

const ProposalScene = {
    async start() {
        SceneManager.change("proposal");

        const quotes = $$(".proposal-quote");

        for (const quote of quotes) {
            await this.animateQuote(quote);
        }

        await wait(500);

        const final = $("#proposal-final");
        final.classList.add("show");

        await wait(2400);
        this.finish();
    },

    animateQuote(element) {
        return new Promise(async resolve => {
            element.animate(
                [
                    { opacity: 0, transform: "scale(.9)", filter: "blur(8px)" },
                    { opacity: 1, transform: "scale(1.03)", filter: "blur(0)" },
                    { opacity: 0, transform: "scale(1.1)", filter: "blur(8px)" }
                ],
                { duration: 2500, easing: "ease-in-out" }
            ).onfinish = resolve;
        });
    },

    finish() {
        const final = $("#proposal-final");
        final.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 2000, fill: "forwards" });

        setTimeout(() => {
            SceneManager.change("ending");
            EndingScene.start();
        }, 1000);
    }
};


/* =========================================================
   ENDING
========================================================= */

const EndingScene = {
    _fireworksInterval: null,

    async start() {
        this.createFireworks();
        this.createBalloons();
        this.createConfettiBurst();

        AudioManager.fadeOut(15000);

        await wait(CONFIG.endingHoldDuration);
        this.stopFireworks();

        await SceneManager.fadeOut(CONFIG.endingFadeDuration);
    },

    stopFireworks() {
        if (this._fireworksInterval) {
            clearInterval(this._fireworksInterval);
            this._fireworksInterval = null;
        }
    },

    createFireworks() {
        const container = $("#ending-fireworks");
        if (!container || CONFIG.reducedMotion) return;

        this._fireworksInterval = setInterval(() => {
            spawnFirework(container);
        }, 900);
    },

    createConfettiBurst() {
        const container = document.querySelector("#ending-fireworks");
        if (!container || CONFIG.reducedMotion) return;

        const colors = [
            "#ff4d6d", "#ffd166", "#06d6a0", "#4cc9f0",
            "#c77dff", "#f72585", "#ffe1a8", "#ffffff"
        ];

        const count = 250;

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement("span");
            confetti.style.position = "fixed";
            confetti.style.left = "50%";
            confetti.style.top = "45%";

            const size = 5 + Math.random() * 7;
            confetti.style.width = size + "px";
            confetti.style.height = (size * 0.55) + "px";
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = "2px";
            confetti.style.pointerEvents = "none";
            confetti.style.zIndex = "9999";

            document.body.appendChild(confetti);

            const spreadX = (Math.random() - 0.5) * window.innerWidth * 1;
            const spreadY = (Math.random() - 0.5) * window.innerHeight * 1;
            const rotation = Math.random() * 1080 - 540;
            const duration = 1800 + Math.random() * 1800;
            const delay = Math.random() * 350;

            confetti.animate(
                [
                    { transform: "translate(-50%, -50%) scale(0.3) rotate(0deg)", opacity: 1 },
                    { transform: `translate(${spreadX}px, ${spreadY}px) scale(1) rotate(${rotation}deg)`, opacity: 1, offset: 0.90 },
                    { transform: `translate(${spreadX * 1.08}px, ${spreadY + 180}px) scale(0.8) rotate(${rotation + 360}deg)`, opacity: 0 }
                ],
                {
                    duration: duration,
                    delay: delay,
                    easing: "cubic-bezier(.15,.7,.3,1)",
                    fill: "forwards"
                }
            ).onfinish = () => confetti.remove();
        }
    },

    createBalloons() {
        const container = $("#ending-balloons");
        if (!container || CONFIG.reducedMotion) return;

        const colorClasses = [
            "float-crimson", "black-balloon", "float-lilac",
            "float-pink", "float-amber", "float-ruby"
        ];

        colorClasses.forEach((colorClass, index) => {
            const balloon = document.createElement("div");
            balloon.className = `float-balloon ${colorClass}`;

            balloon.style.left = `${index * 17}%`;
            balloon.style.bottom = "-100px";
            balloon.style.width = "55px";
            balloon.style.height = "72px";

            const shine = document.createElement("span");
            shine.className = "balloon-shine";
            balloon.appendChild(shine);

            container.appendChild(balloon);

            balloon.animate(
                [
                    { transform: "translateY(0)" },
                    { transform: "translateY(-120vh) translateX(50px)" }
                ],
                {
                    duration: 6000 + index * 500,
                    iterations: Infinity,
                    easing: "linear"
                }
            );
        });
    }
};


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEvents() {
    const tapToBegin = $("#tap-to-begin-button");

    if (tapToBegin) {
        tapToBegin.addEventListener(
            "click",
            () => {
                AudioManager.play();
                WelcomeScene.start();
            },
            { once: true }
        );
    }
}


/* =========================================================
   PRELOAD PHOTOS
========================================================= */

function preloadImages() {
    CONFIG.photos.forEach(src => {
        const image = new Image();
        image.src = src;
    });
}


/* =========================================================
   INITIALIZATION
========================================================= */

async function init() {
    try {
        AudioManager.init();
        ParticleSystem.start();
        preloadImages();
        setupEvents();
    } catch (error) {
        console.error("Website initialization error:", error);
    }
}


/* =========================================================
   START
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
} 