
/* ===== Common JS: config loader, theme, utils, telegram ===== */
const CONFIG_CANDIDATES = [
  './shopConfig.json',
  '/shopConfig.json',
  'shopConfig.json'
];

export async function loadConfig(){
  for(const url of CONFIG_CANDIDATES){
    try{
      const r = await fetch(url, {cache:'no-store'});
      if(r.ok){
        const data = await r.json();
        return normalizeConfig(data);
      }
    }catch(e){ /* try next */ }
  }
  // Fallback default
  return normalizeConfig({
    name:'BVB', tag:'Официальная страница магазина',
    email:'sales@example.com', phone:'+7 (900) 000-00-00',
    socials:[
      {label:'Avito', url:'https://www.avito.ru/', icon:'avito'},
      {label:'Telegram', url:'https://t.me/', icon:'telegram'},
      {label:'WhatsApp', url:'https://wa.me/', icon:'whatsapp'}
    ],
    products:[]
  });
}

function normalizeConfig(cfg){
  cfg.products = (cfg.products||[]).map(p=>({
    ...p,
    slug: p.slug || slugify(p.title||''),
    photos: Array.isArray(p.photos) && p.photos.length ? p.photos : [p.img || p.photo].filter(Boolean)
  }));
  return cfg;
}

export function slugify(s){return (s||'').toString().trim().toLowerCase()
  .replace(/[^a-z0-9а-яё\-\s]/gi,'').replace(/\s+/g,'-');}

export function $(s,el=document){return el.querySelector(s)}
export function $$(s,el=document){return [...el.querySelectorAll(s)]}

/* Theme toggle */
export function initTheme(){
  const saved = localStorage.getItem('bvbTheme') || 'dark';
  if(saved==='light') document.documentElement.classList.add('light');
  const btn = document.getElementById('theme-toggle');
  if(btn){
    btn.innerHTML = themeSVG();
    btn.addEventListener('click', ()=>{
      document.documentElement.classList.toggle('light');
      localStorage.setItem('bvbTheme',
        document.documentElement.classList.contains('light')?'light':'dark');
      // ensure icon matches
      btn.innerHTML = themeSVG();
    });
  }
}
function themeSVG(){
  const light = document.documentElement.classList.contains('light');
  // show moon in light, sun in dark
  return light ? `
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor"
    d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>`
  : `
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor"
    d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm8.83-3.17l-1.79-1.79-1.8 1.79 1.8 1.79 1.79-1.79zM20 11v2h3v-2h-3zM6.76 19.16l-1.8 1.79 1.8 1.79 1.79-1.79-1.79-1.79zM11 1h2v3h-2V1zm7.07 5.64l1.79-1.8-1.79-1.79-1.8 1.79 1.8 1.8zM12 6a6 6 0 100 12A6 6 0 0012 6z"/></svg>`;
}

/* Social icons inline */
export function icon(name){
  const map = {
    telegram: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.036 15.47l-.38 5.36c.54 0 .78-.23 1.06-.51l2.54-2.43 5.26 3.84c.96.53 1.65.25 1.92-.89l3.47-16.27c.31-1.44-.52-2-1.46-1.65L1.05 9.22C-.35 9.78-.33 10.62.81 10.98l5.2 1.62 13.37-7.4c.62-.4 1.18-.18.72.22"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 3.9A10 10 0 004 18.6L3 22l3.5-.9A10 10 0 1019.9 4zM12 20a8 8 0 110-16 8 8 0 010 16zm4.6-5.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2s-.8.9-.9 1-.3.1-.6 0a6.8 6.8 0 01-2-1.2 7.4 7.4 0 01-1.4-1.7c-.1-.3 0-.5.1-.6l.3-.4c.1-.1.1-.3 0-.5-.1-.1-.7-1.8-.9-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.8.8-1.1 1.9-1.1 3 0 1.8 1.3 3.5 1.5 3.7.2.3 2.6 4.1 6.4 5.6 3.8 1.5 3.8 1 4.5.9.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.1-.3-.2-.6-.3z"/></svg>',
    avito: '<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="6" r="2" fill="currentColor"/><circle cx="18" cy="14" r="3" fill="currentColor"/><circle cx="8" cy="17" r="2.5" fill="currentColor"/></svg>'
  };
  return map[name] || '';
}

/* Telegram sending */
const TG = { token: "8331334111:AAGgH9i3H76H_TEhMGbNhySDmf-aXlYteTM", chat_id: 5223524937 };
export async function tgSend(text){
  try{
    const r = await fetch(`https://api.telegram.org/bot${TG.token}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: TG.chat_id, text, parse_mode:'HTML'})
    });
    if(!r.ok){ console.warn('TG error', await r.text()); }
  }catch(e){ console.warn('TG network error', e); }
}
