/* ==========================================================================
   index.html
   Renders the Today, Deal, Create, and Deck views.
   Depends on: base.css, app.css
   ========================================================================== */

/* ---- Goals and starting data ---------------------------------------- */

const GOAL = { cal: 2000, pro: 100, fib: 30 };

let cards = [
  { id: 1, t: 'Spicy Ramen Bowl', e: '🍜', cal: 480, pro: 24, fib: 6, min: 20,
    ing: ['ramen noodles', 'soft egg', 'bok choy', 'chili oil', 'broth'],
    steps: ['Simmer broth with chili oil.', 'Cook noodles 3 min.', 'Top with egg and bok choy.'],
    cat: 'dinner' },
  { id: 2, t: 'Avocado Toast', e: '🥑', cal: 320, pro: 11, fib: 9, min: 5,
    ing: ['bread', 'avocado', 'egg', 'lemon'],
    steps: ['Toast bread.', 'Mash avocado with lemon.', 'Top with egg.'],
    cat: 'breakfast' },
  { id: 3, t: 'Greek Salad Wrap', e: '🌯', cal: 410, pro: 18, fib: 8, min: 10,
    ing: ['tortilla', 'feta', 'cucumber', 'tomato', 'chickpeas'],
    steps: ['Chop veg.', 'Toss with feta and chickpeas.', 'Wrap tightly.'],
    cat: 'lunch' },
  { id: 4, t: 'Lentil Curry', e: '🍛', cal: 520, pro: 26, fib: 15, min: 30,
    ing: ['lentils', 'spinach', 'coconut milk', 'rice', 'onion'],
    steps: ['Sauté onion.', 'Simmer lentils 20 min.', 'Stir in spinach.'],
    cat: 'dinner' },
  { id: 5, t: 'Chicken Rice Bowl', e: '🍗', cal: 560, pro: 42, fib: 5, min: 25,
    ing: ['chicken', 'rice', 'spinach', 'onion', 'lemon'],
    steps: ['Sear chicken.', 'Cook rice.', 'Assemble with greens.'],
    cat: 'dinner' }
];

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
let day = 2;

let plan = days.map(() => [null, null, null]);
plan[2] = [2, 3, null];

const slots = ['BREAKFAST', 'LUNCH', 'DINNER'];

const pantryAll = ['egg', 'bread', 'avocado', 'rice', 'spinach', 'chicken',
                   'lentils', 'onion', 'lemon', 'tomato', 'chickpeas', 'tortilla'];
let pantry = ['egg', 'bread', 'avocado', 'rice', 'spinach', 'onion', 'lemon'];

const IG = {
  egg: [70, 6, 0],
  bread: [80, 3, 2],
  avocado: [160, 2, 7],
  rice: [200, 4, 1],
  spinach: [10, 1, 1],
  chicken: [250, 38, 0],
  lentils: [230, 18, 16],
  onion: [40, 1, 2],
  'olive oil': [120, 0, 0],
  tomato: [20, 1, 1]
};

let draft = [];
let draftSteps = [''];
let draftCat = 'dinner';

const CATS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snack', 'Snacks']];
let addingPantry = false;   // pantry "add an ingredient" form open?
let addingIng = false;      // create "add an ingredient" form open?
let deckCat = 'all';        // active divider tab in the recipe box
let deckQ = '';             // recipe box search text

/* ---- Helpers -------------------------------------------------------- */

const $ = id => document.getElementById(id);
const byId = i => cards.find(c => c.id == i);
const escAttr = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const cleanName = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 30);

function toast(m) {
  const t = $('toast');
  t.textContent = m;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 1600);
}

function stamps(c) {
  return `<span class="stamp">${c.cal} CAL</span>`
       + `<span class="stamp">${c.pro}g PROTEIN</span>`
       + `<span class="stamp">${c.fib}g FIBER</span>`;
}

