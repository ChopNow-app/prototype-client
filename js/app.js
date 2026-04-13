/**
 * app.js — ChopNow Client Prototype
 * Shared utilities: navigation, toast, ripple, clock, proto-nav
 */

// ─── SCREEN REGISTRY ─────────────────────────────────────────────────────────
const SCREENS = [
  { id: 'splash',     label: 'Splash',     path: 'splash.html'     },
  { id: 'phone',      label: 'Téléphone',  path: 'phone.html'      },
  { id: 'otp',        label: 'OTP',        path: 'otp.html'        },
  { id: 'home',       label: 'Accueil',    path: 'home.html'       },
  { id: 'restaurant', label: 'Resto',      path: 'restaurant.html' },
  { id: 'cart',       label: 'Panier',     path: 'cart.html'       },
  { id: 'payment',    label: 'Paiement',   path: 'payment.html'    },
  { id: 'tracking',   label: 'Suivi',      path: 'tracking.html'   },
  { id: 'delivered',  label: 'Livré',      path: 'delivered.html'  },
];

// Determine current screen from filename
const currentFile = location.pathname.split('/').pop() || 'splash.html';
const currentScreen = SCREENS.find(s => s.path === currentFile) || SCREENS[0];

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
function navigate(screenId, isBack = false) {
  const target = SCREENS.find(s => s.id === screenId);
  if (!target) return;

  sessionStorage.setItem('navDirection', isBack ? 'back' : 'forward');

  const screen = document.querySelector('.screen');
  if (screen) {
    screen.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1), opacity .3s';
    screen.style.transform  = isBack ? 'translateX(30%)' : 'translateX(-100%)';
    screen.style.opacity    = '0';
    setTimeout(() => { location.href = target.path; }, 280);
  } else {
    location.href = target.path;
  }
}

// Slide in on load
document.addEventListener('DOMContentLoaded', () => {
  const screen = document.querySelector('.screen');
  if (!screen) return;

  const dir = sessionStorage.getItem('navDirection') || 'forward';
  screen.classList.add(dir === 'back' ? 'screen-enter-back' : 'screen-enter');
});

// ─── PROTO NAV DOTS ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Inject toast element
  if (!document.getElementById('toast')) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.id = 'toast';
    document.body.appendChild(t);
  }

  // Inject proto nav
  const existing = document.getElementById('protoNav');
  if (!existing) {
    const nav = document.createElement('div');
    nav.className = 'proto-nav';
    nav.id = 'protoNav';

    SCREENS.forEach(s => {
      const dot = document.createElement('div');
      dot.className = 'pn-dot' + (s.id === currentScreen.id ? ' on' : '');
      dot.title = s.label;
      dot.onclick = () => navigate(s.id);
      nav.appendChild(dot);
    });

    const lbl = document.createElement('span');
    lbl.className = 'pn-lbl';
    lbl.textContent = currentScreen.label;
    nav.appendChild(lbl);

    document.body.appendChild(nav);
  }

  // Clock
  startClock();

  // Ripple on all .btn
  document.querySelectorAll('.btn').forEach(addRipple);
});

// ─── TOAST ───────────────────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2400);
}

// ─── RIPPLE ──────────────────────────────────────────────────────────────────
function addRipple(btn) {
  btn.addEventListener('pointerdown', e => {
    const r    = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const sz   = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz/2}px;top:${e.clientY - rect.top - sz/2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 520);
  });
}

// ─── CLOCK ───────────────────────────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    const n = new Date();
    el.textContent = `${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`;
  };
  tick();
  setInterval(tick, 20000);
}

// ─── CONFETTI ────────────────────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti');
  if (!canvas) return;
  const phone = document.querySelector('.phone');
  canvas.width  = phone.clientWidth;
  canvas.height = phone.clientHeight;
  const ctx     = canvas.getContext('2d');
  const colors  = ['#E8570A','#FF6B1A','#FFB800','#4caf50','#2196F3','#ff4081','#ffffff'];
  const pieces  = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width, y: -20,
    w: 6 + Math.random() * 8, h: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    r: Math.random() * Math.PI * 2,
    vx: (Math.random() - .5) * 4,
    vy: 2 + Math.random() * 4,
    vr: (Math.random() - .5) * .2,
  }));

  let frame;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vy += .08;
      if (p.y < canvas.height + 20) {
        alive = true;
        const alpha = Math.max(0, 1 - p.y / canvas.height);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive) frame = requestAnimationFrame(draw);
  })();
}
