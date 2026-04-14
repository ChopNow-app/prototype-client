/**
 * app.js — ChopNow Vendeur Prototype
 */

const SCREENS = [
  { id: 'splash',      label: 'Splash',      path: 'splash.html'      },
  { id: 'login',       label: 'Connexion',   path: 'login.html'       },
  { id: 'dashboard',   label: 'Dashboard',   path: 'dashboard.html'   },
  { id: 'commande',    label: 'Commande',    path: 'commande.html'    },
  { id: 'preparation', label: 'Préparation', path: 'preparation.html' },
  { id: 'menu',        label: 'Menu',        path: 'menu.html'        },
];

const currentFile   = location.pathname.split('/').pop() || 'splash.html';
const currentScreen = SCREENS.find(s => s.path === currentFile) || SCREENS[0];

// ─── SESSION GUARD ────────────────────────────────────────────────────────────
if (!sessionStorage.getItem('chopnow_active') && currentFile !== 'splash.html') {
  location.replace('splash.html');
}

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

document.addEventListener('DOMContentLoaded', () => {
  const screen = document.querySelector('.screen');
  if (screen) {
    const dir = sessionStorage.getItem('navDirection') || 'forward';
    screen.classList.add(dir === 'back' ? 'screen-enter-back' : 'screen-enter');
  }

  if (!document.getElementById('toast')) {
    const t = document.createElement('div');
    t.className = 'toast'; t.id = 'toast';
    document.body.appendChild(t);
  }

  if (!document.getElementById('protoNav')) {
    const nav = document.createElement('div');
    nav.className = 'proto-nav'; nav.id = 'protoNav';
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

  startClock();
  document.querySelectorAll('.btn').forEach(addRipple);
});

let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2400);
}

function addRipple(btn) {
  btn.addEventListener('pointerdown', e => {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const sz   = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX-rect.left-sz/2}px;top:${e.clientY-rect.top-sz/2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 520);
  });
}

function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    const n = new Date();
    el.textContent = `${n.getHours()}:${String(n.getMinutes()).padStart(2,'0')}`;
  };
  tick();
  setInterval(tick, 20000);
}
