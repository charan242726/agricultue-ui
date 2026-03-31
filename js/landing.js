/* ============================================================
   AgroEase – Landing Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Universal Loader Logic
    const loader = document.getElementById('universal-loader');
    if(loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('fade-out');
                setTimeout(() => loader.style.display = 'none', 600);
            }, 1800);
        });
    }

    // 2. Navbar Scroll Effect
    const mainNav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 80) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    }, { passive: true });

    // 3. Star Canvas (Hero Background)
    const starCanvas = document.getElementById('star-canvas');
    if(starCanvas) {
        const ctx = starCanvas.getContext('2d');
        let stars = [];
        const numStars = 150;

        function resize() {
            starCanvas.width = window.innerWidth;
            starCanvas.height = window.innerHeight;
        }

        function createStars() {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * starCanvas.width,
                    y: Math.random() * starCanvas.height,
                    radius: Math.random() * 1.5 + 0.2,
                    speed: Math.random() * 0.005 + 0.002,
                    phase: Math.random() * Math.PI * 2,
                    opacity: Math.random()
                });
            }
        }

        function draw(time) {
            ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
            stars.forEach(s => {
                const flicker = 0.3 + 0.7 * Math.abs(Math.sin(time * s.speed + s.phase));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
                ctx.fill();
            });
            requestAnimationFrame(draw);
        }

        resize();
        createStars();
        draw(0);
        window.addEventListener('resize', () => { resize(); createStars(); });
    }

    // 4. Scroll Reveal Intersection Observer
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => {
        revealObserver.observe(el);
    });

    // 5. Spotlight Hover Effect (Features)
    document.querySelectorAll('.feat-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // 6. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if(targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
