(() => {
  'use strict';

  const storageKey = 'fitbite-obsidian-cart';
  const collections = [
    {
      name: 'Jouw Crousty.',
      items: [
        ['pops', 'Crousty Pops', 'crousty-pops.webp', 12.99, 'NEW'],
        ['bbq', 'Crousty BBQ', 'crousty-bbq.webp', 12.99, 'NEW'],
        ['loubs', 'Crousty Loubs', 'crousty-loubs.webp', 12.99, 'NEW'],
        ['kc', 'Korean Crousty Chicken', 'korean-crousty.webp', 15.99, 'NEW']
      ]
    },
    {
      name: 'Jouw bowl.',
      items: [
        ['kb', 'Korean Chicken Bowl', 'korean-bowl'],
        ['salmon', 'Fresh Salmon Bowl', 'fresh-salmon'],
        ['texas', 'Texas Strips Bowl', 'texas-bowl']
      ]
    },
    {
      name: 'Jouw Korean chicken.',
      items: [
        ['spicy', 'Korean Chicken Spicy', 'korean.png'],
        ['sweet', 'Korean Chicken Sweet', 'korean.png']
      ]
    },
    {
      name: 'Jouw frisse finish.',
      items: [
        ['tropical', 'Tropical', 'smoothies.webp'],
        ['straw', 'Strawblina', 'smoothies.webp'],
        ['red', 'Red Fruits', 'smoothies.webp'],
        ['surprise', 'Surprise', 'smoothies.webp']
      ]
    }
  ];
  const items = collections.flatMap(collection => collection.items);
  const productIds = new Set(items.map(item => item[0]));

  function readCart() {
    const cart = {};
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return cart;
      for (const [id, quantity] of Object.entries(saved)) {
        if (productIds.has(id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 99) {
          cart[id] = quantity;
        }
      }
    } catch { /* An unavailable or old basket starts empty. */ }
    return cart;
  }

  // Recipes from the existing Fitbite food brief. Prices remain unconfirmed.
  const signatureBowls = [
    {id:'salmon', name:'Fresh Salmon', file:'salmon', tagline:'Fris, zacht en vol kleur.', protein:'Verse zalm', vegetables:['Avocado','Komkommer','Edamame','Mango','Tomaat'], sauces:['Teriyaki','Sriracha mayo'], toppings:['Sesam','Crispy ui'], base:'Rijst'},
    {id:'sea', name:'XL Royal Sea Bowl', file:'sea', tagline:'Zalm en scampi. Royaal genieten.', protein:'Scampi, verse en gerookte zalm', vegetables:['Avocado','Tomaat','Mango','Komkommer','Edamame'], sauces:['Teriyaki mayo','Sriracha mayo'], toppings:['Crispy ui'], base:'Rijst', xl:true},
    {id:'kb', name:'Korean Chicken', file:'korean', tagline:'Krokante kip met een rijke glaze.', protein:'Korean chicken', vegetables:['Mango','Komkommer','Edamame','Avocado','Rode kool'], sauces:['Teriyaki'], toppings:['Crispy ui'], base:'Rijst'},
    {id:'texas', name:'Texas Strips', file:'texas', tagline:'Een krokante bite, een frisse finish.', protein:'Texas strips', vegetables:['Komkommer','Maïs','Mango','Rode ui','Avocado'], sauces:['Teriyaki','Sriracha mayo'], toppings:['Crispy ui'], base:'Rijst'},
    {id:'smoked', name:'Smoked Salmon', file:'smoked', tagline:'Zacht gerookt. Heerlijk fris.', protein:'Gerookte zalm', vegetables:['Avocado','Komkommer','Rode ui','Edamame','Tomaat'], sauces:['Teriyaki','Sriracha mayo'], toppings:['Crispy ui','Sesam'], base:'Rijst'},
    {id:'grilled', name:'Grilled Salmon', file:'grilled', tagline:'Gegrilde zalm, kleurrijk geserveerd.', protein:'Gegrilde zalm', vegetables:['Komkommer','Avocado','Maïs','Edamame'], sauces:['Teriyaki mayo','Sriracha mayo'], toppings:['Sesam'], base:'Rijst'},
    {id:'protein', name:'Protein Bowl', file:'protein', tagline:'Kip als basis. Vol smaak.', protein:'Kip', vegetables:['Tomaat','Komkommer','Maïs','Edamame','Mango'], sauces:['Mayonaise','Teriyaki'], toppings:['Crispy ui'], base:'Kip'},
    {id:'royal', name:'XL Royal Chicken Madness', file:'royal', tagline:'Jouw kipfavorieten, samen in één bowl.', protein:'Korean chicken, tenders, nuggets en Texas strips', vegetables:['Avocado','Tomaat','Edamame','Mango'], sauces:['Teriyaki','Sriracha mayo'], toppings:['Crispy ui'], base:'Rijst', xl:true}
  ];
  signatureBowls.push(
    {id:'xl-crousty',name:'XL Crousty Super Bowl',file:'xl-crousty-rect',imageType:'png',tagline:'Drie kipfavorieten. Extra royaal.',protein:'Crispy tenders, Korean chicken en nuggets',vegetables:[],sauces:['Speciale Crousty-saus','Teriyaki mayo','Sriracha mayo'],toppings:['Crispy ui'],base:'Rijst',xl:true},
    {id:'xl-side',name:'XL Sidebowl',file:'xl-side',tagline:'Vier porties. Helemaal jouw keuze.',protein:'Vier porties naar keuze',vegetables:[],sauces:['Teriyaki','Sriracha mayo'],toppings:[],base:'Zonder rijst',xl:true,custom:true}
  );
  const xlBowls = ['royal','sea','xl-crousty','xl-side'].map(id=>signatureBowls.find(p=>p.id===id));
  const sideProteins = ['Crispy chicken bites original','Spicy bites','Nuggets','Korean chicken','Crispy tenders'];
  const sideSauces = ['Teriyaki','Sriracha mayo'];
  const customNames = {poke:'Eigen pokébowl',crousty:'Eigen Crousty',protein:'Eigen proteïnebowl'};
  const allOptions = {
    vegetables:['Mango','Avocado','Komkommer','Edamame','Maïs','Rode ui','Tomaat'],
    protein:['Kip','Verse zalm','Gerookte zalm','Gegrilde zalm','Scampi','Korean chicken','Spicy tenders','Texas strips','Nuggets','Crispy tenders'],
    sauces:['Teriyaki','Teriyaki mayo','Sriracha mayo','Zoete sriracha','Truffelmayonaise','Huisgemaakte Dyna-saus','BBQ-saus'],
    toppings:['Sesam','Krokante uitjes','Crispy ui']
  };
  const signature = item => signatureBowls.find(product => product.id === item?.signature);
  const bowlName = item => signature(item)?.name || customNames[item?.kind] || 'Eigen bowl';
  const bowlBase = item => signature(item)?.base || (item?.kind==='protein' ? 'Proteïne · zonder rijst' : item?.kind==='crousty' ? 'Rijst en speciale Crousty-saus' : 'Rijst');
  const bowlSize = item => signature(item)?.xl ? 'XL' : ['crousty','protein'].includes(item?.kind) ? 'Jouw samenstelling' : item.size;
  function normalizeBowl(item,index=0) {
    if (!item || !['Medium','Large'].includes(item.size)) return null;
    const base={id:typeof item.id==='string' && item.id ? item.id : 'oude-bowl-'+index,size:item.size};
    const p=signature(item);
    if(p?.custom) {
      if(!Array.isArray(item.portions) || item.portions.length!==4 || !item.portions.every(v=>sideProteins.includes(v))) return null;
      if(!Array.isArray(item.sauces) || item.sauces.length!==2 || !item.sauces.every(v=>sideSauces.includes(v))) return null;
      return {...base,signature:p.id,portions:[...item.portions],protein:item.portions.join(', '),vegetables:[],sauces:[...item.sauces],toppings:Array.isArray(item.toppings)&&item.toppings.includes('Crispy ui')?['Crispy ui']:[]};
    }
    if(p) return {...base,signature:p.id,vegetables:[...p.vegetables],protein:p.protein,sauces:[...p.sauces],toppings:[...p.toppings]};
    const list=k=>allOptions[k].filter(v=>Array.isArray(item[k])&&item[k].includes(v));
    return {...base,kind:customNames[item.kind]?item.kind:'poke',vegetables:list('vegetables'),protein:allOptions.protein.includes(item.protein)?item.protein:'',sauces:list('sauces'),toppings:list('toppings')};
  }
  // Quantity rows merge only identical recipes; duplicate portion choices stay significant.
  const bowlKey=item=>JSON.stringify([item.signature||'',item.kind||'poke',item.size,
    [...item.vegetables].sort(),item.portions?.length?'':item.protein,[...item.sauces].sort(),[...item.toppings].sort(),[...(item.portions||[])].sort()]);
  function groupBowls(basket) {
    const groups=new Map();
    for(const item of basket){const key=bowlKey(item);if(!groups.has(key))groups.set(key,{key,item,ids:[]});groups.get(key).ids.push(item.id);}
    return [...groups.values()];
  }
  window.fitbiteMenu = {collections, items, readCart, storageKey, signatureBowls, xlBowls, sideProteins, sideSauces, allOptions, signature, bowlName, bowlBase, bowlSize, normalizeBowl, bowlKey, groupBowls};
})();
