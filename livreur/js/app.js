/**
 * app.js — ChopNow Livreur Prototype
 */

const SCREENS = [
  { id: 'splash',    label: 'Splash',     path: 'splash.html'    },
  { id: 'login',     label: 'Connexion',  path: 'login.html'     },
  { id: 'dashboard', label: 'Dashboard',  path: 'dashboard.html' },
  { id: 'commande',  label: 'Commande',   path: 'commande.html'  },
  { id: 'trajet',    label: 'Trajet',     path: 'trajet.html'    },
  { id: 'livre',     label: 'Livré',      path: 'livre.html'     },
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

  // Proto nav dots
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

// ─── PWA INSTALL ─────────────────────────────────────────────────────────────
let _deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); _deferredInstall = e; });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js').catch(() => {});

function showInstallOverlay(appName, onDone) {
  if (window.matchMedia('(display-mode: standalone)').matches) { onDone(); return; }
  if (window.innerWidth > 420) { onDone(); return; }
  if (sessionStorage.getItem('installDismissed')) { onDone(); return; }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!isIOS && !_deferredInstall) { onDone(); return; }
  if (!document.getElementById('_installStyle')) {
    const s = document.createElement('style'); s.id = '_installStyle';
    s.textContent = '@keyframes _bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}';
    document.head.appendChild(s);
  }
  const dismiss = () => { sessionStorage.setItem('installDismissed','1'); overlay.remove(); onDone(); };
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.75);display:flex;align-items:flex-end;';
  if (isIOS) {
    overlay.innerHTML = `<div style="background:#1A0A02;border-radius:24px 24px 0 0;padding:32px 24px 48px;width:100%;border-top:1px solid rgba(255,255,255,.1)"><div style="text-align:center;margin-bottom:24px"><div style="font-size:44px;margin-bottom:10px">📲</div><div style="font-size:19px;font-weight:900;color:#fff;margin-bottom:6px">Installer ${appName}</div><div style="font-size:13px;color:rgba(255,255,255,.45)">Accès direct depuis ton écran d'accueil</div></div><div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px"><div style="display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.05);border-radius:14px;padding:14px 16px"><div style="font-size:26px;flex-shrink:0">1</div><div><div style="font-size:14px;font-weight:700;color:#fff">Appuie sur <span style="color:#E8570A">⎙</span> en bas de Safari</div><div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px">Le bouton "Partager"</div></div></div><div style="display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.05);border-radius:14px;padding:14px 16px"><div style="font-size:26px;flex-shrink:0">2</div><div><div style="font-size:14px;font-weight:700;color:#fff">Appuie sur <span style="color:#E8570A">"Sur l'écran d'accueil"</span></div><div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px">Fais défiler la liste vers le bas</div></div></div></div><button id="_installDismiss" style="width:100%;padding:15px;background:rgba(232,87,10,.12);border:1px solid rgba(232,87,10,.3);border-radius:14px;color:#E8570A;font-size:15px;font-weight:700;cursor:pointer">J'ai compris ✓</button></div><div style="position:absolute;bottom:12px;left:50%;animation:_bounce 1.2s ease infinite;font-size:28px">⬇️</div>`;
    overlay.querySelector('#_installDismiss').onclick = dismiss;
  } else {
    overlay.innerHTML = `<div style="background:#1A0A02;border-radius:24px 24px 0 0;padding:32px 24px 48px;width:100%;border-top:1px solid rgba(255,255,255,.1)"><div style="text-align:center;margin-bottom:24px"><div style="font-size:44px;margin-bottom:10px">📲</div><div style="font-size:19px;font-weight:900;color:#fff;margin-bottom:6px">Installer ${appName}</div><div style="font-size:13px;color:rgba(255,255,255,.45)">Lance l'app en 1 tap depuis ton écran d'accueil</div></div><button id="_installBtn" style="width:100%;padding:17px;background:linear-gradient(135deg,#c94a00,#E8570A);border:none;border-radius:16px;color:#fff;font-size:16px;font-weight:800;cursor:pointer;margin-bottom:12px;box-shadow:0 8px 24px rgba(232,87,10,.4)">Installer l'app</button><button id="_installSkip" style="width:100%;padding:14px;background:none;border:none;color:rgba(255,255,255,.35);font-size:14px;cursor:pointer">Pas maintenant</button></div>`;
    overlay.querySelector('#_installBtn').onclick = async () => { _deferredInstall.prompt(); await _deferredInstall.userChoice; dismiss(); };
    overlay.querySelector('#_installSkip').onclick = dismiss;
  }
  document.body.appendChild(overlay);
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
