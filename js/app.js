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
  { id: 'profile',    label: 'Profil',     path: 'profile.html'    },
];

// Determine current screen from filename
const currentFile = location.pathname.split('/').pop() || 'splash.html';
const currentScreen = SCREENS.find(s => s.path === currentFile) || SCREENS[0];

// ─── SESSION GUARD — redirect to splash if fresh PWA open ────────────────────
// sessionStorage is cleared when PWA is closed, so if no flag exists we're fresh
if (!sessionStorage.getItem('chopnow_active') && currentFile !== 'splash.html') {
  location.replace('splash.html');
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
function navigate(screenId, isBack = false) {
  const target = SCREENS.find(s => s.id === screenId);
  if (!target) return;

  sessionStorage.setItem('chopnow_active', '1');
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

// ─── PWA INSTALL ─────────────────────────────────────────────────────────────
let _deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _deferredInstall = e;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../sw.js').catch(() => {});
}

function showInstallOverlay(appName, onDone) {
  // Already installed as PWA — skip
  if (window.matchMedia('(display-mode: standalone)').matches) { onDone(); return; }
  // Desktop — skip
  if (window.innerWidth > 420) { onDone(); return; }
  // Already dismissed this session — skip
  if (localStorage.getItem('installDismissed')) { onDone(); return; }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!isIOS && !_deferredInstall) { onDone(); return; }

  // Inject bounce keyframe once
  if (!document.getElementById('_installStyle')) {
    const s = document.createElement('style');
    s.id = '_installStyle';
    s.textContent = '@keyframes _bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}';
    document.head.appendChild(s);
  }

  const dismiss = () => {
    sessionStorage.setItem('installDismissed', '1');
    overlay.remove();
    onDone();
  };

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.75);display:flex;align-items:flex-end;';

  if (isIOS) {
    const step = (n, title, sub) => `
      <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.05);border-radius:12px;padding:12px 14px">
        <div style="background:rgba(232,87,10,.15);border-radius:8px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;font-weight:900;color:#E8570A">${n}</div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#fff">${title}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px">${sub}</div>
        </div>
      </div>`;
    overlay.innerHTML = `
      <div style="background:#1A0A02;border-radius:24px 24px 0 0;padding:28px 24px 44px;width:100%;border-top:1px solid rgba(255,255,255,.1)">
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:40px;margin-bottom:8px">📲</div>
          <div style="font-size:18px;font-weight:900;color:#fff;margin-bottom:4px">Installer ${appName}</div>
          <div style="font-size:12px;color:rgba(255,255,255,.4)">Suis les 4 étapes ci-dessous</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
          ${step(1, 'Appuie sur <span style="color:#E8570A">•••</span> en bas à droite', 'Les 3 points dans la barre Safari')}
          ${step(2, 'Appuie sur <span style="color:#E8570A">Partager ⎙</span>', 'Dans le menu qui apparaît')}
          ${step(3, 'Appuie sur <span style="color:#E8570A">Plus d\'options</span>', 'L\'icône en bas du menu de partage')}
          ${step(4, 'Appuie sur <span style="color:#E8570A">Sur l\'écran d\'accueil ➕</span>', 'Confirme en haut à droite')}
        </div>
        <button id="_installDismiss" style="width:100%;padding:14px;background:rgba(232,87,10,.12);border:1px solid rgba(232,87,10,.3);border-radius:14px;color:#E8570A;font-size:14px;font-weight:700;cursor:pointer">
          J'ai compris ✓
        </button>
      </div>
      <div style="position:absolute;bottom:12px;left:50%;animation:_bounce 1.2s ease infinite;font-size:26px">⬇️</div>`;
    overlay.querySelector('#_installDismiss').onclick = dismiss;

  } else {
    overlay.innerHTML = `
      <div style="background:#1A0A02;border-radius:24px 24px 0 0;padding:32px 24px 48px;width:100%;border-top:1px solid rgba(255,255,255,.1)">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:44px;margin-bottom:10px">📲</div>
          <div style="font-size:19px;font-weight:900;color:#fff;margin-bottom:6px">Installer ${appName}</div>
          <div style="font-size:13px;color:rgba(255,255,255,.45)">Lance l'app en 1 tap depuis ton écran d'accueil</div>
        </div>
        <button id="_installBtn" style="width:100%;padding:17px;background:linear-gradient(135deg,#c94a00,#E8570A);border:none;border-radius:16px;color:#fff;font-size:16px;font-weight:800;cursor:pointer;margin-bottom:12px;box-shadow:0 8px 24px rgba(232,87,10,.4)">
          Installer l'app
        </button>
        <button id="_installSkip" style="width:100%;padding:14px;background:none;border:none;color:rgba(255,255,255,.35);font-size:14px;cursor:pointer">
          Pas maintenant
        </button>
      </div>`;
    overlay.querySelector('#_installBtn').onclick = async () => {
      _deferredInstall.prompt();
      await _deferredInstall.userChoice;
      dismiss();
    };
    overlay.querySelector('#_installSkip').onclick = dismiss;
  }

  document.body.appendChild(overlay);
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
