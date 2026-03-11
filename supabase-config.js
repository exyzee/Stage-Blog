/* ============================================
   SUPABASE CONFIGURATION
   ============================================ */

const SUPABASE_URL = 'https://gueylcnjxfpalgkbuyyq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZXlsY25qeGZwYWxna2J1eXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDE3NDYsImV4cCI6MjA4ODgxNzc0Nn0.3EQYA8tC_ghGi56_63Q23qWwGVBtuPl00mfPqd7xYzE';

// Initialize Supabase client safely
let supabase = null;
try {
  if (window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase] Client initialized');
  } else {
    console.warn('[Supabase] Library not loaded — CDN may be blocked');
  }
} catch (err) {
  console.error('[Supabase] Failed to initialize:', err);
}

function isSupabaseConfigured() {
  return supabase !== null
    && SUPABASE_URL !== 'YOUR_SUPABASE_URL'
    && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}
