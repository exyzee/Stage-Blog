/* ============================================
   SUPABASE CONFIGURATION
   Pure fetch — no CDN dependency
   ============================================ */

const SUPABASE_URL = 'https://gueylcnjxfpalgkbuyyq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZXlsY25qeGZwYWxna2J1eXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDE3NDYsImV4cCI6MjA4ODgxNzc0Nn0.3EQYA8tC_ghGi56_63Q23qWwGVBtuPl00mfPqd7xYzE';

/**
 * Fetch published posts directly from the Supabase REST API.
 * Works everywhere — no third-party library needed.
 */
async function fetchPublishedPosts() {
  const url = SUPABASE_URL + '/rest/v1/posts?status=eq.published&order=date.desc&select=*';
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    }
  });
  if (!res.ok) throw new Error('Supabase HTTP ' + res.status);
  return res.json();
}
