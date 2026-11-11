(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const products = window.fitbiteMenu.xlBowls;
  const key = 'fitbite:saladette:proefmand:v1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const app = $('app'), table = $('table-view'), detail = $('detail'), hero = $('hero-bowl');
  const positions = {royal:[29,63,53,2],sea:[68,71,60,4],'xl-crousty':[30,78,61,5],'xl-side':[73,55,43,1]};
  const buttons = new Map();
  let sideDraft = null;
  let demoRun=0, tripRun=0, tripAnimations=[], lastPreview=false;
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  let selected = null, activeAnimation = null, selectionToken = 0;
  function readBasket() {
    try { const items = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(items) ? items.map(window.fitbiteMenu.normalizeBowl).filter(Boolean) : []; } catch { return []; }
  }
  function count() {
    const n = readBasket().length + Object.values(window.fitbiteMenu.readCart()).reduce((sum,q) => sum + q, 0);
    $('count').textContent = n;
    document.querySelector('.bag').setAttribute('aria-label', `Bekijk je bestelling, ${n} ${n === 1 ? 'item' : 'items'}`);
  }
  function sizeHero() {
    const slot = hero.parentElement;
    hero.style.width = Math.min(slot.clientWidth, slot.clientHeight * 1.5) + 'px';
  }
  function animateBetween(from,to,back=false) {
    activeAnimation?.cancel();
    if (reduce.matches) return Promise.resolve();
    const transform = `translate(${from.left+from.width/2-to.left-to.width/2}px,${from.top+from.height/2-to.top-to.height/2}px) scale(${from.width/to.width})`;
    activeAnimation = hero.animate(back ? [{transform:'none'},{transform}] : [{transform},{transform:'none'}],{duration:back?520:850,easing:'cubic-bezier(.2,.75,.2,1)',fill:'both'});
    return activeAnimation.finished.catch(()=>{});
  }
  function showRecipe(p) {
    $('recipe-title').textContent = p.name;
    $('recipe-parts').replaceChildren();
    for (const [label,value] of [['Basis',p.base],['Proteïne',p.protein],['Groenten',p.vegetables.join(', ')],['Sauzen',p.sauces.join(', ')],['Toppings',p.toppings.join(', ')]]) {
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = label; dd.textContent = value; row.append(dt,dd); $('recipe-parts').append(row);
    }
    $('recipe').showModal();
  }
  async function choose(p) {
    ++demoRun;
    const token = ++selectionToken;
    activeAnimation?.cancel();
    selected = p;
    sideDraft = null;
    $('add-bowl').querySelector('span').textContent=p.custom?'Kies mijn vier porties':'Voeg toe aan mijn bestelling';
    $('bowl-list').close();
    const button = buttons.get(p.id);
    const origin = button.querySelector('img').getBoundingClientRect();
    for (const b of buttons.values()) b.classList.remove('is-chosen');
    hero.src = `media/${p.file}.${p.imageType||'webp'}`; hero.alt = p.name;
    $('product-title').textContent = p.name;
    $('product-tagline').textContent = p.tagline;
    $('ingredients').textContent = [p.protein,...p.vegetables].join(' · ');
    $('product-kicker').textContent = p.xl ? 'Fitbite / XL specials' : 'Fitbite / Jouw favoriet';
    const medium = document.querySelector('input[value="Medium"]');
    const large = document.querySelector('input[value="Large"]');
    medium.closest('label').hidden = !!p.xl; medium.disabled = !!p.xl;
    medium.checked = !p.xl; large.checked = !!p.xl;
    $('large-label').textContent = p.xl ? 'XL · Royaal genieten' : 'Large';
    detail.classList.remove('is-added'); $('added').hidden = true;
    detail.hidden = false; app.classList.add('is-detail'); table.inert = true; table.setAttribute('aria-hidden','true');
    button.classList.add('is-chosen');
    sizeHero();
    await hero.decode().catch(()=>{});
    if (token !== selectionToken) return;
    sizeHero();
    const finished = animateBetween(origin,hero.getBoundingClientRect());
    $('product-title').focus({preventScroll:true});
    await finished;
    if (token === selectionToken) {activeAnimation?.cancel(); activeAnimation=null;}
  }
  async function back() {
    if (!selected) return;
    ++demoRun;
    const token = ++selectionToken;
    const button = buttons.get(selected.id);
    activeAnimation?.cancel();
    app.classList.remove('is-detail');
    await animateBetween(button.querySelector('img').getBoundingClientRect(),hero.getBoundingClientRect(),true);
    if (token !== selectionToken) return;
    activeAnimation?.cancel(); activeAnimation=null;
    detail.hidden = true; table.inert = false; table.removeAttribute('aria-hidden');
    button.classList.remove('is-chosen'); selected=null; button.focus({preventScroll:true});
  }
  products.forEach((p,index) => {
    const [x,y,w,z]=positions[p.id];
    const button=document.createElement('button'); button.type='button'; button.className='table-bowl';
    button.style.cssText=`--x:${x}%;--y:${y}%;--w:${w}%;--z:${z}`;
    button.setAttribute('aria-label',`Bekijk ${p.name}`);
    const img=document.createElement('img');img.src=`media/${p.file}.${p.imageType||'webp'}`;img.alt='';img.width=1536;img.height=1024;
    img.decode().then(()=>button.classList.add('image-ready')).catch(()=>{});
    button.append(img);button.addEventListener('click',()=>choose(p));$('table-bowls').append(button);buttons.set(p.id,button);
    const choice=document.createElement('button');choice.className='name-choice';choice.type='button';
    const thumb=img.cloneNode(),name=document.createElement('span');name.textContent=p.name;choice.append(thumb,name);choice.addEventListener('click',()=>choose(p));$('name-list').append(choice);
  });
  $('back-table').addEventListener('click',back); $('keep-looking').addEventListener('click',back);
  $('show-list').addEventListener('click',()=>$('bowl-list').showModal());
  $('more-ingredients').addEventListener('click',()=>{++demoRun;if(selected)showRecipe(selected);});
  const menu=document.querySelector('.menu-toggle');
  menu.addEventListener('click',()=>{$('navigation').showModal();menu.setAttribute('aria-expanded','true');});
  $('navigation').addEventListener('close',()=>menu.setAttribute('aria-expanded','false'));
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && selected && $('checkout-journey').hidden && !document.querySelector('dialog[open]')) {event.preventDefault();back();}
  });
  function saveSelected() {
    ++demoRun;
    if (!selected || detail.classList.contains('is-added')) return;
    const size=document.querySelector('input[name="size"]:checked').value;
    const basket=readBasket();
    basket.push({id:crypto.randomUUID(),signature:selected.id,size,vegetables:[...selected.vegetables],protein:selected.protein,sauces:[...selected.sauces],toppings:[...selected.toppings],...(sideDraft||{})});
    try {localStorage.setItem(key,JSON.stringify(basket));} catch { $('add-bowl').querySelector('span').textContent='Opslaan mislukt. Probeer opnieuw.'; return; }
    count();detail.classList.add('is-added');$('added').hidden=false;
    $('added-message').textContent=`${selected.name} · ${selected.xl?'XL':size} staat in je bestelling.`;
    sizeHero();$('added').querySelector('a').focus({preventScroll:true});
  }
  $('add-bowl').addEventListener('click',()=>{
    if(!selected) return;
    if(!selected.custom) return saveSelected();
    $('side-form').reset();
    $('side-options').showModal();
  });
  for(let i=0;i<4;i++) {
    const label=document.createElement('label');label.textContent=`Portie ${i+1}`;
    const select=document.createElement('select');select.name='portion';select.required=true;
    select.add(new Option('Kies je kip',''));
    window.fitbiteMenu.sideProteins.forEach(v=>select.add(new Option(v,v)));
    label.append(select);$('portions').append(label);
  }
  for(let i=0;i<2;i++) {
    const label=document.createElement('label');label.textContent=`Saus ${i+1}`;
    const select=document.createElement('select');select.name='sauce';select.required=true;
    window.fitbiteMenu.sideSauces.forEach(v=>select.add(new Option(v,v)));
    select.options[i].defaultSelected=true;select.selectedIndex=i;label.append(select);$('side-sauces').append(label);
  }
  $('side-form').addEventListener('submit',event=>{
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    sideDraft={portions:form.getAll('portion'),sauces:form.getAll('sauce'),toppings:form.get('onion')?['Crispy ui']:[]};
    sideDraft.protein=sideDraft.portions.join(', ');
    $('side-options').close();saveSelected();
  });
  function cancelTrip() {
    ++tripRun;
    tripAnimations.forEach(a=>a.cancel());tripAnimations=[];
    app.classList.remove('is-travelling');
  }
  function closeCheckout() {
    cancelTrip();++demoRun;
    $('checkout-journey').hidden=true;
    app.classList.remove('is-checkout');detail.inert=false;
    hero.style.visibility='';
    sizeHero();$('product-title').focus({preventScroll:true});
  }
  async function checkoutJourney(preview=false) {
    if(!selected)return;
    cancelTrip();lastPreview=preview;
    const token=tripRun;
    const rect=selected.id==='xl-crousty';
    const scene=$('checkout-journey'), open=$('travel-open'), packed=$('travel-packed'), product=$('checkout-product'), background=$('checkout-background');
    open.src=hero.src;open.alt=selected.name;open.style.opacity='1';packed.style.opacity='0';
    packed.hidden=!rect;$('checkout-generic').hidden=true;product.style.opacity='1';
    $('checkout-actions').hidden=true;
    $('checkout-step').textContent='03 / Naar de kassa';
    $('checkout-title').textContent='We gaan naar de kassa.';
    $('checkout-caption').textContent=selected.name;
    const assets=[open.decode(),background.decode()];if(rect)assets.push(packed.decode());
    try{await Promise.all(assets);}catch{ $('checkout-caption').textContent='Het beeld kon niet laden. Probeer opnieuw.';return; }
    if(token!==tripRun)return;
    activeAnimation?.cancel();activeAnimation=null;
    const start=hero.getBoundingClientRect();
    scene.hidden=false;detail.inert=true;
    const end=product.getBoundingClientRect();
    const dx=start.left+start.width/2-end.left-end.width/2,dy=start.top+start.height/2-end.top-end.height/2,scale=start.width/end.width;
    app.classList.add('is-checkout','is-travelling');
    const motion=(el,frames,options)=>{const a=el.animate(frames,options);tripAnimations.push(a);return a.finished.catch(()=>{});};
    if(!reduce.matches) {
      motion(background,[{opacity:0,transform:'translateX(6%) scale(1.12)'},{opacity:1,transform:'none'}],{duration:1500,easing:'cubic-bezier(.22,.65,.3,1)',fill:'both'});
      await motion(product,[{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${scale})`},{transform:'translate(-50%,-50%) scale(.94)',offset:.82},{transform:'translate(-50%,-50%) scale(1)'}],{duration:1800,easing:'cubic-bezier(.25,.6,.25,1)',fill:'both'});
    }
    if(token!==tripRun)return;
    $('checkout-step').textContent='04 / Inpakken';$('checkout-title').textContent='Vers voor jou. Netjes ingepakt.';
    if(!reduce.matches)await pause(350);
    if(token!==tripRun)return;
    if(rect) {
      if(!reduce.matches)await Promise.all([
        motion(packed,[{opacity:0,transform:'translateY(-22px)'},{opacity:1,transform:'none'}],{duration:900,easing:'ease-out',fill:'both'}),
        motion(open,[{opacity:1},{opacity:0}],{duration:900,easing:'ease-in',fill:'both'})
      ]);
      else{packed.style.opacity='1';open.style.opacity='0';}
    }else{
      $('checkout-generic').hidden=false;
      if(!reduce.matches)await Promise.all([motion($('checkout-generic'),[{opacity:0},{opacity:1}],{duration:900,fill:'both'}),motion(product,[{opacity:1},{opacity:0}],{duration:900,fill:'both'})]);
      else product.style.opacity='0';
    }
    if(token!==tripRun)return;
    $('checkout-step').textContent='05 / Bij de kassa';$('checkout-title').textContent='Ingepakt. Klaar voor jou.';
    $('checkout-caption').textContent=selected.name+' · XL';
    $('checkout-order').textContent=preview?'Zo ziet jouw bestelreis eruit.':'Je keuze staat in je bestelling.';
    $('review-order').hidden=preview;
    $('journey-note').textContent=preview?'Demonstratie · niets toegevoegd of betaald.':'Bestelproef · er is niets betaald.';
    $('checkout-actions').hidden=false;app.classList.remove('is-travelling');
    $('checkout-title').focus({preventScroll:true});
  }
  async function playDemo() {
    if(!$('checkout-journey').hidden)closeCheckout();
    await choose(products.find(p=>p.id==='xl-crousty'));
    const run=demoRun;
    await pause(reduce.matches?400:2200);
    if(run===demoRun && selected?.id==='xl-crousty')checkoutJourney(true);
  }
  $('go-checkout').addEventListener('click',event=>{event.preventDefault();checkoutJourney(false);});
  $('play-demo').addEventListener('click',playDemo);
  $('checkout-back').addEventListener('click',closeCheckout);
  $('checkout-menu').addEventListener('click',()=>{closeCheckout();back();});
  $('replay-journey').addEventListener('click',()=>{const preview=lastPreview;closeCheckout();checkoutJourney(preview);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('checkout-journey').hidden){event.preventDefault();closeCheckout();}});
  addEventListener('pagehide',()=>{++demoRun;cancelTrip();});
  addEventListener('resize',()=>{if(selected){activeAnimation?.cancel();sizeHero();}});
  reduce.addEventListener('change',()=>{activeAnimation?.cancel();});
  addEventListener('storage',count);addEventListener('pageshow',count);count();
})();
