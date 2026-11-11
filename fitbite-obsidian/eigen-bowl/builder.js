(() => {
  'use strict';

  const query = new URLSearchParams(location.search);
  const kind=['crousty','protein'].includes(query.get('type'))?query.get('type'):'poke';
  document.body.dataset.kind=kind;
  if(kind==='protein'){const photo=document.querySelector('.opening-photo');photo.src='media/keuken/keukenluik.jpg';photo.alt='Het Fitbite-keukenwerkblad bij het houten luik.';}
  const steps = kind==='crousty' ? ['intro','proteine','sauzen','toppings'] : kind==='protein' ? ['intro','proteine','groenten','sauzen','toppings'] : ['intro','groenten','proteine','sauzen','toppings'];
  // Pump coordinates are percentages of the uncropped portrait photo.
  const sauces = [
    {name: 'Teriyaki', pump: [24.2, 59.4]},
    {name: 'Sriracha mayo', pump: [49.8, 59.4]},
    {name: 'Truffelmayonaise', pump: [74.6, 59.4]},
    {name: 'Huisgemaakte Dyna-saus'},
    {name: 'BBQ-saus'}
  ];
  let pumpSauces = sauces.filter(sauce => sauce.pump);
  const options = {
    size: ['Medium', 'Large'],
    vegetables: ['Mango', 'Avocado', 'Komkommer', 'Edamame', 'Maïs', 'Rode ui', 'Tomaat'],
    protein: ['Kip', 'Verse zalm', 'Gerookte zalm', 'Scampi', 'Korean chicken', 'Spicy tenders', 'Texas strips'],
    sauces: sauces.map(sauce => sauce.name),
    toppings: ['Sesam', 'Krokante uitjes']
  };
  const copy = {
    intro: ['Achter de bar', 'Stel je eigen bowl samen.', '', 'Kies je groenten'],
    groenten: ['De saladette', 'Kies je groenten.', 'Tik op een ingrediënt. Tik opnieuw om het weg te laten.', 'Kies je proteïne'],
    proteine: ['In de keuken', 'Kies je proteïne.', '', 'Kies je saus'],
    sauzen: ['Bij het keukenluik', 'Kies je saus.', 'Je mag sauzen combineren.', 'Naar de toppings'],
    toppings: ['Aan de saladette', 'Kies je toppings.', '', 'Voeg mijn bowl toe'],
    keuze: ['In je bestelling', 'Helemaal jouw bowl.', '', 'Afrekenen'],
    kassa: ['Bij de kassa', 'Afrekenen.', '', 'Online betalen uitproberen'],
    mand: ['Jouw selectie', 'Jouw bestelling.', '', 'Afrekenen']
  };
  if(kind==='crousty') {
    options.protein=['Kip','Korean chicken','Nuggets','Crispy tenders'];
    options.sauces=['Teriyaki mayo','Sriracha mayo','Zoete sriracha','BBQ-saus'];
    options.toppings=['Crispy ui'];
    copy.intro=['Jouw Crousty','Stel je Crousty samen.','Rijst, onze speciale Crousty-saus en jouw favoriete kip.','Kies je proteïne'];
    copy.sauzen[2]='Kies één saus. Een tweede is optioneel.';
  } else if(kind==='protein') {
    options.protein=['Kip','Nuggets','Crispy tenders','Korean chicken','Verse zalm','Gegrilde zalm','Scampi'];
    options.sauces=['Teriyaki','Sriracha mayo'];
    copy.intro=['Zonder rijst','Jouw proteïne-bowl.','Proteïne als basis. Vijf mix-ins, jouw saus en toppings.','Kies je proteïne'];
    copy.proteine[2]='Dit wordt de basis van je bowl. Zonder rijst.';
    copy.proteine[3]='Kies je vijf mix-ins';
    copy.groenten[1]='Kies je vijf mix-ins.';
    copy.groenten[2]='Kies vijf verschillende ingrediënten.';
    copy.groenten[3]='Kies je saus';
  }
  if(kind!=='poke') pumpSauces=options.sauces.slice(0,3).map((name,i)=>({name,pump:[24.2+i*25.2,59.4]}));
  const storageKey = 'fitbite:saladette:proefmand:v1';
  const byId = id => document.getElementById(id);
  const choices = byId('choices');
  const next = byId('continue');
  const back = byId('back');
  const basketButton = byId('basket');
  const menuLink = byId('menu-verder');
  const followBowl = byId('bowl-follow');
  const kitchenFrame = byId('kitchen-frame');
  const proteinDetail = byId('protein-detail');
  const proteinStage = document.querySelector('.protein-stage');
  const sauceScene = byId('sauce-scene');
  const toppingScene = byId('topping-scene');
  const scoopDirectory = 'media/keuken/schep/';
  let scene = 'intro';
  let returnScene = 'intro';
  let draftStarted = false;
  let bowl = emptyBowl();
  let basket = readBasket();
  let menuCart = window.fitbiteMenu.readCart();
  let checkoutFrom = 'mand';
  let paymentPreview = false;
  let finishLocked = false;
  let finishUnlockTimer;
  const previewScene = query.get('voorbeeld');
  let previewBowl = ['sauzen', 'toppings'].includes(previewScene);
  const remembered = history.state?.fitbiteFinish;
  const rememberedBowl = basket.find(item => item.id === remembered?.bowlId);
  if (query.get('bestelling') === 'mand') {
    scene = 'mand';
  } else if (query.get('bestelling') === 'kassa') {
    scene = itemCount() ? 'kassa' : 'mand';
  } else if (rememberedBowl && ['kassa', 'keuze'].includes(remembered.scene)) {
    bowl = structuredClone(rememberedBowl);
    scene = remembered.scene;
    checkoutFrom = 'keuze';
  } else if (previewBowl) {
    bowl.size = 'Medium';
    scene = previewScene;
  }

  function emptyBowl() {
    return {kind,size:kind==='poke'?'':'Medium',vegetables:[],protein:'',sauces:[],toppings:[]};
  }

  function showPumps() {
    const pumps = byId('sauce-pumps');
    for (const [index, sauce] of pumpSauces.entries()) {
      const pump = action('', 'sauce-pump', () => select('sauces', sauce.name));
      pump.dataset.sauce = sauce.name;
      pump.setAttribute('aria-label', sauce.name);
      pump.style.setProperty('--x', sauce.pump[0] + '%');
      pump.style.setProperty('--y', sauce.pump[1] + '%');
      const marker = element('span', 'pump-mark', String(index + 1));
      marker.setAttribute('aria-hidden', 'true');
      pump.append(marker);
      pumps.append(pump);
    }
  }

  function readBasket(fallback = []) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(saved)) return [];
      return saved.map(window.fitbiteMenu.normalizeBowl).filter(Boolean);
    } catch { return fallback; }
  }

  function itemCount() {
    return basket.length + Object.values(menuCart).reduce((count, quantity) => count + quantity, 0);
  }

  function countLabel() {
    const count = itemCount();
    return count + (count === 1 ? ' item' : ' items');
  }

  function confirmBowl() {
    if (!bowl.size) return goTo('intro');
    basket = readBasket(basket);
    if (!bowl.id) bowl.id = crypto.randomUUID();
    const index = basket.findIndex(item => item.id === bowl.id);
    const entry = structuredClone(bowl);
    if (index < 0) basket.push(entry);
    else basket[index] = entry;
    saveBasket();
    goTo('keuze');
    announce('Je bowl staat in je bestelling.');
  }

  function saveBasket() {
    try { localStorage.setItem(storageKey, JSON.stringify(basket)); }
    catch { /* Storage may be unavailable when opening the preview as a local file. */ }
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function action(label, className, handler) {
    const button = element('button', className, label);
    button.type = 'button';
    button.addEventListener('click', handler);
    return button;
  }

  function isSelected(group, value) {
    return Array.isArray(bowl[group]) ? bowl[group].includes(value) : bowl[group] === value;
  }

  function select(group, value) {
    if (!options[group]?.includes(value)) return;
    const wasSelected = isSelected(group, value);
    if (!wasSelected && group==='vegetables' && kind==='protein' && bowl.vegetables.length>=5) {announce('Je hebt vijf mix-ins gekozen. Verwijder er één om te wisselen.');return;}
    if (!wasSelected && group==='sauces' && kind!=='poke' && bowl.sauces.length>=2) {announce('Je kunt maximaal twee sauzen kiezen.');return;}
    if (Array.isArray(bowl[group])) {
      bowl[group] = wasSelected ? bowl[group].filter(item => item !== value) : [...bowl[group], value];
    } else {
      bowl[group] = group === 'protein' && wasSelected ? '' : value;
    }
    syncSelection();
    const feedback = value + (isSelected(group, value) ? ' gekozen.' : ' verwijderd.');
    announce(group === 'sauces' && !bowl.sauces.length ? feedback + ' Je bowl is nu zonder saus.' : feedback);
    signal();
  }

  function announce(message) {
    if (byId('status')) byId('status').textContent = message;
  }

  function signal() {
    document.dispatchEvent(new CustomEvent('fitbite:builderchange', {
      detail: {scene, bowl: structuredClone(bowl), count: itemCount()}
    }));
  }

  function syncKitchen() {
    document.querySelectorAll('[data-veg-layer]').forEach(layer => {
      layer.hidden = !bowl.vegetables.includes(layer.dataset.vegLayer);
      if (bowl.vegetables.length === 2) {
        layer.style.setProperty('--pair-x', layer.dataset.vegLayer === bowl.vegetables[0] ? '34%' : '65%');
      }
    });
    if (followBowl) {
      followBowl.dataset.portions = String(bowl.vegetables.length);
      followBowl.setAttribute('aria-label', [kind==='protein'?'Proteïnebowl zonder rijst':'Bowl met rijst', ...bowl.vegetables].join(', '));
    }
    if (!proteinDetail) return;
    const caption = byId('protein-caption');
    if (caption) {
      caption.textContent = bowl.protein;
      caption.hidden = !bowl.protein;
    }
    if (proteinStage) proteinStage.dataset.proteinSelected = String(Boolean(bowl.protein));
    const ingredient = bowl.protein.toLowerCase();
    const knownScoops=['kip','verse zalm','gerookte zalm','scampi','korean chicken','spicy tenders','texas strips'];
    const hasScoop=!ingredient||knownScoops.includes(ingredient);
    const file=scoopDirectory+(hasScoop&&ingredient?ingredient.replaceAll(' ','-'):'leeg')+'.jpg';
    proteinDetail.alt = ingredient && hasScoop ? 'Portioneerlepel met ' + ingredient : 'Lege portioneerlepel';
    if (proteinDetail.getAttribute('src') !== file) proteinDetail.src = file;
    proteinDetail.hidden = !hasScoop;
  }

  function syncSelection() {
    choices.querySelectorAll('button[data-group]').forEach(button => {
      const selected = isSelected(button.dataset.group, button.dataset.value);
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-selected', selected);
      button.querySelector('.choice-mark').textContent = selected ? '✓' : '+';
    });
    document.querySelectorAll('[data-pick]').forEach(button => {
      const selected = bowl.vegetables.includes(button.dataset.pick);
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-selected', selected);
    });
    document.querySelectorAll('[data-sauce]').forEach(button => {
      const selected = isSelected('sauces', button.dataset.sauce);
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-selected', selected);
    });
    syncKitchen();
    if (scene === 'sauzen') {
      (next.querySelector('[data-cta-label]') || next).textContent =
        bowl.sauces.length ? 'Naar de toppings' : kind==='crousty'?'Kies eerst een saus':'Verder zonder saus';
    }
    if (scene === 'toppings' && bowl.id) next.querySelector('[data-cta-label]').textContent = 'Bewaar mijn wijzigingen';
    next.disabled = (scene==='intro'&&!bowl.size) || (scene==='proteine'&&kind!=='poke'&&!bowl.protein) || (scene==='groenten'&&kind==='protein'&&bowl.vegetables.length!==5) || (scene==='sauzen'&&kind==='crousty'&&!bowl.sauces.length) || finishLocked;
    if(scene==='groenten'&&kind==='protein') byId('scene-description').textContent=`${bowl.vegetables.length} van 5 gekozen. Tik opnieuw om te wisselen.`;
    menuLink.setAttribute('aria-disabled', String(finishLocked));
    menuLink.tabIndex = finishLocked ? -1 : 0;
  }

  function addChoices(group, label, showLabel = false) {
    const section = element('div', 'choice-group');
    section.dataset.group = group;
    section.setAttribute('role', 'group');
    section.setAttribute('aria-label', label);
    if (showLabel) section.append(element('h3', 'choice-heading', label));
    const grid = element('div', 'choice-grid');
    options[group].forEach(value => {
      const button = action('', 'choice', () => select(group, value));
      button.dataset.group = group;
      button.dataset.value = value;
      const mark = element('span', 'choice-mark');
      mark.setAttribute('aria-hidden', 'true');
      if (group === 'sauces') {
        const pumpIndex = pumpSauces.findIndex(sauce => sauce.name === value);
        if (pumpIndex >= 0) {
          const number = element('span', 'pump-key', String(pumpIndex + 1));
          number.setAttribute('aria-hidden', 'true');
          button.append(number);
        }
      }
      const choiceLabel = element('span', 'choice-label', value);
      if (value === 'Truffelmayonaise') {
        choiceLabel.replaceChildren('Truffel', element('wbr'), 'mayonaise');
      }
      button.append(choiceLabel, mark);
      grid.append(button);
    });
    section.append(grid);
    choices.append(section);
  }

  function summary(item) {
    const list = element('dl', 'bowl-summary');
    const rows = [
      ['Formaat', window.fitbiteMenu.bowlSize(item)], ['Basis', window.fitbiteMenu.bowlBase(item)], ['Groenten', item.vegetables.join(', ') || 'Geen'],
      ['Proteïne', item.protein || 'Geen'], ['Saus', item.sauces.join(', ') || 'Geen'],
      ['Toppings', item.toppings.join(', ') || 'Geen']
    ];
    rows.forEach(([name, value]) => {
      const row = element('div', 'summary-row');
      row.append(element('dt', '', name), element('dd', '', value));
      list.append(row);
    });
    return list;
  }

  function persistCart(nextBasket,nextMenu) {
    try {
      if(nextBasket) localStorage.setItem(storageKey,JSON.stringify(nextBasket));
      if(nextMenu) localStorage.setItem(window.fitbiteMenu.storageKey,JSON.stringify(nextMenu));
      if(nextBasket)basket=nextBasket;if(nextMenu)menuCart=nextMenu;
      return true;
    }catch{announce('Je wijziging kon niet worden opgeslagen. Probeer opnieuw.');return false;}
  }
  function cartPhoto(item,legacyId) {
    const product=item?window.fitbiteMenu.signature(item):window.fitbiteMenu.signatureBowls.find(p=>p.id===legacyId);
    if(product)return '../bowls/media/'+product.file+'.'+(product.imageType||'webp');
    if(item)return '../voorpagina/media/logo.jpeg';
    const record=window.fitbiteMenu.items.find(p=>p[0]===legacyId);
    return record&&/\.(png|webp|jpg)$/.test(record[2])?'../assets/'+record[2]:'../voorpagina/media/logo.jpeg';
  }
  function refreshCartFocus(key,control) {
    const scroll=choices.scrollTop;
    render();choices.scrollTop=scroll;
    const target=[...choices.querySelectorAll('[data-cart-key]')].find(el=>el.dataset.cartKey===key&&el.dataset.cartAction===control&&!el.disabled);
    (target||choices.querySelector('.quantity-plus')||next).focus({preventScroll:true});
  }
  function cartEntry({key,name,size,quantity,photo,item,change}) {
    const entry=element('article','cart-item');
    const top=element('div','cart-product');
    const image=element('img','cart-photo');image.src=photo;image.alt='';image.width=130;image.height=100;
    const info=element('div','cart-copy');info.append(element('p','cart-size',size),element('h3','cart-title',name));
    if(item){const description=[item.protein,...item.sauces].filter(Boolean).join(' · ');info.append(element('p','cart-description',description));}
    top.append(image,info);entry.append(top);
    if(item){const details=element('details','cart-recipe');details.append(element('summary','','Bekijk je samenstelling'),summary(item));entry.append(details);}
    const row=element('div','cart-tools'),stepper=element('div','quantity');stepper.setAttribute('role','group');stepper.setAttribute('aria-label','Aantal '+name);
    const minus=action('−','quantity-minus',()=>change(-1,'minus')),plus=action('+','quantity-plus',()=>change(1,'plus'));
    for(const [control,actionName,label] of [[minus,'minus','Eén minder'],[plus,'plus','Eén extra']]){control.dataset.cartKey=key;control.dataset.cartAction=actionName;control.setAttribute('aria-label',label+' '+name);}
    minus.disabled=quantity<=1;plus.disabled=quantity>=99;
    const amount=element('span','quantity-number',String(quantity));amount.setAttribute('aria-label',quantity+(quantity===1?' stuk':' stuks'));
    stepper.append(minus,amount,plus);
    const remove=action('Verwijder','cart-remove',()=>change(-quantity,'remove'));remove.setAttribute('aria-label','Verwijder '+name);
    row.append(stepper,remove);entry.append(row);return entry;
  }
  function showBasket() {
    byId('scene-kicker').textContent='Jouw selectie · '+countLabel();
    byId('scene-description').textContent=itemCount()?'Nog iets erbij? Of klaar om af te rekenen?':'';
    if(!itemCount()) {
      const empty=element('div','empty-order');empty.append(element('p','empty-order-title','Waar heb je zin in?'),element('p','','Kies een XL-special of stel zelf iets lekkers samen.'));
      const link=element('a','cart-explore','Ontdek de XL bowls ↗');link.href='../bowls/index.html';empty.append(link);choices.append(empty);return;
    }
    for(const group of window.fitbiteMenu.groupBowls(basket)) {
      const {key,item,ids}=group,name=window.fitbiteMenu.bowlName(item);
      choices.append(cartEntry({key,name,size:window.fitbiteMenu.bowlSize(item),quantity:ids.length,photo:cartPhoto(item),item,change:(delta,control)=>{
        const current=readBasket(basket),matches=current.filter(saved=>window.fitbiteMenu.bowlKey(saved)===key);
        if(!matches.length)return refreshCartFocus(key,control);
        let changed=current,removedDraft=false;
        if(delta>0&&matches.length<99)changed=[...current,{...structuredClone(matches[0]),id:crypto.randomUUID()}];
        else if(delta<0){const removed=new Set((control==='remove'?matches:matches.slice(-1)).map(i=>i.id));changed=current.filter(i=>!removed.has(i.id));removedDraft=removed.has(bowl.id);}
        if(!persistCart(changed,null))return;
        if(removedDraft){delete bowl.id;if(['keuze','kassa'].includes(returnScene))returnScene='toppings';}
        refreshCartFocus(key,control);announce(control==='remove'?name+' verwijderd.':name+': '+changed.filter(i=>window.fitbiteMenu.bowlKey(i)===key).length+' stuks.');
      }}));
    }
    for(const [id,name] of window.fitbiteMenu.items) {
      if(!menuCart[id])continue;
      choices.append(cartEntry({key:id,name,size:'Fitbite',quantity:menuCart[id],photo:cartPhoto(null,id),change:(delta,control)=>{
        const changed=window.fitbiteMenu.readCart();const amount=Math.max(0,Math.min(99,(changed[id]||0)+delta));
        if(control==='remove'||!amount)delete changed[id];else changed[id]=amount;
        if(!persistCart(null,changed))return;
        refreshCartFocus(id,control);announce(control==='remove'?name+' verwijderd.':name+': '+amount+(amount===1?' stuk.':' stuks.'));
      }}));
    }
    choices.append(element('p','cart-demo-note','Bestelproef · prijzen volgen.'));
  }

  function appendMenuItems(container) {
    for (const [id, name] of window.fitbiteMenu.items) {
      if (!menuCart[id]) continue;
      const row = element('div', 'order-item');
      row.append(element('h3', '', menuCart[id] + ' × ' + name));
      container.append(row);
    }
  }

  function showFinish() {
    const crousty=basket.at(-1)?.signature==='xl-crousty';
    const checkoutPhoto=document.querySelector('.checkout-photo');
    checkoutPhoto.src=crousty?'../bowls/media/checkout/counter.jpg':'media/afwerking/gekozen-kassa.webp';
    checkoutPhoto.alt=crousty?'De donkere toonbank bij de Fitbite-kassa.':'Je ingepakte bowl bij de Fitbite-kassa.';
    byId('checkout-crousty').hidden=!crousty;

    const fold = element('details', 'order-fold');
    if (scene === 'keuze') {
      byId('scene-kicker').textContent = 'In je bestelling · ' + window.fitbiteMenu.bowlSize(bowl);
      fold.append(element('summary', '', 'Bekijk je ingrediënten'), summary(bowl));
    } else {
      fold.append(element('summary', '', 'Je bestelling · ' + countLabel()));
      for (const {item,ids} of window.fitbiteMenu.groupBowls(basket)) {
        const entry=element('div','order-item');
        entry.append(element('h3','',ids.length+' × '+window.fitbiteMenu.bowlName(item)+' · '+window.fitbiteMenu.bowlSize(item)),element('p','',[window.fitbiteMenu.bowlBase(item),...item.vegetables,item.protein,...item.sauces,...item.toppings].filter(Boolean).join(' · ')));
        fold.append(entry);
      }
      appendMenuItems(fold);
    }
    choices.append(fold);
    if (scene === 'kassa' && paymentPreview) {
      const note = element('p', 'payment-demo', 'Betaalproef afgerond. Er is niets in rekening gebracht.');
      note.setAttribute('role', 'status');
      choices.append(note);
    }
  }

  function render() {
    document.body.dataset.scene = scene;
    const [kicker, title, description, buttonText] = copy[scene];
    byId('scene-kicker').textContent = previewBowl && scene === previewScene
      ? 'Voorbeeldbowl · ' + bowl.size : kicker;
    byId('scene-title').textContent = title;
    byId('scene-description').textContent = description;
    const resumeDraft = scene === 'mand' && steps.includes(returnScene) && draftStarted && !!bowl.size;
    (next.querySelector('[data-cta-label]') || next).textContent =
      resumeDraft ? 'Verder met mijn bowl' : scene === 'mand' && !itemCount() ? 'Stel een bowl samen' : buttonText;
    back.hidden = scene === 'intro';
    menuLink.hidden = !['keuze', 'kassa', 'mand'].includes(scene);
    menuLink.querySelector('[data-menu-label]').textContent =
      scene === 'kassa' ? 'Terug naar het menu' : 'Verder kijken op het menu';
    const counter = byId('basket-count');
    if (counter) counter.textContent = String(itemCount());
    basketButton.setAttribute('aria-label', 'Bekijk je bestelling, ' + countLabel());
    choices.replaceChildren();
    if(scene==='intro'&&kind==='poke') addChoices('size','Kies je formaat · basis van rijst',true);
    if(scene==='intro'&&kind!=='poke') choices.append(element('p','route-intro',kind==='protein'?'Jij kiest. Wij bereiden.':'Jouw kip. Jouw saus. Jouw Crousty.'));
    if (scene === 'groenten') addChoices('vegetables', 'Groenten');
    if (scene === 'proteine') addChoices('protein', 'Proteïne');
    if (scene === 'sauzen') addChoices('sauces', 'Sauzen');
    if (scene === 'toppings') addChoices('toppings', 'Toppings');
    if (scene === 'keuze' || scene === 'kassa') showFinish();
    if (scene === 'mand') showBasket();
    const position = steps.indexOf(scene);
    const progress = byId('progress');
    progress.hidden = position < 0;
    progress.replaceChildren(...steps.map((step, i) =>
      element('span', 'progress-segment' + (i === position ? ' is-active' : i < position ? ' is-complete' : ''))
    ));
    byId('step-label').textContent = position < 0 ? '' : 'Stap ' + (position + 1) + ' van ' + steps.length;
    syncSelection();
    if (scene === 'kassa' && paymentPreview) {
      next.hidden = true;
      menuLink.focus({preventScroll: true});
    } else next.hidden = false;
    signal();
  }

  let zoomLayer;
  let kitchenAnimations = [];
  let finishLayer;
  let finishAnimations = [];
  const finishDuration = 820;

  function clearFinishMotion() {
    finishAnimations.forEach(animation => animation.cancel());
    finishAnimations = [];
    finishLayer?.remove();
    finishLayer = null;
    clearTimeout(finishUnlockTimer);
    finishLocked = false;
  }

  function finishPhoto(atScene) {
    return atScene === 'keuze' ? document.querySelector('.pass-photo')
      : atScene === 'kassa' ? document.querySelector('.checkout-photo') : null;
  }

  function enterFinish(previousScene, previousPhoto, motionAllowed) {
    const target = scene;
    const incoming = target === 'kassa'
      ? document.querySelector('.checkout-art') : document.querySelector('.pass-photo');
    const arrivalPhoto = finishPhoto(target);
    // Only animate loaded photographs: a slow connection must not create a blank moving layer.
    const canAnimate = motionAllowed && incoming?.animate && arrivalPhoto?.complete && arrivalPhoto.naturalWidth;
    const crossingCounter = ['keuze', 'kassa'].includes(previousScene) && previousScene !== target;
    const duration = canAnimate ? (crossingCounter ? finishDuration : 480) : 350;
    // The same button changes meaning on this screen. A second tap must not also start payment.
    finishUnlockTimer = setTimeout(() => {
      if (scene !== target) return;
      finishLocked = false;
      syncSelection();
    }, duration);
    if (!canAnimate) return;

    const direction = target === 'kassa' ? 1 : -1;
    const timing = {duration, easing: 'cubic-bezier(.22,.61,.36,1)'};
    if (crossingCounter && previousPhoto?.complete && previousPhoto.naturalWidth) {
      const layer = element('div', 'finish-transition');
      layer.setAttribute('aria-hidden', 'true');
      const image = element('img', 'finish-transition-photo');
      image.src = previousPhoto.currentSrc || previousPhoto.src;
      image.alt = '';
      layer.append(image);
      document.querySelector('.station').append(layer);
      finishLayer = layer;
      image.style.transformOrigin = direction > 0 ? '78% 52%' : '55% 46%';
      finishAnimations.push(image.animate([
        {transform: 'none'},
        {transform: `translateX(${-direction * 1.5}%) scale(1.09)`}
      ], timing));
      const exit = layer.animate([
        {opacity: 1}, {opacity: 1, offset: .28}, {opacity: 0, offset: .48}, {opacity: 0}
      ], {duration, easing: 'linear'});
      finishAnimations.push(exit);
      const removeLayer = () => {
        layer.remove();
        if (finishLayer === layer) finishLayer = null;
      };
      exit.onfinish = removeLayer;
      exit.oncancel = removeLayer;
    }

    incoming.style.transformOrigin = target === 'kassa' ? '55% 46%' : '40% 54%';
    finishAnimations.push(incoming.animate([
      {transform: `translateX(${crossingCounter ? direction * 2 : 0}%) scale(1.055)`},
      {transform: 'none'}
    ], timing));
    finishAnimations.push(incoming.animate(crossingCounter ? [
      {opacity: 0}, {opacity: 0, offset: .48}, {opacity: 1, offset: .75}, {opacity: 1}
    ] : [{opacity: .5}, {opacity: 1}], {duration, easing: 'linear'}));
    // The header stays still; the new controls settle after the photographic change.
    for (const part of document.querySelectorAll('.title-area, #choices, .controls')) {
      finishAnimations.push(part.animate([
        {opacity: 0, transform: 'translateY(8px)'},
        {opacity: 1, transform: 'none'}
      ], {duration: 260, delay: crossingCounter ? 390 : 120, fill: 'backwards', easing: 'ease-out'}));
    }
  }

  function enterTrays(from, previousPhoto, target) {
    const frame = target.getBoundingClientRect();
    const layer = document.createElement('div');
    layer.className = 'camera-pass';
    layer.setAttribute('aria-hidden', 'true');
    const wide = previousPhoto.cloneNode(false);
    wide.className = 'camera-wide';
    wide.alt = '';
    Object.assign(wide.style, {
      left: (from.left - frame.left) + 'px', top: (from.top - frame.top) + 'px',
      width: from.width + 'px', height: from.height + 'px'
    });
    layer.append(wide);
    target.append(layer);
    zoomLayer = layer;
    const timing = {duration: 560, easing: 'ease-in-out', fill: 'forwards'};
    const returning = target === toppingScene;
    const endTransform = returning ? 'translateY(-9%) scale(1.08)' : 'scale(1.065)';
    wide.animate([{transform: 'none'}, {transform: endTransform}], timing);
    if (returning) {
      const arrival = target.querySelector('.topping-view');
      kitchenAnimations.push(arrival.animate([
        {transform: 'translateY(3%) rotate(-1deg) scale(1.09)'},
        {transform: 'none'}
      ], timing));
    }
    const motion = layer.animate([
      {opacity:1}, {opacity:1, offset:.32}, {opacity:0}
    ], timing);
    motion.onfinish = () => {
      layer.remove();
      if (zoomLayer === layer) zoomLayer = null;
    };
  }

  function enterKitchen(tray, from, startingBowl) {
    const viewfinder = document.querySelector('.viewfinder');
    const frame = viewfinder.getBoundingClientRect();
    const outgoing = element('div', 'camera-pass');
    outgoing.style.zIndex = '0';
    outgoing.setAttribute('aria-hidden', 'true');
    const photo = element('img', 'camera-wide');
    photo.alt = '';
    photo.src = tray.currentSrc || tray.src;
    Object.assign(photo.style, {
      left: (from.left - frame.left) + 'px', top: (from.top - frame.top) + 'px',
      width: from.width + 'px', height: from.height + 'px'
    });
    outgoing.append(photo);
    viewfinder.append(outgoing);
    zoomLayer = outgoing;

    const timing = {duration: 520, easing: 'cubic-bezier(.2,.65,.28,1)'};
    const exit = outgoing.animate([
      {transform: 'translateX(0)', opacity: 1},
      {transform: 'translateX(-25%)', opacity: 0}
    ], timing);
    exit.onfinish = () => {
      outgoing.remove();
      if (zoomLayer === outgoing) zoomLayer = null;
    };
    kitchenAnimations.push(exit);
    if (kitchenFrame?.animate) {
      kitchenAnimations.push(kitchenFrame.animate([
        {transform: 'translateX(7%) scale(1.13)', composite: 'add'},
        {transform: 'translateX(0) scale(1)', composite: 'add'}
      ], timing));
    }
    const endingBowl = followBowl?.getBoundingClientRect();
    if (startingBowl?.width && startingBowl.height && endingBowl?.width && endingBowl.height) {
      // Translate between the centres so this works at every viewport width.
      const dx = startingBowl.left + startingBowl.width / 2 - endingBowl.left - endingBowl.width / 2;
      const dy = startingBowl.top + startingBowl.height / 2 - endingBowl.top - endingBowl.height / 2;
      const scaleX = startingBowl.width / endingBowl.width;
      const scaleY = startingBowl.height / endingBowl.height;
      kitchenAnimations.push(followBowl.animate([
        {transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`, opacity: 1},
        {transform: 'translate(0, 0) scale(1)', opacity: 0}
      ], timing));
    }
  }

  function goTo(destination) {
    const previousScene = scene;
    const previousFinishPhoto = finishPhoto(previousScene);
    clearFinishMotion();
    kitchenAnimations.forEach(animation => animation.cancel());
    kitchenAnimations = [];
    zoomLayer?.remove();
    zoomLayer = null;
    const room = document.querySelector('.opening-photo');
    const atTrays = scene === 'intro' && destination === 'groenten';
    const atKitchen = ['groenten','intro'].includes(scene) && destination === 'proteine';
    const atSauces = ['proteine','groenten'].includes(scene) && destination === 'sauzen';
    const atToppings = scene === 'sauzen' && destination === 'toppings';
    const camera = atTrays ? room : atKitchen ? (scene==='intro'?room:byId('tray-photo')) : null;
    const motionAllowed = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = camera?.animate && motionAllowed
      ? camera.getBoundingClientRect() : null;
    const startingBowl = from && atKitchen ? followBowl?.getBoundingClientRect() : null;
    const pumpPhoto = sauceScene.querySelector('img');
    const pumpFrame = atToppings && motionAllowed && pumpPhoto.animate
      ? pumpPhoto.getBoundingClientRect() : null;
    scene = destination;
    finishLocked = scene === 'keuze' || scene === 'kassa';
    paymentPreview = false;
    const finishState = ['keuze', 'kassa'].includes(scene) ? {scene, bowlId: bowl.id} : null;
    history.replaceState({...history.state, fitbiteFinish: finishState}, '');
    render();
    choices.scrollTop = 0;
    const heading = byId('scene-title');
    heading.tabIndex = -1;
    heading.focus({preventScroll: true});
    window.scrollTo(0, 0);
    if (finishLocked) enterFinish(previousScene, previousFinishPhoto, motionAllowed);
    if (from && atTrays) enterTrays(from, room, document.querySelector('.viewfinder'));
    if (pumpFrame) enterTrays(pumpFrame, pumpPhoto, toppingScene);
    if (from && atKitchen) enterKitchen(camera, from, startingBowl);
    if (atSauces && motionAllowed && sauceScene?.animate) {
      kitchenAnimations.push(sauceScene.animate([
        {transform: 'translateY(-5%) scale(1.08)', composite: 'add'},
        {transform: 'translateY(0) scale(1)', composite: 'add'}
      ], {duration: 450, easing: 'cubic-bezier(.2,.65,.28,1)'}));
    }
  }

  function newBowl() {
    previewBowl = false;
    bowl = emptyBowl();
    goTo('intro');
  }

  function openBasket() {
    if (scene === 'mand') return;
    returnScene = scene;
    draftStarted=steps.includes(scene);
    goTo('mand');
  }

  next.addEventListener('click', () => {
    if (next.disabled) return;
    if (scene === 'toppings') return confirmBowl();
    if (scene === 'mand' && steps.includes(returnScene) && draftStarted && bowl.size) return goTo(returnScene);
    if (scene === 'keuze' || scene === 'mand') {
      if (!itemCount()) return newBowl();
      checkoutFrom = scene;
      return goTo('kassa');
    }
    if (scene === 'kassa') {
      paymentPreview = true;
      render();
      return;
    }
    goTo(steps[steps.indexOf(scene) + 1]);
  });

  back.addEventListener('click', () => {
    if (scene === 'mand') return goTo(returnScene);
    if (scene === 'keuze') return goTo('toppings');
    if (scene === 'kassa') {
      if (query.get('bestelling') === 'kassa' && !bowl.size) return location.assign(menuLink.href);
      return goTo(checkoutFrom);
    }
    const index = steps.indexOf(scene);
    if (index >= 0) goTo(index === 0 ? 'intro' : steps[index - 1]);
  });
  basketButton.addEventListener('click', openBasket);
  menuLink.addEventListener('click', event => {
    if (finishLocked) event.preventDefault();
  });
  function refreshOrder() {
    basket = readBasket(basket);
    menuCart = window.fitbiteMenu.readCart();
    if ((scene === 'kassa' && !itemCount()) || (scene === 'keuze' && !basket.some(item => item.id === bowl.id))) {
      returnScene = 'intro';
      goTo('mand');
    } else render();
  }
  window.addEventListener('pageshow', event => {
    if (event.persisted) refreshOrder();
  });
  window.addEventListener('storage', event => {
    if (!event.key || event.key === storageKey || event.key === window.fitbiteMenu.storageKey) refreshOrder();
  });
  document.addEventListener('click', event => {
    const hotspot = event.target.closest('[data-pick]');
    if (hotspot && scene === 'groenten') select('vegetables', hotspot.dataset.pick);
  });
  showPumps();
  render();
})();
