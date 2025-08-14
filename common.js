
window.Shop = (function(){
  const s = {};
  // Theme
  s.themeInit = function(){
    const saved = localStorage.getItem('theme')||'light';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('theme-toggle');
    if(btn){
      btn.addEventListener('click', ()=>{
        const cur = document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
        document.documentElement.setAttribute('data-theme', cur);
        localStorage.setItem('theme', cur);
        s.paintButtons();
      });
    }
    s.paintButtons();
  };
  s.paintButtons = function(){
    // make sure "Подробнее" buttons flip text color with theme
    document.querySelectorAll('.btn.primary').forEach(b=>{
      if(getComputedStyle(document.documentElement).getPropertyValue('--btn-text').trim()==='#000'){
        b.style.color = '#000';
        b.style.background = '#fff';
        b.style.borderColor = '#fff';
      }else{
        b.style.color = '#fff';
        b.style.background = '#000';
        b.style.borderColor = '#000';
      }
    });
  }
  // Cart
  const CART_KEY='shopCart';
  s.cart = JSON.parse(localStorage.getItem(CART_KEY)||'[]');
  s.saveCart = ()=> localStorage.setItem(CART_KEY, JSON.stringify(s.cart));
  s.addToCart = (item)=>{ s.cart.push(item); s.saveCart(); s.renderCartBadge(); alert('Товар добавлен в корзину'); };
  s.countCart = ()=> s.cart.length;
  s.renderCartBadge = ()=>{ const c=document.getElementById('cart-count'); if(c) c.textContent = s.countCart(); };

  // Config loader with multiple fallbacks
  s.loadConfig = async function(){
    const tries = [
      'shopConfig.json',
      './shopConfig.json',
      '/shopConfig.json'
    ];
    for(const url of tries){
      try{
        const res = await fetch(url, {cache:'no-cache'});
        if(res.ok){
          const data = await res.json();
          return data;
        }
      }catch(e){/* next */}
    }
    if(window.DEFAULT_CONFIG) return window.DEFAULT_CONFIG;
    throw new Error('shopConfig.json not found');
  };

  s.slugify = (t)=> t.toString().toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');

  return s;
})();