function mini(c, extra = '') {
  return `
    <div class="card" onclick="open_(${c.id})">
      ${extra}
      <div class="card-row">
        <span class="em">${c.e}</span>
        <div>
          <div class="ttl">${escAttr(c.t)}</div>
          <div class="meta">${c.min} min</div>
        </div>
      </div>
      ${stamps(c)}
    </div>`;
}

function bar(l, v, g, u) {
  const p = Math.min(100, v / g * 100);
  return `
    <div class="bar">
      <div class="t"><span>${l}</span><span>${v} / ${g}${u}</span></div>
      <div class="track"><div class="fill" style="width:${p}%"></div></div>
    </div>`;
}

function tot() {
  let s = { cal: 0, pro: 0, fib: 0 };
  plan[day].forEach(i => {
    if (i) {
      const c = byId(i);
      s.cal += c.cal;
      s.pro += c.pro;
      s.fib += c.fib;
    }
  });
  return s;
}

/* ---- Today ---------------------------------------------------------- */

function rToday() {
  const s = tot();
  $('today').innerHTML = `
    <h1>Your hand today</h1>
    <div class="sub">Plan meals with cards. Hit your goals without counting.</div>
    <div class="days">
      ${days.map((d, i) => `<div class="${i == day ? 'on' : ''}" onclick="day=${i};rToday()">${d}</div>`).join('')}
    </div>
    ${bar('Calories', s.cal, GOAL.cal, '')}
    ${bar('Protein', s.pro, GOAL.pro, 'g')}
    ${bar('Fiber', s.fib, GOAL.fib, 'g')}
    <h2>Meals</h2>
    ${plan[day].map((id, i) => `
      <div class="slot">
        <div>
          <small>${slots[i]}</small>
          <div>${id ? byId(id).e + ' ' + escAttr(byId(id).t) : 'Empty slot'}</div>
        </div>
        <button class="chip on tight" onclick="pick(${i})">${id ? 'Swap' : '+ Add'}</button>
      </div>`).join('')}
    <button class="btn" onclick="tab('deal')">Deal me a hand from my pantry</button>`;
}

function pick(i) {
  $('modal').innerHTML = `
    <button class="x inset" onclick="closeM()" aria-label="Close">✕</button>
    <h1>Choose a card</h1>
    <div class="sub">for ${slots[i].toLowerCase()}</div>
    <div class="hand mt-12">
      ${cards.map(c => `
        <div onclick="plan[day][${i}]=${c.id};closeM();rToday()">
          ${mini(c).replace(/onclick="open_\(\d+\)"/, '')}
        </div>`).join('')}
    </div>`;
  $('modal').classList.add('on');
}

function closeM() { $('modal').classList.remove('on'); addingPantry = false; }

/* ---- Deal ----------------------------------------------------------- */

function score(c) {
  const h = c.ing.filter(x => pantry.some(p => x.includes(p) || p.includes(x))).length;
  return Math.round(h / c.ing.length * 100);
}

function rDeal() {
  const h = [...cards].sort((a, b) => score(b) - score(a));
  $('deal').innerHTML = `
    <h1>Deal a hand</h1>
    <div class="sub">Match cards to what's already in your kitchen.</div>
    <button class="btn o pantry-btn" onclick="openPantry()">
      <span>Your pantry</span>
      <span class="pantry-count">${pantry.length} ${pantry.length === 1 ? 'item' : 'items'}</span>
    </button>
    <h2>Your hand</h2>
    <div class="hand scrollable">
      ${h.map(c => mini(c, `<span class="match">${score(c)}% match</span>`)).join('')}
    </div>`;
}

