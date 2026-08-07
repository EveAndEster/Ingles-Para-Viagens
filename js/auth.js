// ============================================================
// Inglês Para Viagens — Student Login (Supabase Auth)
// ============================================================

// Your project's connection details (safe to be public — see note in chat)
const SUPABASE_URL = 'https://aszvbmebemtspxxmkshc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7JmRfnopS6BxPCbtHNh-CA_vaj0Z7ot';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ---------- UI helpers ----------

function showSignUp() {
  document.getElementById('auth-signin').style.display = 'none';
  document.getElementById('auth-signup').style.display = 'block';
  setAuthMessage('');
}

function showSignIn() {
  document.getElementById('auth-signup').style.display = 'none';
  document.getElementById('auth-signin').style.display = 'block';
  setAuthMessage('');
}

function setAuthMessage(text, isError) {
  const el = document.getElementById('auth-message');
  el.textContent = text;
  el.style.color = isError ? '#9a4a45' : '#5d739a';
}

function showApp() {
  document.getElementById('auth-gate').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';
}

function showGate() {
  document.getElementById('app-content').style.display = 'none';
  document.getElementById('auth-gate').style.display = 'flex';
}

// ---------- Auth actions ----------

async function handleSignUp() {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!email || !password) {
    setAuthMessage('Preencha e-mail e senha.', true);
    return;
  }
  if (password.length < 6) {
    setAuthMessage('A senha precisa ter pelo menos 6 caracteres.', true);
    return;
  }

  setAuthMessage('Criando conta...', false);
  const { data, error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    setAuthMessage(error.message, true);
    return;
  }

  // If email confirmation is required, Supabase won't return a session yet.
  if (data.session) {
    setAuthMessage('Conta criada!', false);
  } else {
    setAuthMessage('Conta criada! Verifique seu e-mail para confirmar antes de entrar.', false);
  }
}

async function handleSignIn() {
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;

  if (!email || !password) {
    setAuthMessage('Preencha e-mail e senha.', true);
    return;
  }

  setAuthMessage('Entrando...', false);
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    setAuthMessage('E-mail ou senha incorretos.', true);
    return;
  }

  setAuthMessage('', false);
  showApp();
}

async function handleSignOut() {
  await supabaseClient.auth.signOut();
  showGate();
  showSignIn();
}

// ---------- Check session on page load ----------

async function checkExistingSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    showApp();
  } else {
    showGate();
  }
}

checkExistingSession();

// Keep UI in sync if the session changes in another tab
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    showApp();
  } else {
    showGate();
  }
});
