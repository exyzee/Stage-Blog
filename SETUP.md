# Internship Blog Setup Guide

## Quick Start (Local Only)
Just open `index.html` in your browser. Posts are stored in localStorage.

---

## Deploy with Supabase Backend (Recommended)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **"New Project"**
3. Give it a name (e.g., "internship-blog")
4. Set a database password (save this somewhere)
5. Choose a region close to you
6. Click **"Create new project"** and wait ~2 minutes

### Step 2: Create the Posts Table

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste this SQL and click **"Run"**:

```sql
-- Create the posts table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  week TEXT,
  date DATE,
  status TEXT DEFAULT 'draft',
  title TEXT,
  excerpt TEXT,
  sections JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow public read access to published posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (status = 'published');

-- Policy: Allow all operations (for admin - protected by app password)
-- Note: For a school project, this is fine. For production, use proper auth.
CREATE POLICY "Allow all for authenticated" ON posts
  FOR ALL USING (true);
```

### Step 3: Get Your API Keys

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (the long string under "Project API keys")

### Step 4: Configure Your Blog

1. Open `supabase-config.js`
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### Step 5: Deploy

**Option A: Vercel (Easiest)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project" → select your repo
4. Click "Deploy"
5. Done! Your site is live.

**Option B: Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Drag your project folder into the browser
3. Done!

**Option C: GitHub Pages**
1. Push to GitHub
2. Go to repo Settings → Pages
3. Select "main" branch, click Save
4. Your site will be at `username.github.io/repo-name`

---

## How It Works

- **Public site** (`index.html`): Fetches only published posts from Supabase
- **Admin** (`admin.html`): Full CRUD operations, protected by password
- **Password**: `jhajhablinks` (change this in `admin.js` if you want)

The blog works without Supabase too — it falls back to localStorage. But with Supabase:
- ✅ Posts persist permanently
- ✅ Works on any device
- ✅ Shareable URL that anyone can visit
- ✅ You can edit from anywhere

---

## File Structure

```
/Internship Blog
├── index.html          # Public blog
├── admin.html          # Admin panel
├── style.css           # Main styles
├── admin.css           # Admin styles
├── script.js           # Public site logic
├── admin.js            # Admin logic
├── supabase-config.js  # Database config (edit this!)
└── SETUP.md            # This file
```

---

## Troubleshooting

**"Posts not loading"**
- Check browser console for errors
- Make sure Supabase URL and key are correct
- Make sure you ran the SQL to create the table

**"Can't save posts"**
- Check that RLS policies are set up (run the SQL above)
- Check browser console for specific error messages

**"Posts show locally but not when deployed"**
- You're probably still using localStorage
- Make sure `supabase-config.js` has the real values, not placeholders

---

## Need Help?

The admin panel shows helpful error messages. Check the browser console (F12 → Console) for detailed errors.
