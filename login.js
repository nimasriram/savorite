/* ==========================================================================
   Meal Cards — login / sign up
   Depends on: css/base.css, css/login.css
   ========================================================================== */

const APP_NAME = 'Meal Cards';
const $ = id => document.getElementById(id);
let mode = 'login';

document.title = APP_NAME;
$('brand').textContent = '❦  ' + APP_NAME + '  ❦';

/* ---- Storage helpers (localStorage can be unavailable, so guard) ---- */

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

const sha = async s => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
};

/* Swap this one function for a real backend call (Firebase, Supabase, your own API). */
async function authenticate(mode, { name, email, pw }) {
  const users = store.get('mc_users') || {};
  const hash = await sha(pw);

  if (mode === 'signup') {
    if (users[email]) throw new Error('An account with this email already exists. Log in instead.');
    users[email] = { name, hash };
    if (!store.set('mc_users', users)) throw new Error('Could not save your account in this browser.');
    return { name, email };
  }

  const u = users[email];
  if (!u || u.hash !== hash) throw new Error('Email or password is incorrect.');
  return { name: u.name, email };
}

/* ---- Mode switching ------------------------------------------------- */

function setMode(m) {
  mode = m;
  const s = m === 'signup';
  $('title').textContent = s ? 'Start your deck' : 'Welcome back';
  $('lead').textContent = s
    ? 'Create an account to save and share cards.'
    : "Log in to see your deck and today's plan.";
  $('go').textContent = s ? 'Create account' : 'Log in';
  $('swapTxt').textContent = s ? 'Already have an account?' : 'New here?';
  $('swap').textContent = s ? 'Log in' : 'Create an account';
  ['nameWrap', 'confWrap', 'meterWrap'].forEach(i => $(i).classList.toggle('hidden', !s));
  $('loginRow').classList.toggle('hidden', s);
  $('pw').autocomplete = s ? 'new-password' : 'current-password';
  clearErrors();
}

/* ---- Errors --------------------------------------------------------- */

function clearErrors() {
  ['name', 'email', 'pw', 'conf'].forEach(k => {
    $('e-' + k).textContent = '';
    const el = $(k);
    if (el) el.removeAttribute('aria-invalid');
  });
  $('form-err').textContent = '';
}

function bad(k, msg) {
  $('e-' + k).textContent = msg;
  $(k).setAttribute('aria-invalid', 'true');
}

/* ---- Validation ----------------------------------------------------- */

function validate() {
  clearErrors();
  let ok = true, first = null;
  const v = {
    name: $('name').value.trim(),
    email: $('email').value.trim().toLowerCase(),
    pw: $('pw').value,
    conf: $('conf').value
  };
  const fail = (k, m) => { bad(k, m); ok = false; first = first || k; };

  if (mode === 'signup' && !v.name) fail('name', 'Enter your name.');
  if (!v.email) fail('email', 'Enter your email.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) fail('email', 'Enter an email like name@example.com.');
  if (!v.pw) fail('pw', 'Enter your password.');
  else if (mode === 'signup' && v.pw.length < 8) fail('pw', 'Use at least 8 characters.');
  if (mode === 'signup' && v.pw && v.conf !== v.pw) fail('conf', 'Passwords do not match.');

  if (first) $(first).focus();
  return ok ? v : null;
}

/* ---- Submit --------------------------------------------------------- */

$('f').addEventListener('submit', async e => {
  e.preventDefault();
  const v = validate();
  if (!v) return;

  const btn = $('go');
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'One moment...';

  try {
    const user = await authenticate(mode, v);
    store.set('mc_session', { ...user, remember: $('remember').checked });
    showHome(user);
  } catch (err) {
    $('form-err').textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});

/* ---- Buttons -------------------------------------------------------- */

$('swap').onclick = () => setMode(mode === 'login' ? 'signup' : 'login');

$('eye').onclick = () => {
  const show = $('pw').type === 'password';
  $('pw').type = show ? 'text' : 'password';
  $('eye').textContent = show ? 'Hide' : 'Show';
  $('eye').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
};

$('forgot').onclick = () => {
  const em = $('email').value.trim();
  $('form-err').textContent = em
    ? `Password reset needs a server. In the real app, a link would be sent to ${em}.`
    : 'Enter your email first, then select Forgot password.';
};

/* ---- Strength meter ------------------------------------------------- */

$('pw').addEventListener('input', () => {
  if (mode !== 'signup') return;
  const p = $('pw').value;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  $('meter').style.width = (p ? Math.max(1, s) * 25 : 0) + '%';
  $('strength').textContent = !p
    ? 'Use at least 8 characters.'
    : ['', 'Weak', 'Okay', 'Good', 'Strong'][Math.max(1, s)];
});

/* ---- Home / logout -------------------------------------------------- */

function showHome(u) {
  $('auth').classList.add('hidden');
  $('home').classList.remove('hidden');
  $('hi').textContent = `Hi, ${u.name.split(' ')[0]}`;
  $('out').focus();
}

$('out').onclick = () => {
  store.del('mc_session');
  $('f').reset();
  setMode('login');
  $('home').classList.add('hidden');
  $('auth').classList.remove('hidden');
  $('email').focus();
};

/* ---- Restore a remembered session ----------------------------------- */

const s = store.get('mc_session');
if (s && s.remember) showHome(s);