function openPantry() {
  $('modal').innerHTML = `
    <button class="x inset" onclick="closeM()" aria-label="Close">✕</button>
    <h1>Your pantry</h1>
    <div class="sub">Tap what you have. Cards re-rank as you go.</div>
    <h2>In your kitchen</h2>
    <div class="pantry-grid">
      ${pantryAll.map(p => `<span class="chip ${pantry.includes(p) ? 'on' : ''}" data-p="${escAttr(p)}" onclick="tp(this.dataset.p)">${escAttr(p)}</span>`).join('')}
    </div>
    ${addingPantry ? `
      <div class="add-form">
        <input id="pantryInput" maxlength="30" placeholder="Ingredient name (e.g. cumin)"
               onkeydown="if(event.key==='Enter'){event.preventDefault();addPantryItem()}">
        <div class="add-form-actions">
          <button class="btn o" onclick="togglePantryAdd(false)">Cancel</button>
          <button class="btn" onclick="addPantryItem()">Add</button>
        </div>
      </div>` : `
      <button class="add-ing-btn" onclick="togglePantryAdd(true)"><span>＋</span> Add an ingredient</button>`}
    <button class="btn" onclick="closeM()">Done</button>`;
  $('modal').classList.add('on');
  if (addingPantry && $('pantryInput')) $('pantryInput').focus();
}

function tp(p) {
  pantry = pantry.includes(p) ? pantry.filter(x => x != p) : [...pantry, p];
  openPantry();
  rDeal();
}

function togglePantryAdd(open) {
  addingPantry = open;
  openPantry();
}

function addPantryItem() {
  const name = cleanName($('pantryInput').value);
  if (!name) return toast('Type an ingredient first');
  if (!pantryAll.includes(name)) pantryAll.push(name);
  if (pantry.includes(name)) {
    toast('Already in your pantry');
  } else {
    pantry.push(name);
    toast('Added ' + name);
  }
  openPantry();   // form stays open so you can keep adding
  rDeal();
}

/* ---- Card view ------------------------------------------------------ */

function open_(id) {
  const c = byId(id);
  $('modal').innerHTML = `
    <div class="relative">
      <button class="x" onclick="closeM()" aria-label="Close card">✕</button>
      <div class="flip" id="fl" onclick="this.classList.toggle('f')">
        <div class="in">
          <div class="face">
            <div class="em">${c.e}</div>
            <h3>${escAttr(c.t)}</h3>
            <div class="meta">${c.min} min</div>
            <div class="mt-8">${stamps(c)}</div>
            <div class="clip">▶ 20-sec how-to clip</div>
            <div class="flip-hint">Tap card to flip</div>
          </div>
          <div class="face back">
            <h3>Ingredients</h3>
            <ul>${c.ing.map(i => `<li>${escAttr(i)}</li>`).join('')}</ul>
            <h3 class="small mt-8">Steps</h3>
            <ol>${c.steps.map(i => `<li>${escAttr(i)}</li>`).join('')}</ol>
          </div>
        </div>
      </div>
    </div>
    <button class="btn" onclick="plan[day][plan[day].indexOf(null)>-1?plan[day].indexOf(null):0]=${c.id};closeM();rToday();toast('Added to today');tab('today')">Add to today</button>
    <button class="btn o" onclick="toast('Remixed into your deck')">Remix this card</button>`;
  $('modal').classList.add('on');
}

/* ---- Create --------------------------------------------------------- */

