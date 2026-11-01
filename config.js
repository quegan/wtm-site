// Waitlist page settings. Safe to commit: the Supabase anon key is a public
// client key by design (the app ships it too) and the waitlist table only
// accepts inserts (migration 029). NEVER put the service-role key here.
//
// Leave supabaseUrl/supabaseAnonKey empty and the page runs in:
//  - local mode when opened through `node serve-local.mjs` (writes data/signups.csv)
//  - closed mode anywhere else (says signups aren't open; stores nothing)
export const WAITLIST_CONFIG = {
  // Keep in sync with appName in ../../brand.config.json (a jest test checks).
  appName: "What's The Move",
  supabaseUrl: '',
  supabaseAnonKey: '',
  localEndpoint: '/api/waitlist',
};
