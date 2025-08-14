
// Global Shop namespace
window.Shop = (function(){
  const s = {};

  /* THEME */
  s.themeInit = function(){
    const saved = localStorage.getItem('theme')||'light';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('theme-toggle');
    if(btn){
      btn.addEventListener('click', ()=>{
        const cur = document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
        document.documentElement.setAttribute('data-theme', cur);
        localStorage.setItem('theme', cur);
        s.restylePrimaryButtons();
      });
    }
    s.restylePrimaryButtons();
  };
  s.restylePrimaryButtons = function(){
    const btnText = getComputedStyle(document.documentElement).getPropertyValue('--btn-text').trim();
    const btnBg = getComputedStyle(document.documentElement).getPropertyValue('--btn').trim();
    document.querySelectorAll('.btn.primary').forEach(b=>{
      b.style.color = btnText;
      b.style.background = btnBg;
      b.style.borderColor = btnBg;
    });
  };

  /* TELEGRAM (user provided) */
  const TG = {
    token: "8331334111:AAGgH9i3H76H_TEhMGbNhySDmf-aXlYteTM",
    chat_id: 5223524937
  };
  s.tgSend = async function(text){
    try{
      const res = await fetch(`https://api.telegram.org/bot${TG.token}/sendMessage`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({chat_id: TG.chat_id, text, parse_mode: "HTML"})
      });
      if(!res.ok) throw new Error(await res.text());
    }catch(e){
      console.error("TG error:", e);
      alert("Не удалось отправить в Telegram. Проверь токен/связь.");
    }
  };

  /* CONFIG LOADER */
  s.loadConfig = async function(){
    const tries = ['shopConfig.json','./shopConfig.json','/shopConfig.json'];
    for(const u of tries){
      try{
        const r = await fetch(u, {cache:'no-cache'});
        if(r.ok) return await r.json();
      }catch(_){}
    }
    throw new Error('shopConfig.json not found');
  };

  s.slugify = t => t.toString().toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');

  /* CART */
  const CART_KEY='shopCart';
  s.cart = JSON.parse(localStorage.getItem(CART_KEY)||'[]');
  s.saveCart = ()=> localStorage.setItem(CART_KEY, JSON.stringify(s.cart));
  s.countCart = ()=> s.cart.reduce((n,i)=>n+(i.qty||1),0);
  s.renderCartBadge = ()=>{ const c=document.getElementById('cart-count'); if(c) c.textContent = s.countCart(); };

  s.addToCart = (item)=>{
    const idx = s.cart.findIndex(i=>i.title===item.title);
    if(idx>=0){ s.cart[idx].qty += item.qty||1; } else { s.cart.push({...item, qty:item.qty||1}); }
    s.saveCart(); s.renderCartBadge();
  };
  s.removeFromCart = (title)=>{ s.cart = s.cart.filter(i=>i.title!==title); s.saveCart(); s.renderCartBadge(); };
  s.setQty = (title, qty)=>{
    const it=s.cart.find(i=>i.title===title); if(!it) return;
    it.qty = Math.max(1, qty|0); s.saveCart(); s.renderCartBadge();
  };
  s.parsePrice = (p)=>{
    // "2 990 ₽" or "от 99 ₽"
    const m = (p||"").toString().replace(/[^\d]/g,''); return (m?parseInt(m,10):0);
  };
  s.total = ()=> s.cart.reduce((sum,i)=> sum + s.parsePrice(i.price)*(i.qty||1), 0);

  return s;
})();

/* CART MODAL RENDER */
function openCart(){
  const modal = document.getElementById('cart-modal');
  const body = document.getElementById('cart-body');
  const total = document.getElementById('cart-total');
  body.innerHTML='';

  if(!Shop.cart.length){
    body.innerHTML = '<div class="small">Корзина пуста.</div>';
  }else{
    Shop.cart.forEach(it=>{
      const row = document.createElement('div');
      row.className='row';
      row.innerHTML = `
        <img src="${it.img}" style="width:56px;height:56px;border-radius:10px;border:1px solid var(--accent);object-fit:cover">
        <div style="flex:1">
          <div style="font-weight:600">${it.title}</div>
          <div class="small">${it.price} за шт.</div>
        </div>
        <div class="qty">
          <button class="dec">−</button>
          <input class="q" value="${it.qty||1}" />
          <button class="inc">+</button>
        </div>
        <button class="btn icon rem" title="Удалить">✖️</button>
      `;
      row.querySelector('.inc').onclick=()=>{ Shop.setQty(it.title,(it.qty||1)+1); openCart(); };
      row.querySelector('.dec').onclick=()=>{ Shop.setQty(it.title,(it.qty||1)-1); openCart(); };
      row.querySelector('.q').onchange=(e)=>{ Shop.setQty(it.title, parseInt(e.target.value||'1',10)); openCart(); };
      row.querySelector('.rem').onclick=()=>{ Shop.removeFromCart(it.title); openCart(); };
      body.appendChild(row);
    });
  }
  total.textContent = new Intl.NumberFormat('ru-RU').format(Shop.total()) + " ₽";
  modal.classList.add('show');
}
function closeCart(){ document.getElementById('cart-modal').classList.remove('show'); }

async function checkout(){
  if(!Shop.cart.length){ alert('Корзина пуста'); return; }
  const name = document.getElementById('co-name').value.trim();
  const phone = document.getElementById('co-phone').value.trim();
  if(!name || !phone){ alert('Укажите имя и телефон'); return; }
  const lines = Shop.cart.map((it,i)=> `${i+1}. ${it.title} — ${it.price} × ${it.qty}`).join('\n');
  const text = `<b>Новый заказ</b>\n${lines}\n\nИтого: ${new Intl.NumberFormat('ru-RU').format(Shop.total())} ₽\nИмя: ${name}\nТелефон: ${phone}`;
  await Shop.tgSend(text);
  Shop.cart = []; Shop.saveCart(); Shop.renderCartBadge(); closeCart();
  alert('Заявка отправлена! Мы свяжемся с вами.');
}
