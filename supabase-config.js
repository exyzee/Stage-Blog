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
const SUPABASE_ANON_KEY = 'sb_publishable_hLMh2BKVgIc8P2N5P4MZsQ_5t6b7LZv';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured
function isSupabaseConfigured() {
  return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}
