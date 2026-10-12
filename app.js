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
    by: 'You' },
  { id: 2, t: 'Avocado Toast', e: '🥑', cal: 320, pro: 11, fib: 9, min: 5,
    ing: ['bread', 'avocado', 'egg', 'lemon'],
    steps: ['Toast bread.', 'Mash avocado with lemon.', 'Top with egg.'],
    by: 'You' },
  { id: 3, t: 'Greek Salad Wrap', e: '🌯', cal: 410, pro: 18, fib: 8, min: 10,
    ing: ['tortilla', 'feta', 'cucumber', 'tomato', 'chickpeas'],
    steps: ['Chop veg.', 'Toss with feta and chickpeas.', 'Wrap tightly.'],
    by: 'Maya' },
  { id: 4, t: 'Lentil Curry', e: '🍛', cal: 520, pro: 26, fib: 15, min: 30,
    ing: ['lentils', 'spinach', 'coconut milk', 'rice', 'onion'],
    steps: ['Sauté onion.', 'Simmer lentils 20 min.', 'Stir in spinach.'],
    by: 'Chef Rosa' },
  { id: 5, t: 'Chicken Rice Bowl', e: '🍗', cal: 560, pro: 42, fib: 5, min: 25,
    ing: ['chicken', 'rice', 'spinach', 'onion', 'lemon'],
    steps: ['Sear chicken.', 'Cook rice.', 'Assemble with greens.'],
    by: 'Chef Rosa' }
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

/* ---- Helpers -------------------------------------------------------- */

const $ = id => document.getElementById(id);
const byId = i => cards.find(c => c.id == i);
const escAttr = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

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
          <div class="ttl">${c.t}</div>
          <div class="meta">${c.min} min · by ${c.by}</div>
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
          <div>${id ? byId(id).e + ' ' + byId(id).t : 'Empty slot'}</div>
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

function closeM() { $('modal').classList.remove('on'); }

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
    ${pantryAll.map(p => `<span class="chip ${pantry.includes(p) ? 'on' : ''}" onclick="tp('${p}')">${p}</span>`).join('')}
    <button class="btn" onclick="closeM()">Done</button>`;
  $('modal').classList.add('on');
}

function tp(p) {
  pantry = pantry.includes(p) ? pantry.filter(x => x != p) : [...pantry, p];
  openPantry();
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
            <h3>${c.t}</h3>
            <div class="meta">${c.min} min · by ${c.by}</div>
            <div class="mt-8">${stamps(c)}</div>
            <div class="clip">▶ 20-sec how-to clip</div>
            <div class="flip-hint">Tap card to flip</div>
          </div>
          <div class="face back">
            <h3>Ingredients</h3>
            <ul>${c.ing.map(i => `<li>${i}</li>`).join('')}</ul>
            <h3 class="small mt-8">Steps</h3>
            <ol>${c.steps.map(i => `<li>${i}</li>`).join('')}</ol>
          </div>
        </div>
      </div>
    </div>
    <button class="btn" onclick="plan[day][plan[day].indexOf(null)>-1?plan[day].indexOf(null):0]=${c.id};closeM();rToday();toast('Added to today');tab('today')">Add to today</button>
    <button class="btn o" onclick="toast('Remixed into your deck')">Remix this card</button>
    <button class="btn o" onclick="toast('Share link copied')">Share with friends</button>`;
  $('modal').classList.add('on');
}

/* ---- Create --------------------------------------------------------- */

function rCreate() {
  const ntEl = $('nt');       const savedTitle = ntEl ? ntEl.value : '';
  const iiEl = $('ingInput'); const savedIng   = iiEl ? iiEl.value : '';

  const s = draft.reduce(
    (a, i) => [a[0] + IG[i][0], a[1] + IG[i][1], a[2] + IG[i][2]],
    [0, 0, 0]
  );

  $('create').innerHTML = `
    <h1>Write a card</h1>
    <div class="sub">Name it, add what goes in, add the steps. Nutrition adds up automatically.</div>

    <input id="nt" placeholder="Card title (e.g. Sunday Egg Fried Rice)">

    <h2>Ingredients</h2>
    ${Object.keys(IG).map(i => `<span class="chip ${draft.includes(i) ? 'on' : ''}" onclick="td('${i}')">${i}</span>`).join('')}
    <div class="ing-add">
      <input id="ingInput" placeholder="Add your own" onkeydown="if(event.key==='Enter'){event.preventDefault();addIngredient()}">
      <button onclick="addIngredient()" aria-label="Add ingredient">＋</button>
    </div>

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
  if ($('ingInput')) $('ingInput').value = savedIng;
}

function addIngredient() {
  const el = $('ingInput');
  const name = el.value.trim().toLowerCase();
  if (!name) return;
  if (!IG[name]) IG[name] = [0, 0, 0];
  if (!draft.includes(name)) draft.push(name);
  el.value = '';
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
  const ntEl = $('nt');       const savedTitle = ntEl ? ntEl.value : '';
  const iiEl = $('ingInput'); const savedIng   = iiEl ? iiEl.value : '';
  draft = draft.includes(i) ? draft.filter(x => x != i) : [...draft, i];
  rCreate();
  if ($('nt')) $('nt').value = savedTitle;
  if ($('ingInput')) $('ingInput').value = savedIng;
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
    by: 'You'
  });
  draft = [];
  draftSteps = [''];
  toast('Card saved');
  rCreate();
  tab('deck');
}

/* ---- Deck ----------------------------------------------------------- */

function rDeck() {
  $('deck').innerHTML = `
    <h1>My deck</h1>
    <div class="sub">${cards.length} cards · tap to flip, remix, share</div>
    <h2>Shared with you</h2>
    <div class="friend"><div class="av">M</div>Maya added Greek Salad Wrap</div>
    <div class="friend"><div class="av">R</div>Chef Rosa dropped 2 cards</div>
    <h2>All cards</h2>
    <div class="hand">${cards.map(c => mini(c)).join('')}</div>`;
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