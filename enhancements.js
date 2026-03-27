/**
 * AMPLIFY HEALTH — INTERACTIVE ENHANCEMENTS v2.0
 * Inspired by claude-cookbooks brand guidelines methodology
 *
 * Features:
 *  1. Scroll progress bar
 *  2. Particle canvas (floating dots)
 *  3. Cursor glow tracker
 *  4. Animated stat counters
 *  5. Typewriter effect on hero h1
 *  6. Section label underline trigger
 *  7. Timeline item active state
 *  8. Smooth number reveal
 *  9. CTA button ripple effect
 * 10. Keyboard navigation improvements
 */

(function () {
  'use strict';

  /* ── 1. SCROLL PROGRESS BAR ──────────────────────────────── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── 2. PARTICLE CANVAS ──────────────────────────────────── */
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const PARTICLE_COUNT = 55;
    const COLORS = [
      'rgba(122, 155, 109, 0.6)',
      'rgba(166, 124, 82, 0.5)',
      'rgba(201, 164, 122, 0.4)',
      'rgba(92, 122, 80, 0.5)',
    ];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.012,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(122, 155, 109, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.pulse += p.pulseSpeed;
        const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, currentAlpha + ')');
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    init();
    draw();
  }

  /* ── 3. CURSOR GLOW ──────────────────────────────────────── */
  function initCursorGlow() {
    if (!window.matchMedia('(hover: hover)').matches) return;

    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.prepend(glow);

    let mx = -500, my = -500;
    let cx = -500, cy = -500;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    function animate() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      glow.style.left = cx + 'px';
      glow.style.top  = cy + 'px';
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ── 4. ANIMATED STAT COUNTERS ───────────────────────────── */
  function initCounters() {
    // Map stat numbers to their animated targets
    const statCards = document.querySelectorAll('.stat-number');

    statCards.forEach(el => {
      const text = el.textContent.trim();

      // Only animate purely numeric values (skip "Risco Forense", etc.)
      const match = text.match(/^(\d+)([^\d]*)$/);
      if (!match) return;

      const target = parseInt(match[1], 10);
      const suffix = match[2];

      el.dataset.target = target;
      el.dataset.suffix = suffix;
      el.textContent = '0' + suffix;
      el.dataset.animated = 'false';
    });

    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.animated === 'true') return;
        el.dataset.animated = 'true';

        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    statCards.forEach(el => {
      if (el.dataset.target) counterObserver.observe(el);
    });
  }

  /* ── 5. TYPEWRITER EFFECT ON HERO H1 ─────────────────────── */
  function initTypewriter() {
    const h1 = document.querySelector('#hero h1');
    if (!h1) return;

    // Store original HTML
    const originalHTML = h1.innerHTML;
    const plainText = h1.textContent;

    // Only run once, after a short delay for page load feel
    setTimeout(() => {
      h1.innerHTML = '';
      h1.style.opacity = '1';
      h1.style.transform = 'none';

      // Create cursor
      const cursor = document.createElement('span');
      cursor.className = 'typewriter-cursor';
      h1.appendChild(cursor);

      let i = 0;
      const speed = 28; // ms per character

      // We'll type the plain text then restore the HTML with em tags
      function type() {
        if (i < plainText.length) {
          cursor.before(document.createTextNode(plainText[i]));
          i++;
          setTimeout(type, speed + Math.random() * 15);
        } else {
          // Restore original HTML with formatting
          setTimeout(() => {
            cursor.remove();
            h1.innerHTML = originalHTML;
          }, 400);
        }
      }

      type();
    }, 600);
  }

  /* ── 6. SECTION LABEL UNDERLINE TRIGGER ──────────────────── */
  function initSectionLabels() {
    const labels = document.querySelectorAll('.section-label');

    const labelObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.5 });

    labels.forEach(label => labelObserver.observe(label));
  }

  /* ── 7. TIMELINE ACTIVE STATE ────────────────────────────── */
  function initTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;

    const timelineObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.3 });

    items.forEach(item => timelineObserver.observe(item));
  }

  /* ── 8. SMOOTH NUMBER REVEAL (score circle) ──────────────── */
  function initScoreReveal() {
    const scoreNum = document.querySelector('.score-circle .num');
    if (!scoreNum) return;

    const target = parseInt(scoreNum.textContent, 10);
    if (isNaN(target)) return;

    scoreNum.textContent = '0';
    scoreNum.dataset.target = target;
    scoreNum.dataset.animated = 'false';

    const scoreObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.animated === 'true') return;
        el.dataset.animated = 'true';

        const t = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * t);
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        scoreObserver.unobserve(el);
      });
    }, { threshold: 0.6 });

    scoreObserver.observe(scoreNum);
  }

  /* ── 9. CTA BUTTON RIPPLE EFFECT ─────────────────────────── */
  function initRipple() {
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          width: 4px; height: 4px;
          background: rgba(255,255,255,0.35);
          border-radius: 50%;
          transform: scale(0);
          left: ${x}px; top: ${y}px;
          pointer-events: none;
          animation: rippleAnim 0.6s ease-out forwards;
        `;

        // Inject keyframe once
        if (!document.getElementById('ripple-style')) {
          const style = document.createElement('style');
          style.id = 'ripple-style';
          style.textContent = `
            @keyframes rippleAnim {
              to { transform: scale(80); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }

        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }

  /* ── 10. KEYBOARD NAVIGATION IMPROVEMENTS ────────────────── */
  function initKeyboardNav() {
    // Add visible focus ring only for keyboard users
    document.addEventListener('keydown', () => {
      document.body.classList.add('keyboard-nav');
    });
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }

  /* ── INIT ALL ─────────────────────────────────────────────── */
  function init() {
    initScrollProgress();
    initParticles();
    initCursorGlow();
    initCounters();
    initTypewriter();
    initSectionLabels();
    initTimeline();
    initScoreReveal();
    initRipple();
    initKeyboardNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