function rCreate() {
  const ntEl = $('nt');       const savedTitle = ntEl ? ntEl.value : '';
  const inEl = $('ingName');  const savedName  = inEl ? inEl.value : '';
  const nutr = ['ingCal', 'ingPro', 'ingFib'].map(id => $(id) ? $(id).value : '');

  const s = draft.reduce(
    (a, i) => [a[0] + IG[i][0], a[1] + IG[i][1], a[2] + IG[i][2]],
    [0, 0, 0]
  );

  $('create').innerHTML = `
    <h1>Write a card</h1>
    <div class="sub">Name it, add what goes in, add the steps. Nutrition adds up automatically.</div>

    <input id="nt" maxlength="40" placeholder="Card title (e.g. Sunday Egg Fried Rice)">

    <h2>Meal type</h2>
    <div class="chip-row">
      ${CATS.map(([k, label]) => `<span class="chip ${draftCat === k ? 'on' : ''}" onclick="setCat('${k}')">${label}</span>`).join('')}
    </div>

    <h2>Ingredients</h2>
    <div class="chip-row">
      ${Object.keys(IG).map(i => `<span class="chip ${draft.includes(i) ? 'on' : ''}" data-i="${escAttr(i)}" onclick="td(this.dataset.i)">${escAttr(i)}</span>`).join('')}
    </div>
    ${addingIng ? `
      <div class="add-form">
        <input id="ingName" maxlength="30" placeholder="Ingredient name (e.g. cumin)"
               onkeydown="if(event.key==='Enter'){event.preventDefault();addIngredient()}">
        <div class="sub" style="margin:0 0 6px">Nutrition per serving (optional)</div>
        <div class="macro-row">
          <input id="ingCal" type="number" min="0" inputmode="numeric" placeholder="Cal" onkeydown="if(event.key==='Enter'){event.preventDefault();addIngredient()}">
          <input id="ingPro" type="number" min="0" inputmode="numeric" placeholder="Protein g" onkeydown="if(event.key==='Enter'){event.preventDefault();addIngredient()}">
          <input id="ingFib" type="number" min="0" inputmode="numeric" placeholder="Fiber g" onkeydown="if(event.key==='Enter'){event.preventDefault();addIngredient()}">
        </div>
        <div class="add-form-actions">
          <button class="btn o" onclick="toggleIngAdd(false)">Cancel</button>
          <button class="btn" onclick="addIngredient()">Add</button>
        </div>
      </div>` : `
      <button class="add-ing-btn" onclick="toggleIngAdd(true)"><span>＋</span> Add your own ingredient</button>`}

    <h2>Steps</h2>
    <div class="steps">
      ${draftSteps.map((st, i) => `
        <div class="step-row">
          <span class="step-num">${i + 1}</span>
          <input value="${escAttr(st)}" oninput="draftSteps[${i}]=this.value" placeholder="What happens next?">
          ${draftSteps.length > 1 ? `<button class="step-x" onclick="removeStep(${i})" aria-label="Remove step">✕</button>` : ''}
        </div>
      `).join('')}
    </div>
    <button class="btn o" onclick="addStep()">+ Add step</button>

    <h2>Nutrition stamp</h2>
    <div class="card card-static">
      <div class="ttl">Per serving</div>
      ${stamps({ cal: s[0], pro: s[1], fib: s[2] })}
    </div>

    <div class="clip">＋ Attach optional 20-sec clip</div>
    <button class="btn" onclick="saveCard()">Save to my deck</button>`;

  if ($('nt')) $('nt').value = savedTitle;
  if ($('ingName')) {
    $('ingName').value = savedName;
    ['ingCal', 'ingPro', 'ingFib'].forEach((id, k) => { $(id).value = nutr[k]; });
  }
}

function toggleIngAdd(open) {
  addingIng = open;
  rCreate();
  if (open && $('ingName')) $('ingName').focus();
}

function addIngredient() {
  const name = cleanName($('ingName').value);
  if (!name) return toast('Type an ingredient first');
  const n = ['ingCal', 'ingPro', 'ingFib'].map(id => Math.max(0, Math.round(Number($(id).value) || 0)));
  // a brand-new ingredient gets the nutrition you typed (0 if left blank);
  // an existing one keeps its numbers
  if (!IG[name]) IG[name] = n;
  if (!draft.includes(name)) draft.push(name);
  ['ingName', 'ingCal', 'ingPro', 'ingFib'].forEach(id => { $(id).value = ''; });
  rCreate();
  $('ingName').focus();   // form stays open so you can keep adding
}

function setCat(k) {
  draftCat = k;
  rCreate();
}

function addStep() {
  draftSteps.push('');
  rCreate();
}

function removeStep(i) {
  draftSteps.splice(i, 1);
  if (!draftSteps.length) draftSteps = [''];
  rCreate();
}

