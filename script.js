/* ============================================================
   WEB SOLUTIONS — SURREAL 3D ALIVE WEBSITE — INTERACTIONS
   ============================================================ */

(function () {
    'use strict';

    // ---- GLOBALS ----
    const mouse = { x: 0, y: 0, smoothX: 0, smoothY: 0 };
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // ============================================================
    // CUSTOM CURSOR — GLOWING ORB
    // ============================================================
    if (!isMobile) {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');

        let dotX = 0, dotY = 0;
        let ringX = 0, ringY = 0;
        let targetX = 0, targetY = 0;
        let trailCounter = 0;
        let isHovering = false;

        // Interactive selectors for magnetic + hover effect
        const magneticSelectors = 'a, button, .btn, .service-card, .portfolio-card, .founder-link, .nav-link, .nav-logo, [data-tilt]';

        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Hover detection — toggles body class for CSS states
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(magneticSelectors)) {
                isHovering = true;
                document.body.classList.add('cursor-hovering');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(magneticSelectors)) {
                isHovering = false;
                document.body.classList.remove('cursor-hovering');
            }
        });

        // Click ripple
        document.addEventListener('mousedown', (e) => {
            const ripple = document.createElement('div');
            ripple.className = 'cursor-ripple';
            ripple.style.left = dotX + 'px';
            ripple.style.top = dotY + 'px';
            document.body.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });

        function animateCursor() {
            // Compute target — apply magnetic pull if hovering an interactive el
            targetX = mouse.x;
            targetY = mouse.y;

            if (isHovering) {
                const hovered = document.elementFromPoint(mouse.x, mouse.y);
                if (hovered) {
                    const el = hovered.closest(magneticSelectors);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        // Pull cursor 30% toward element center
                        targetX = mouse.x + (centerX - mouse.x) * 0.3;
                        targetY = mouse.y + (centerY - mouse.y) * 0.3;
                    }
                }
            }

            // Dot follows with smooth easing
            dotX += (targetX - dotX) * 0.18;
            dotY += (targetY - dotY) * 0.18;
            dot.style.left = dotX + 'px';
            dot.style.top = dotY + 'px';

            // Ring follows slower for trailing effect
            ringX += (targetX - ringX) * 0.08;
            ringY += (targetY - ringY) * 0.08;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';

            // Smooth mouse for other effects
            mouse.smoothX += (mouse.x - mouse.smoothX) * 0.06;
            mouse.smoothY += (mouse.y - mouse.smoothY) * 0.06;

            // Trail — spawn a small fading particle every 3rd frame
            trailCounter++;
            if (trailCounter % 3 === 0) {
                const trail = document.createElement('div');
                trail.className = 'cursor-trail';
                trail.style.left = dotX + 'px';
                trail.style.top = dotY + 'px';
                document.body.appendChild(trail);
                setTimeout(() => trail.remove(), 600);
            }

            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // ============================================================
    // PARTICLE SYSTEM (Canvas)
    // ============================================================
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let lightStreaks = [];
    const PARTICLE_COUNT = isMobile ? 40 : 100;
    const CONNECTION_DISTANCE = 140;
    const STREAK_INTERVAL = 4000;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.4 + 0.1;
            const colors = [
                'rgba(46, 204, 113,',
                'rgba(0, 212, 255,',
                'rgba(255, 45, 123,',
                'rgba(200, 200, 220,'
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Slight attraction toward mouse (desktop only)
            if (!isMobile) {
                const dx = mouse.smoothX - this.x;
                const dy = mouse.smoothY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 300) {
                    this.vx += dx * 0.00003;
                    this.vy += dy * 0.00003;
                }
            }

            // Damping
            this.vx *= 0.999;
            this.vy *= 0.999;

            // Wrap
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        }
    }

    class LightStreak {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = -100;
            this.y = Math.random() * canvas.height * 0.7;
            this.length = Math.random() * 200 + 100;
            this.speed = Math.random() * 4 + 2;
            this.opacity = Math.random() * 0.08 + 0.02;
            this.angle = (Math.random() - 0.5) * 0.2;
            this.active = true;
        }
        update() {
            this.x += this.speed;
            this.y += Math.sin(this.angle) * 0.5;
            if (this.x > canvas.width + this.length) {
                this.active = false;
            }
        }
        draw() {
            const endX = this.x - Math.cos(this.angle) * this.length;
            const endY = this.y - Math.sin(this.angle) * this.length;
            const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
            gradient.addColorStop(0, `rgba(46, 204, 113, ${this.opacity})`);
            gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Init particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    // Spawn light streaks periodically
    setInterval(() => {
        if (lightStreaks.length < 3) {
            lightStreaks.push(new LightStreak());
        }
    }, STREAK_INTERVAL);

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DISTANCE) {
                    const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(200, 200, 220, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Connections
        if (!isMobile) drawConnections();

        // Light streaks
        lightStreaks = lightStreaks.filter(s => s.active);
        lightStreaks.forEach(s => {
            s.update();
            s.draw();
        });

        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ============================================================
    // HERO PANEL — 3D TILT ON MOUSE
    // ============================================================
    if (!isMobile) {
        const heroPanel = document.getElementById('heroPanel');

        document.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;

            // Tilt hero panel
            if (heroPanel) {
                const rotX = dy * -4; // degrees
                const rotY = dx * 4;
                heroPanel.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px) scale(1.005)`;
            }
        });
    }

    // ============================================================
    // FLOATING CARD TILT (data-tilt elements)
    // ============================================================
    if (!isMobile) {
        const tiltCards = document.querySelectorAll('[data-tilt]');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const dx = (x - cx) / cx;
                const dy = (y - cy) / cy;

                const rotX = dy * -6;
                const rotY = dx * 6;
                const tz = 20;

                card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${tz}px) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0) translateY(0)';
            });
        });
    }

    // ============================================================
    // SCROLL REVEAL (IntersectionObserver)
    // ============================================================
    const revealItems = document.querySelectorAll('.reveal-item');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealItems.forEach(item => revealObserver.observe(item));

    // ============================================================
    // PARALLAX ON SCROLL
    // ============================================================
    if (!isMobile) {
        const parallaxLayers = document.querySelectorAll('.parallax-layer');

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.dataset.speed) || 0.1;
                layer.style.transform = `translateY(${scrollY * speed * -0.5}px)`;
            });

            // Also shift background shapes
            const shapes = document.querySelector('.bg-shapes');
            if (shapes) {
                shapes.style.transform = `translateY(${scrollY * 0.15}px)`;
            }
        }, { passive: true });
    }

    // ============================================================
    // TITLE TYPEWRITER EFFECT
    // ============================================================
    const titleLines = document.querySelectorAll('.title-line');
    titleLines.forEach((line, i) => {
        const text = line.textContent;
        line.textContent = '';
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';

        const delay = 300 + i * 600;
        setTimeout(() => {
            let charIndex = 0;
            const interval = setInterval(() => {
                if (charIndex < text.length) {
                    line.textContent += text[charIndex];
                    charIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 50);
        }, delay);
    });

    // ============================================================
    // COUNTER ANIMATION (About section stats)
    // ============================================================
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 2000;
                const start = performance.now();

                function updateCounter(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(target * eased);
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        el.textContent = target;
                    }
                }
                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ============================================================
    // SCROLL-TRIGGERED SECTION TRANSFORMS
    // ============================================================
    if (!isMobile) {
        const sections = document.querySelectorAll('.section');

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) rotateX(0)';
                } else {
                    // Only apply to sections below viewport
                    const rect = entry.target.getBoundingClientRect();
                    if (rect.top > 0) {
                        entry.target.style.opacity = '0.6';
                        entry.target.style.transform = 'translateY(30px) rotateX(2deg)';
                    }
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -100px 0px'
        });

        sections.forEach(s => {
            s.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            sectionObserver.observe(s);
        });
    }

    // ============================================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============================================================
    // RIPPLE EFFECT ON BUTTONS
    // ============================================================
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height) * 2;
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size / 2}px;
                top: ${e.clientY - rect.top - size / 2}px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleAnim 0.6s ease-out forwards;
                pointer-events: none;
            `;
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Ripple keyframes (injected)
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes rippleAnim {
            to { transform: scale(1); opacity: 0; }
        }
    `;
    document.head.appendChild(rippleStyle);

    // ============================================================
    // AMBIENT SOUND (Web Audio API)
    // ============================================================
    let audioCtx = null;
    let soundEnabled = false;
    let oscillators = [];

    const soundToggle = document.getElementById('soundToggle');
    const soundOff = soundToggle.querySelector('.sound-off');
    const soundOn = soundToggle.querySelector('.sound-on');

    function createAmbientSound() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Deep hum
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 60;
        gain1.gain.value = 0.015;
        osc1.connect(gain1).connect(audioCtx.destination);
        osc1.start();

        // Sub-harmonic
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 90;
        gain2.gain.value = 0.008;
        osc2.connect(gain2).connect(audioCtx.destination);
        osc2.start();

        // High shimmer
        const osc3 = audioCtx.createOscillator();
        const gain3 = audioCtx.createGain();
        osc3.type = 'sine';
        osc3.frequency.value = 440;
        gain3.gain.value = 0.003;
        osc3.connect(gain3).connect(audioCtx.destination);
        osc3.start();

        // Slow LFO on shimmer volume
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15;
        lfoGain.gain.value = 0.002;
        lfo.connect(lfoGain).connect(gain3.gain);
        lfo.start();

        oscillators = [osc1, osc2, osc3, lfo];
    }

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            if (!audioCtx) createAmbientSound();
            else audioCtx.resume();
            soundOff.style.display = 'none';
            soundOn.style.display = 'block';
        } else {
            if (audioCtx) audioCtx.suspend();
            soundOff.style.display = 'block';
            soundOn.style.display = 'none';
        }
    });

    // ============================================================
    // HERO TITLE — GRADIENT CLASS
    // ============================================================
    // Apply gradient to "Websites" after typewriter animation
    setTimeout(() => {
        const accentLine = document.querySelector('.title-accent');
        if (accentLine) {
            accentLine.style.backgroundImage = 'linear-gradient(135deg, #2ECC71, #00D4FF)';
            accentLine.style.webkitBackgroundClip = 'text';
            accentLine.style.webkitTextFillColor = 'transparent';
            accentLine.style.backgroundClip = 'text';
        }
    }, 2500);

    // ============================================================
    // SCROLL INDICATOR FADE
    // ============================================================
    const scrollIndicator = document.getElementById('scrollIndicator');
    window.addEventListener('scroll', () => {
        if (scrollIndicator) {
            const opacity = Math.max(0, 1 - window.scrollY / 300);
            scrollIndicator.style.opacity = opacity;
        }
    }, { passive: true });

    // ============================================================
    // FLOATING PANELS — subtle continuous animation offset
    // ============================================================
    const floatPanels = document.querySelectorAll('.float-panel');
    let floatTime = 0;

    function animateFloatingPanels() {
        floatTime += 0.005;
        floatPanels.forEach((panel, i) => {
            const offsetY = Math.sin(floatTime + i * 1.5) * 4;
            const offsetX = Math.cos(floatTime * 0.7 + i * 2) * 2;
            panel.style.marginTop = offsetY + 'px';
            panel.style.marginLeft = offsetX + 'px';
        });
        requestAnimationFrame(animateFloatingPanels);
    }
    animateFloatingPanels();

})();
