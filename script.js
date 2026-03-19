/* ============================================================
   WEB SOLUTIONS — SURREAL 3D ALIVE WEBSITE — INTERACTIONS
   ============================================================ */

(function () {
    'use strict';

    // ---- GLOBALS ----
    const mouse = { x: 0, y: 0, smoothX: 0, smoothY: 0 };
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // ============================================================
    // PARTICLE SYSTEM (Canvas)
    // ============================================================

    // TECH NODES BACKGROUND
    const nodesCanvas = document.getElementById('bgNodesCanvas');
    const nodesCtx = nodesCanvas.getContext('2d');
    let nodes = [];
    const NODE_COUNT = isMobile ? 25 : 60;
    const GRID_SIZE = 60;

    function resizeNodesCanvas() {
        nodesCanvas.width = window.innerWidth;
        nodesCanvas.height = window.innerHeight;
    }
    resizeNodesCanvas();
    window.addEventListener('resize', resizeNodesCanvas);

    class TechNode {
        constructor() {
            this.init();
        }
        init() {
            // Bias position towards grid intersections
            const gx = Math.round(Math.random() * (nodesCanvas.width / GRID_SIZE)) * GRID_SIZE;
            const gy = Math.round(Math.random() * (nodesCanvas.height / GRID_SIZE)) * GRID_SIZE;
            
            this.anchorX = gx + (Math.random() - 0.5) * 10;
            this.anchorY = gy + (Math.random() - 0.5) * 10;
            this.x = this.anchorX;
            this.y = this.anchorY;
            
            this.vx = (Math.random() - 0.5) * 0.1;
            this.vy = (Math.random() - 0.5) * 0.1;
            
            this.radius = Math.random() < 0.8 ? Math.random() * 1.5 + 0.5 : Math.random() * 2 + 1.5;
            this.baseOpacity = Math.random() * 0.3 + 0.1;
            this.opacity = this.baseOpacity;
            
            // Randomly pick a color: soft white, light grey, or accent colors
            const colors = [
                'rgba(255, 255, 255,',   // soft white
                'rgba(152, 152, 166,',   // light grey (var(--text-secondary))
                'rgba(163, 207, 62,',    // accent lime (matches logo)
                'rgba(163, 207, 62,'      // accent lime (matches logo)
            ];
            const colorWeights = [0.5, 0.3, 0.1, 0.1];
            let r = Math.random();
            let colorIdx = 0;
            for(let i=0; i<colorWeights.length; i++) {
                r -= colorWeights[i];
                if(r <= 0) { colorIdx = i; break; }
            }
            this.color = colors[colorIdx];
            
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.02 + Math.random() * 0.03;
            this.floatOffset = Math.random() * Math.PI * 2;
            
            // Some nodes are blurred for depth
            this.blur = Math.random() < 0.3 ? Math.random() * 2 : 0;
            this.brightness = Math.random() < 0.2 ? 1.5 : 1;
        }

        update() {
            // Floating motion
            this.floatOffset += 0.005;
            this.x = this.anchorX + Math.sin(this.floatOffset) * 15;
            this.y = this.anchorY + Math.cos(this.floatOffset * 0.8) * 15;

            // Simple drift of anchor
            this.anchorX += this.vx;
            this.anchorY += this.vy;

            // Wrap
            if (this.anchorX < -50) this.anchorX = nodesCanvas.width + 50;
            if (this.anchorX > nodesCanvas.width + 50) this.anchorX = -50;
            if (this.anchorY < -50) this.anchorY = nodesCanvas.height + 50;
            if (this.anchorY > nodesCanvas.height + 50) this.anchorY = -50;

            // Pulsing & Fading
            this.pulse += this.pulseSpeed;
            this.opacity = this.baseOpacity + Math.sin(this.pulse) * 0.1;

            // Mouse Interaction (subtle repulsion)
            const dx = mouse.smoothX - this.x;
            const dy = mouse.smoothY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.anchorX -= (dx / dist) * force * 1.5;
                this.anchorY -= (dy / dist) * force * 1.5;
            }
        }

        draw() {
            nodesCtx.save();
            if (this.blur > 0) nodesCtx.filter = `blur(${this.blur}px)`;
            
            nodesCtx.beginPath();
            nodesCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            nodesCtx.fillStyle = this.color + (this.opacity * this.brightness) + ')';
            
            // Soft glow
            nodesCtx.shadowColor = this.color + '0.5)';
            nodesCtx.shadowBlur = 5 * this.opacity;
            
            nodesCtx.fill();
            nodesCtx.restore();
        }
    }

    function initNodes() {
        nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push(new TechNode());
        }
    }
    initNodes();

    function animateNodes() {
        nodesCtx.clearRect(0, 0, nodesCanvas.width, nodesCanvas.height);
        nodes.forEach(node => {
            node.update();
            node.draw();
        });
        requestAnimationFrame(animateNodes);
    }
    animateNodes();


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