function td(i) {
  draft = draft.includes(i) ? draft.filter(x => x != i) : [...draft, i];
  rCreate();
}

function saveCard() {
  const t = $('nt').value.trim() || 'Untitled card';
  if (!draft.length) return toast('Add an ingredient first');
  const s = draft.reduce(
    (a, i) => [a[0] + IG[i][0], a[1] + IG[i][1], a[2] + IG[i][2]],
    [0, 0, 0]
  );
  const steps = draftSteps.map(x => x.trim()).filter(Boolean);
  cards.push({
    id: Date.now(),
    t, e: '🍽️',
    cal: s[0], pro: s[1], fib: s[2],
    min: 15,
    ing: [...draft],
    steps: steps.length ? steps : ['Add your steps…'],
    cat: draftCat
  });
  draft = [];
  draftSteps = [''];
  draftCat = 'dinner';
  addingIng = false;
  deckCat = 'all';
  toast('Card saved');
  rCreate();
  tab('deck');
}

/* ---- Deck ----------------------------------------------------------- */

/* The deck is a recipe box: divider tabs by meal type, a search slot,
   and index cards stacked so you see each one's top edge. Tap to pull one out. */

function boxCards() {
  const q = deckQ.trim().toLowerCase();
  return cards
    .filter(c => deckCat === 'all' || c.cat === deckCat)
    .filter(c => !q || c.t.toLowerCase().includes(q) || c.ing.some(i => i.includes(q)))
    .sort((a, b) => a.t.localeCompare(b.t));
}

function rBox() {
  const list = boxCards();
  $('boxList').innerHTML = list.length
    ? list.map(c => `
        <div class="idx" role="button" tabindex="0" onclick="open_(${c.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();open_(${c.id})}">
          <span class="idx-em">${c.e}</span>
          <span class="idx-ttl">${escAttr(c.t)}</span>
          <span class="idx-meta">${c.min} min · ${c.cal} cal</span>
        </div>`).join('')
    : `<div class="box-empty">
         <div>${deckQ ? 'Nothing matches that search.' : 'No cards filed here yet.'}</div>
         <button class="btn" onclick="tab('create')">Write a card</button>
       </div>`;
}

function setDeckCat(k) {
  deckCat = k;
  rDeck();
}

function setDeckQ(v) {
  deckQ = v;
  rBox();   // re-render only the cards so the search field keeps focus
}

function rDeck() {
  const count = k => k === 'all' ? cards.length : cards.filter(c => c.cat === k).length;
  const dividers = [['all', 'All'], ...CATS];
  $('deck').innerHTML = `
    <h1>Recipe box</h1>
    <div class="sub">${cards.length} ${cards.length === 1 ? 'card' : 'cards'} filed · tap one to pull it out</div>

    <input id="boxSearch" class="box-search" type="search" placeholder="Search by name or ingredient"
           value="${escAttr(deckQ)}" oninput="setDeckQ(this.value)">

    <div class="dividers">
      ${dividers.map(([k, label]) => `
        <button class="divider ${deckCat === k ? 'on' : ''}" onclick="setDeckCat('${k}')">
          ${label}<small>${count(k)}</small>
        </button>`).join('')}
    </div>
    <div class="box"><div id="boxList" class="box-list"></div></div>`;
  rBox();
}

/* ---- Nav / tabs ----------------------------------------------------- */

const tabs = [
  ['today',  '❧', 'Today'],
  ['deal',   '♠', 'Deal'],
  ['create', '✎', 'Create'],
  ['deck',   '❦', 'Deck']
];

function tab(t) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id == t));
  closeM();
  ({ today: rToday, deal: rDeal, create: () => { if (!$('nt')) rCreate(); }, deck: rDeck })[t]();
  $('nav').innerHTML = tabs.map(x => `
    <div class="${x[0] == t ? 'on' : ''}" onclick="tab('${x[0]}')">
      <b>${x[1]}</b>${x[2]}
    </div>`).join('');
}

tab('today');