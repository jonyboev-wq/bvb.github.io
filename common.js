
const CFG_URL = 'shopConfig.json';
const THEME_KEY = 'theme';
const CART_KEY  = 'cart';
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
function slugify(s){ return s.toString().toLowerCase().trim().replace(/\s+/g,'-').replace(/[^\w\-]+/g,''); }

// Theme
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem(THEME_KEY, t); }
function toggleTheme(){
  const t = (localStorage.getItem(THEME_KEY) || 'light') === 'light' ? 'dark' : 'light';
  applyTheme(t); updateThemeIcon();
}
function updateThemeIcon(){
  const t = localStorage.getItem(THEME_KEY) || 'light';
  const el = document.getElementById('theme-icon');
  if(el){ el.textContent = (t==='light' ? '🌙' : '☀️'); }
}

// Cart
function getCart(){ try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch{ return [] } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){ const c = getCart().reduce((a,x)=>a+(x.qty||1),0); const el = document.getElementById('cart-count'); if(el) el.textContent = c; }
function addToCart(item){
  const cart = getCart();
  const idx = cart.findIndex(x=>x.sku===item.sku && x.title===item.title);
  if(idx>-1){ cart[idx].qty += item.qty || 1; } else { cart.push({...item, qty: item.qty||1}); }
  saveCart(cart); alert('Товар добавлен в корзину');
}

// Config
async function loadConfig(){
  const res = await fetch(CFG_URL, {cache:'no-cache'});
  if(!res.ok) throw new Error('Не удалось загрузить shopConfig.json');
  return res.json();
}
