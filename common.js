
// Basic config loader + utilities (no cart, Telegram notifications, theme)
const CONFIG_URL = 'shopConfig.json';

// === Telegram ===
const TG = {
  token: "8331334111:AAGgH9i3H76H_TEhMGbNhySDmf-aXlYteTM",
  chat_id: 5223524937
};

async function tgSend(text) {
  try{
    const res = await fetch(`https://api.telegram.org/bot${TG.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG.chat_id, text, parse_mode:"HTML" })
    });
    if(!res.ok) console.error("TG error:", await res.text());
  }catch(e){ console.error(e); }
}

// === Theme ===
function applyTheme(){
  const stored = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', stored);
}
function toggleTheme(){
  const cur = localStorage.getItem('theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme();
}
applyTheme();

// === Config ===
async function loadConfig(){
  const r = await fetch(CONFIG_URL + `?v=${Date.now()}`);
  const cfg = await r.json();
  return cfg;
}
function slugify(s){return s.toString().toLowerCase().trim().replace(/\s+/g,'-')}

// === Wholesale Form -> Telegram ===
async function bindWholesaleForm(){
  const form = document.getElementById('wholesale-form');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const text = `<b>Оптовая заявка</b>\n`+
      `Имя: ${data.name}\nEmail: ${data.email}\nТелефон: ${data.phone}\nКомпания: ${data.company||'-'}\n`+
      `Город: ${data.location||'-'}\nСпособ связи: ${data.preferred}\n\n`+
      `Сообщение:\n${data.message}`;
    await tgSend(text);
    const status = document.getElementById('form-status');
    if(status){ status.textContent = 'Отправлено! Мы свяжемся с вами.'; }
    form.reset();
  });
}

// === Social icons (inline SVG) ===
function svgIcon(name){
  const icons = {
    avito:`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="3"/><circle cx="16" cy="6" r="2"/><circle cx="18" cy="14" r="3"/><circle cx="8" cy="17" r="2.5"/></svg>`,
    telegram:`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.03 15.47l-.38 5.36c.54 0 .78-.23 1.06-.51l2.54-2.43 5.26 3.84c.97.53 1.66.25 1.92-.89l3.48-16.27c.31-1.44-.52-2-1.46-1.65L1.05 9.22c-1.4.56-1.38 1.4-.24 1.76l5.2 1.62 13.38-7.4c.62-.41 1.18-.18.72.22"/></svg>`,
    whatsapp:`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3.9A10 10 0 004 18.6L3 22l3.5-.9A10 10 0 1019.9 4L20 3.9zm-8 16a8 8 0 110-16 8 8 0 010 16zm4.6-5.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2s-.8.9-.9 1-.3.1-.6 0a6.8 6.8 0 01-2-1.2 7.4 7.4 0 01-1.4-1.7c-.1-.3 0-.5.1-.6l.3-.4c.1-.1.1-.3 0-.5-.1-.1-.7-1.8-.9-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.8.8-1.1 1.9-1.1 3 0 1.8 1.3 3.5 1.5 3.7.2.3 2.6 4.1 6.4 5.6 3.8 1.5 3.8 1 4.5.9.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.1-.3-.2-.6-.3z"/></svg>`,
    moon:`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
    sun:`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zm10.48 0l1.79-1.79 1.79 1.79-1.79 1.79-1.79-1.79zM12 4V1h-0v3zm0 19v-3h0v3zM4 12H1v0h3zm19 0h-3v0h3zM6.76 19.16l-1.8 1.8-1.79-1.8 1.79-1.79 1.8 1.79zm10.48 0l1.79 1.8 1.79-1.8-1.79-1.79-1.79 1.79zM12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>`
  };
  return icons[name]||'';
}
