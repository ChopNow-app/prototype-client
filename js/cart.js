/**
 * cart.js — ChopNow Client Prototype
 * Cart state persisted in localStorage across screen navigations.
 */

const CART_KEY = 'chopnow_cart';

const MENU_ITEMS = {
  ndole:  { name: 'Ndolé + poisson braisé', price: 3500, icon: '🥘' },
  dg:     { name: 'Poulet DG',              price: 4500, icon: '🍗' },
  soya:   { name: 'Soya de bœuf',           price: 2000, icon: '🍢' },
  bissap: { name: 'Jus de bissap',          price: 500,  icon: '🥤' },
};

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// ─── MUTATIONS ───────────────────────────────────────────────────────────────
function addToCart(key) {
  const cart = getCart();
  cart[key] = (cart[key] || 0) + 1;
  saveCart(cart);
}

function changeQty(key, delta) {
  const cart = getCart();
  const next = (cart[key] || 0) + delta;
  if (next <= 0) delete cart[key];
  else cart[key] = next;
  saveCart(cart);
  return cart[key] ?? 0;
}

function setQty(key, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[key];
  else cart[key] = qty;
  saveCart(cart);
}

// ─── COMPUTED ────────────────────────────────────────────────────────────────
function getCartTotal() {
  return Object.entries(getCart())
    .reduce((sum, [k, q]) => sum + (MENU_ITEMS[k]?.price ?? 0) * q, 0);
}

function getCartCount() {
  return Object.values(getCart()).reduce((s, q) => s + q, 0);
}

// ─── FORMAT ──────────────────────────────────────────────────────────────────
function fmt(n) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}
