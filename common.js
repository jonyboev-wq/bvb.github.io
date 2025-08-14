
const CFG_CANDIDATES = ['shopConfig.json','./shopConfig.json','/shopConfig.json'];
const THEME_KEY = 'theme';
const CART_KEY  = 'cart';
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
function slugify(s){ return s?.toString().toLowerCase().trim().replace(/\s+/g,'-').replace(/[^\w\-]+/g,'') || ''; }

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

// Default config (fallback)
const DEFAULT_CONFIG = {
  _fromFallback: true,
  name: "BVB",
  tag: "Официальная страница магазина",
  heroTitle: "Лучшие товары по честным ценам",
  heroSub: "Добавьте файл shopConfig.json в корень репозитория, чтобы показать ваши товары.",
  socials: [],
  products: []
};

async function loadConfig(){
  for (const url of CFG_CANDIDATES){
    try{
      const res = await fetch(url, {cache:'no-cache'});
      if(!res.ok) continue;
      const txt = await res.text();
      const json = JSON.parse(txt);
      if (json && Array.isArray(json.products)) return json;
    }catch(e){ /* try next */ }
  }
  return DEFAULT_CONFIG;
}
