
// Theme toggle
(function(){
  const themeBtn = document.getElementById('theme-toggle');
  function apply(t){ document.documentElement.classList.toggle('light', t==='light'); localStorage.setItem('theme', t); themeBtn.setAttribute('aria-label', t==='light'?'Светлая тема':'Тёмная тема'); }
  const saved = localStorage.getItem('theme') || (window.matchMedia("(prefers-color-scheme: light)").matches ? 'light':'dark');
  apply(saved);
  themeBtn?.addEventListener('click', ()=> apply(document.documentElement.classList.contains('light') ? 'dark' : 'light'));
})();

// Icons
window.svgIcon = function(name){
  const map = {
    sun:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79L6.76 4.84zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm7.03-3.95l1.79-1.79-1.79-1.79-1.79 1.79 1.79 1.79zM20 13h3v-2h-3v2zM13 1h-2v3h2V1zm-7.03 16.95l-1.79 1.79 1.79 1.79 1.79-1.79-1.79-1.79zM12 6a6 6 0 100 12 6 6 0 000-12z"/></svg>',
    moon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.76 3a9 9 0 109.24 9.24A7 7 0 0112.76 3z"/></svg>',
    avito:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="3"/><circle cx="16" cy="6" r="2"/><circle cx="18" cy="14" r="3"/><circle cx="8" cy="17" r="2.5"/></svg>',
    telegram:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.036 15.47l-.38 5.36c.542 0 .776-.233 1.056-.512l2.536-2.43 5.256 3.84c.964.533 1.654.252 1.916-.89l3.472-16.27v-.002c.308-1.44-.52-2.004-1.46-1.654L1.05 9.22C-.346 9.78-.324 10.62.81 10.98l5.2 1.62L19.384 5.2c.616-.404 1.178-.18.716.224"/></svg>',
    whatsapp:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3.9A10 10 0 004 18.6L3 22l3.5-.9A10 10 0 1019.9 4L20 3.9zm-8 16a8 8 0 110-16 8 8 0 010 16zm4.6-5.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2s-.8.9-.9 1-.3.1-.6 0a6.8 6.8 0 01-2-1.2 7.4 7.4 0 01-1.4-1.7c-.1-.3 0-.5.1-.6l.3-.4c.1-.1.1-.3 0-.5-.1-.1-.7-1.8-.9-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.8.8-1.1 1.9-1.1 3 0 1.8 1.3 3.5 1.5 3.7.2.3 2.6 4.1 6.4 5.6 3.8 1.5 3.8 1 4.5.9.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.1-.3-.2-.6-.3z"/></svg>'
  };
  return map[name] ?? '';
}

// robust config loader
window.loadConfig = async function(){
  const candidates = [
    'shopConfig.json',
    './shopConfig.json',
    location.pathname.replace(/[^/]+$/, '') + 'shopConfig.json',
    '/' + 'shopConfig.json'
  ];
  for (const url of candidates){
    try {
      const r = await fetch(url, {cache:'no-store'});
      if (r.ok) return await r.json();
    } catch(e){ /* try next */ }
  }
  console.warn('shopConfig.json not found; using fallback.');
  return {
    name: "BVB",
    email: "poroshin_2006@bk.ru",
    phone: "+7 (983) 128-90-90",
    socials: [
      { label:"Avito", icon:"avito", url:"https://www.avito.ru/" },
      { label:"Telegram", icon:"telegram", url:"https://t.me/" },
      { label:"WhatsApp", icon:"whatsapp", url:"https://wa.me/" }
    ],
    products: []
  };
};

// Telegram helper (for wholesale page)
window.tgSend = async function(text){
  const token = "8331334111:AAGgH9i3H76H_TEhMGbNhySDmf-aXlYteTM";
  const chat = 5223524937;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: chat, text, parse_mode:'HTML'})
    });
    if(!res.ok) console.error('Telegram error:', await res.text());
  } catch(e){ console.error(e); }
};

// small helpers
window.qs = (s, el=document)=> el.querySelector(s);
window.qsa = (s, el=document)=> Array.from(el.querySelectorAll(s));
window.slugify = s => s.toLowerCase().trim().replace(/\s+/g,'-');
