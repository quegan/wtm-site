// Waitlist email validation. Plain ES module so the static page can import it
// with no build step, and jest can test it (web/waitlist/__tests__).
// The same rules are enforced again by the database check constraint in
// supabase/migrations/029_waitlist_signups.sql, so a bypassed page cannot
// store garbage.

export const MAX_EMAIL_LENGTH = 254;

/** Trim and lowercase. Emails are stored this way so one person = one row. */
export function normalizeEmail(raw) {
  return String(raw == null ? '' : raw).trim().toLowerCase();
}

// One @, no whitespace, a dot in the domain, a 2+ letter TLD. Deliberately
// not RFC 5322: the goal is catching typos, not rejecting real addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/;

/**
 * @returns {{ ok: true, email: string } | { ok: false, error: string }}
 */
export function validateEmail(raw) {
  const email = normalizeEmail(raw);
  if (!email) return { ok: false, error: 'Enter your email.' };
  if (email.length > MAX_EMAIL_LENGTH) return { ok: false, error: 'That email is too long.' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "That doesn't look like an email." };
  const [local, domain] = email.split('@');
  if (local.length > 64) return { ok: false, error: "That doesn't look like an email." };
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return { ok: false, error: "That doesn't look like an email." };
  }
  return { ok: true, email };
}

/** Hidden "website" field: people never see it, form-filling bots do. */
export function looksLikeBot(honeypotValue) {
  return String(honeypotValue == null ? '' : honeypotValue).trim().length > 0;
}

/**
 * Which store the page will write to.
 *  - 'supabase' when a project URL + anon key are configured
 *  - 'local'    when served by serve-local.mjs on this machine
 *  - 'closed'   otherwise: the page says signups are not open, and stores nothing
 */
export function pickBackend(config, hostname) {
  const c = config || {};
  if (c.supabaseUrl && c.supabaseAnonKey) return 'supabase';
  if (c.localEndpoint && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(String(hostname || ''))) return 'local';
  return 'closed';
}
