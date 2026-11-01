import { WAITLIST_CONFIG } from './config.js';
import { validateEmail, looksLikeBot, pickBackend } from './validate.js';

const form = document.getElementById('waitlist');
const input = document.getElementById('email');
const trap = document.getElementById('website');
const button = form.querySelector('button');
const status = document.getElementById('status');
const backend = pickBackend(WAITLIST_CONFIG, location.hostname);

for (const el of document.querySelectorAll('[data-brand]')) el.textContent = WAITLIST_CONFIG.appName;

if (backend === 'closed') {
  input.disabled = true;
  button.disabled = true;
  say("Signups aren't open on this page yet.", 'muted');
}

function say(text, tone) {
  status.textContent = text;
  status.dataset.tone = tone || '';
}

async function save(email) {
  if (backend === 'supabase') {
    const url = `${WAITLIST_CONFIG.supabaseUrl.replace(/\/$/, '')}/rest/v1/waitlist_signups`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: WAITLIST_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${WAITLIST_CONFIG.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        // The table drops repeat emails in a trigger and still answers 201, so
        // nobody can learn whether an address was already on the list.
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email, source: 'waitlist-page' }),
    });
    // 409 only happens if two identical signups race each other: still a yes.
    return res.ok || res.status === 409;
  }
  if (backend === 'local') {
    const res = await fetch(WAITLIST_CONFIG.localEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.ok;
  }
  return false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (backend === 'closed') return;
  if (looksLikeBot(trap.value)) { say("You're on the list.", 'ok'); form.reset(); return; }

  const v = validateEmail(input.value);
  if (!v.ok) { say(v.error, 'error'); input.focus(); return; }

  button.disabled = true;
  say('Saving…', 'muted');
  try {
    if (await save(v.email)) {
      say("You're on the list. We'll email you when the beta opens to you.", 'ok');
      form.reset();
    } else {
      say("Couldn't save that. Try again in a minute.", 'error');
    }
  } catch {
    say("Couldn't reach the server. Check your connection and try again.", 'error');
  } finally {
    button.disabled = false;
  }
});
