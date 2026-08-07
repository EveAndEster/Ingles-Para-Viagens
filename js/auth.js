// ============================================================
// Inglês Para Viagens — Student Login (Supabase Auth)
// ============================================================

// Your project's connection details (safe to be public — see note in chat)
const SUPABASE_URL = 'https://aszvbmebemtspxxmkshc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7JmRfnopS6BxPCbtHNh-CA_vaj0Z7ot';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// A random code unique to *this* browser tab/device, generated fresh each login.
// Saved to localStorage too, so a page refresh doesn't wipe it from memory.
let mySessionToken = localStorage.getItem('ipv_session_token');
let sessionCheckInterval = null;

function generateToken() {
  return crypto.randomUUID();
}

// ---------- Single-session enforcement ----------

// Call this ONLY at the moment of a real login — it invalidates any other device.
async function claimSession(userId) {
  mySessionToken = generateToken();
  localStorage.setItem('ipv_session_token', mySessionToken);
  await supabaseClient
    .from('active_sessions')
    .upsert({ user_id: userId, session_token: mySessionToken, updated_at: new Date().toISOString() });
}

async function verifySession(userId) {
  const { data, error } = await supabaseClient
    .from('active_sessions')
    .select('session_token')
    .eq('user_id', userId)
    .single();

  if (error || !data) return true; // don't force logout on a transient network hiccup

  if (data.session_token !== mySessionToken) {
    // Someone else logged into this account elsewhere — this device loses.
    stopSessionCheck();
    localStorage.removeItem('ipv_session_token');
    await supabaseClient.auth.signOut();
    showGate();
    showSignIn();
    setAuthMessage('Sua conta foi acessada em outro dispositivo. Você foi desconectado(a).', true);
    return false;
  }
  return true;
}

function startSessionCheck(userId) {
  stopSessionCheck();
  sessionCheckInterval = setInterval(() => verifySession(userId), 15000); // every 15s
}

function stopSessionCheck() {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
}

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
    await claimSession(data.user.id);
    startSessionCheck(data.user.id);
    setAuthMessage('Conta criada!', false);
    showApp();
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

  await claimSession(data.user.id);
  startSessionCheck(data.user.id);

  setAuthMessage('', false);
  showApp();
}

async function handleSignOut() {
  stopSessionCheck();
  localStorage.removeItem('ipv_session_token');
  await supabaseClient.auth.signOut();
  showGate();
  showSignIn();
}

// ---------- Check session on page load ----------

async function checkExistingSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    const userId = data.session.user.id;

    if (mySessionToken) {
      // We have a saved token from a previous login on this device — just verify it's still valid.
      const stillValid = await verifySession(userId);
      if (!stillValid) return; // already kicked out and shown the login screen — stop here
    } else {
      // No local token (e.g. cleared storage) but Supabase still thinks we're logged in.
      // Treat it as a fresh login for this device.
      await claimSession(userId);
    }
    startSessionCheck(userId);
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
