/* ============================================
   SUPABASE CONFIGURATION
   
   Setup Instructions:
   1. Go to https://supabase.com and create a free account
   2. Create a new project
   3. Go to Settings > API and copy your:
      - Project URL
      - anon/public key
   4. Replace the values below
   ============================================ */

const SUPABASE_URL = 'https://gueylcnjxfpalgkbuyyq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZXlsY25qeGZwYWxna2J1eXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDE3NDYsImV4cCI6MjA4ODgxNzc0Nn0.3EQYA8tC_ghGi56_63Q23qWwGVBtuPl00mfPqd7xYzE';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured
function isSupabaseConfigured() {
  return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}
