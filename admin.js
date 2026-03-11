/* ============================================
   ADMIN PANEL — BLOG MANAGEMENT
   With Supabase Backend
   ============================================ */

const ADMIN_PASSWORD = 'jhajhablinks';
const STORAGE_KEY = 'internship_blog_posts';

// SQL to create table and seed posts
const SETUP_SQL = `-- Run this in Supabase SQL Editor (one-time setup)

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  week TEXT,
  date DATE,
  status TEXT DEFAULT 'draft',
  title TEXT,
  excerpt TEXT,
  sections JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posts" ON posts;
DROP POLICY IF EXISTS "Allow all operations" ON posts;

CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow all operations" ON posts
  FOR ALL USING (true);

-- Week 1-2 post
INSERT INTO posts (id, week, date, status, title, excerpt, sections) VALUES (
  'post_week1_2', 'Week 1–2', '2026-02-23', 'published',
  'Remote Start: Getting My Bearings from 8,000 Miles Away',
  'My first two weeks at Playground have been entirely remote — onboarding from home while preparing for my move to Atlanta.',
  '{"activities": "<p>So I officially started at Playground on February 9th, but here''s the thing — I''m doing it all remotely for now. I don''t fly out to Atlanta until the end of the month, so these first two weeks have been a lot of async communication, getting access to tools, and trying to understand how things work here.</p><p>Most of my time went into <strong>learning the product inside out</strong>. Playground is an AI image generation platform, and there''s a lot to unpack — the creator tools, the community features, how templates work, the whole ecosystem.</p><p>I also started looking into some <strong>new feature concepts</strong> they''re exploring — specifically tools like background removal and image format conversion.</p>", "deadlines": "<p>Honestly, there weren''t hard deadlines these two weeks — it was more about getting oriented.</p><p><strong>✓ Get all my accounts and tools set up</strong> (Figma, Slack, Notion, etc.)<br><strong>✓ Read through existing product docs</strong><br><strong>✓ Familiarize myself with the design system</strong></p><p><strong>Next up:</strong> I land in Atlanta on Feb 28 and start in the office on March 2nd.</p>", "learning": "<p>The biggest learning curve has been understanding how an AI product company thinks about features. There''s so much consideration around <strong>what creators actually need</strong> vs. what''s technically cool to build.</p><p>I''ve also been learning how to work async effectively — writing longer Slack messages with more context, recording Loom videos for complex stuff.</p>", "environment": "<p>Hard to talk about environment when I''m working from my bedroom lol. But the team has been super welcoming even remotely. I''ve had video calls with my mentor and a few other designers, and everyone seems genuinely excited to have me join.</p>", "strengths": "• Picking up new tools quickly\\n• Self-directed learning\\n• Written communication", "growth": "• Speaking up in meetings\\n• Asking for feedback proactively\\n• Understanding the business side", "growthPlan": "I''m planning to be more vocal once I''m in the office. Also going to start asking more why questions about product decisions.", "positive": "<p>The highlight was definitely my first call with the CEO. He was super approachable and genuinely interested in my background. He mentioned he''s excited to have fresh eyes on the product. That felt good.</p><p>Two weeks down. Atlanta in a few days. Let''s go 🚀</p>"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Week 3-4 post
INSERT INTO posts (id, week, date, status, title, excerpt, sections) VALUES (
  'post_week3_4', 'Week 3–4', '2026-03-09', 'published',
  'Boots on the Ground: First Weeks in Atlanta',
  'I made it to Atlanta, joined the team in person, and immediately got pulled into some exciting feature work.',
  '{"activities": "<p>Landed in Atlanta on February 28th, took a day to recover from jet lag, and showed up at the office on Monday March 2nd. It''s been a whirlwind since then.</p><p>The big focus has been on <strong>new creator tools</strong> — specifically the background remover and image converter. I''ve been:</p><ul><li>Talking directly with the CEO and COO about product direction</li><li>Coming up with implementation plans</li><li>Wireframing user flows</li><li>Designing the actual UI</li><li>Working with developers on implementation</li></ul><p>I also got pulled into the <strong>Alice project</strong> — an AI assistant Playground is launching. I''m helping design the landing page.</p><p>Plus <strong>monitoring template metrics</strong> and helping out with creator program operations.</p>", "deadlines": "<p>Things are moving faster now.</p><p><strong>What''s on track:</strong></p><ul><li>✓ BG remover wireframes done</li><li>✓ Image converter initial flows mapped out</li><li>→ Alice landing page (in review)</li></ul><p><strong>Coming up:</strong> Finalizing Alice designs, then moving creator tools into higher fidelity.</p>", "learning": "<p><strong>I''ve been in leadership meetings</strong>. Actual strategy discussions with the CEO and COO. It''s been eye-opening to see how decisions get made at that level.</p><p>I''m learning how to work within an existing design system while still pushing for what I think is right.</p><p>Also learning about <strong>cross-functional collaboration</strong>. Designers here are involved in implementation, QA, even launch decisions.</p>", "environment": "<p>The office is great. Open floor plan, good snacks, and I can literally walk over to someone''s desk to ask a question.</p><p>My mentor has been amazing — they check in daily and give really constructive feedback.</p><p>Atlanta itself is new to me. Still figuring out the city, finding good coffee spots.</p>", "strengths": "• Visual design — my mockups are getting good feedback\\n• Taking initiative\\n• Adapting quickly to the in-person workflow", "growth": "• Presenting to stakeholders (still get nervous)\\n• Estimating timelines accurately\\n• Pushing back constructively", "growthPlan": "For presenting, I''m going to do more casual share-outs before big meetings. For estimation, I''m adding buffer time and tracking actual vs. estimated time.", "positive": "<p>Best moment: I proposed an idea for the image converter flow that wasn''t in the original brief, and it got picked up. Like, it''s going to be in the product. Something I thought of. That''s wild.</p><p>Week 4 done. Starting to feel like I actually work here. 💪</p>"}'::jsonb
) ON CONFLICT (id) DO NOTHING;`;

// State
let currentPostId = null;
let posts = [];
let useSupabase = false;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const setupScreen = document.getElementById('setupScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const newPostBtn = document.getElementById('newPostBtn');
const postsList = document.getElementById('postsList');
const editorEmpty = document.getElementById('editorEmpty');
const editorForm = document.getElementById('editorForm');
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const closePreviewBtn = document.getElementById('closePreviewBtn');
const previewBtn = document.getElementById('previewBtn');
const deletePostBtn = document.getElementById('deletePostBtn');
const toast = document.getElementById('toast');
const copySqlBtn = document.getElementById('copySqlBtn');
const retrySetupBtn = document.getElementById('retrySetupBtn');

// ─── Initialization ───────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  useSupabase = typeof isSupabaseConfigured === 'function' && isSupabaseConfigured();

  if (sessionStorage.getItem('admin_logged_in') === 'true') {
    await tryShowDashboard();
  }

  setupEventListeners();
  initializeRichEditors();
});

// ─── Event Listeners ──────────────────────────
function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  newPostBtn.addEventListener('click', createNewPost);
  editorForm.addEventListener('submit', handleSavePost);
  previewBtn.addEventListener('click', showPreview);
  closePreviewBtn.addEventListener('click', () => previewModal.classList.remove('open'));
  deletePostBtn.addEventListener('click', handleDeletePost);

  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) previewModal.classList.remove('open');
  });

  // Setup screen buttons
  if (copySqlBtn) {
    copySqlBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(SETUP_SQL).then(() => {
        copySqlBtn.textContent = '✓ Copied!';
        setTimeout(() => { copySqlBtn.textContent = '📋 Copy Setup SQL'; }, 2000);
      });
    });
  }

  if (retrySetupBtn) {
    retrySetupBtn.addEventListener('click', async () => {
      retrySetupBtn.textContent = 'Checking...';
      await tryShowDashboard();
      retrySetupBtn.textContent = "I've run the SQL — Try Again";
    });
  }
}

// ─── Authentication ───────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  if (passwordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem('admin_logged_in', 'true');
    await tryShowDashboard();
    loginError.textContent = '';
  } else {
    loginError.textContent = 'Incorrect password. Try again.';
    passwordInput.value = '';
    passwordInput.focus();
  }
}

function handleLogout() {
  sessionStorage.removeItem('admin_logged_in');
  loginScreen.style.display = 'flex';
  setupScreen.style.display = 'none';
  adminDashboard.style.display = 'none';
  passwordInput.value = '';
}

async function tryShowDashboard() {
  loginScreen.style.display = 'none';
  
  if (useSupabase) {
    const tableExists = await checkTableExists();
    if (!tableExists) {
      setupScreen.style.display = 'flex';
      adminDashboard.style.display = 'none';
      return;
    }
  }

  setupScreen.style.display = 'none';
  adminDashboard.style.display = 'block';
  await loadPosts();
  renderPostsList();
}

async function checkTableExists() {
  try {
    const { data, error } = await supabase.from('posts').select('id').limit(1);
    // If we get here without a "relation does not exist" error, table exists
    return !error || !error.message.includes('does not exist');
  } catch (err) {
    return false;
  }
}

// ─── Posts Management ─────────────────────────
async function loadPosts() {
  if (useSupabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      posts = (data || []).map(post => ({
        ...post,
        sections: typeof post.sections === 'string' ? JSON.parse(post.sections) : post.sections
      }));
    } catch (err) {
      console.error('Error loading from Supabase:', err);
      showToast('Error loading posts', 'error');
      loadLocalPosts();
    }
  } else {
    loadLocalPosts();
  }
}

function loadLocalPosts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  posts = stored ? JSON.parse(stored) : [];
}

function saveLocalPosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function renderPostsList() {
  if (posts.length === 0) {
    postsList.innerHTML = '<div class="posts-list-empty">No posts yet.<br>Click "+ New Post" to start!</div>';
    return;
  }

  const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  postsList.innerHTML = sortedPosts.map(post => `
    <div class="post-list-item ${post.id === currentPostId ? 'active' : ''}" data-id="${post.id}">
      <div class="post-list-item-week">
        <span class="status-dot ${post.status}"></span>
        ${post.week || 'No week'}
      </div>
      <div class="post-list-item-title">${post.title || 'Untitled'}</div>
    </div>
  `).join('');

  postsList.querySelectorAll('.post-list-item').forEach(item => {
    item.addEventListener('click', () => loadPostIntoEditor(item.dataset.id));
  });
}

async function createNewPost() {
  const newPost = {
    id: 'post_' + Date.now(),
    week: '',
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    title: '',
    excerpt: '',
    sections: {
      activities: '', deadlines: '', learning: '', environment: '',
      strengths: '', growth: '', growthPlan: '', positive: ''
    }
  };

  if (useSupabase) {
    try {
      const { error } = await supabase.from('posts').insert({
        id: newPost.id, week: newPost.week, date: newPost.date,
        status: newPost.status, title: newPost.title, excerpt: newPost.excerpt,
        sections: newPost.sections
      });
      if (error) throw error;
    } catch (err) {
      showToast('Error creating post: ' + err.message, 'error');
      return;
    }
  }

  posts.push(newPost);
  if (!useSupabase) saveLocalPosts();
  renderPostsList();
  loadPostIntoEditor(newPost.id);
  showToast('New post created!', 'success');
}

function loadPostIntoEditor(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  currentPostId = postId;

  postsList.querySelectorAll('.post-list-item').forEach(item => {
    item.classList.toggle('active', item.dataset.id === postId);
  });

  editorEmpty.style.display = 'none';
  editorForm.style.display = 'block';

  document.getElementById('postWeek').value = post.week || '';
  document.getElementById('postDate').value = post.date || '';
  document.getElementById('postStatus').value = post.status || 'draft';
  document.getElementById('postTitle').value = post.title || '';
  document.getElementById('postExcerpt').value = post.excerpt || '';

  const sections = post.sections || {};
  setEditorContent('section1Editor', sections.activities || '');
  setEditorContent('section2Editor', sections.deadlines || '');
  setEditorContent('section3Editor', sections.learning || '');
  setEditorContent('section4Editor', sections.environment || '');
  setEditorContent('section6Editor', sections.positive || '');

  document.getElementById('strengthsEditor').value = sections.strengths || '';
  document.getElementById('growthEditor').value = sections.growth || '';
  document.getElementById('growthPlanEditor').value = sections.growthPlan || '';
}

async function handleSavePost(e) {
  e.preventDefault();
  if (!currentPostId) return;

  const postIndex = posts.findIndex(p => p.id === currentPostId);
  if (postIndex === -1) return;

  const updatedPost = {
    ...posts[postIndex],
    week: document.getElementById('postWeek').value,
    date: document.getElementById('postDate').value,
    status: document.getElementById('postStatus').value,
    title: document.getElementById('postTitle').value,
    excerpt: document.getElementById('postExcerpt').value,
    sections: {
      activities: getEditorContent('section1Editor'),
      deadlines: getEditorContent('section2Editor'),
      learning: getEditorContent('section3Editor'),
      environment: getEditorContent('section4Editor'),
      strengths: document.getElementById('strengthsEditor').value,
      growth: document.getElementById('growthEditor').value,
      growthPlan: document.getElementById('growthPlanEditor').value,
      positive: getEditorContent('section6Editor')
    }
  };

  if (useSupabase) {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          week: updatedPost.week, date: updatedPost.date, status: updatedPost.status,
          title: updatedPost.title, excerpt: updatedPost.excerpt, sections: updatedPost.sections
        })
        .eq('id', currentPostId);
      if (error) throw error;
    } catch (err) {
      showToast('Error saving: ' + err.message, 'error');
      return;
    }
  }

  posts[postIndex] = updatedPost;
  if (!useSupabase) saveLocalPosts();
  renderPostsList();
  showToast('Post saved!', 'success');
}

async function handleDeletePost() {
  if (!currentPostId) return;
  if (!confirm('Are you sure you want to delete this post?')) return;

  if (useSupabase) {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', currentPostId);
      if (error) throw error;
    } catch (err) {
      showToast('Error deleting: ' + err.message, 'error');
      return;
    }
  }

  posts = posts.filter(p => p.id !== currentPostId);
  if (!useSupabase) saveLocalPosts();
  currentPostId = null;
  editorEmpty.style.display = 'flex';
  editorForm.style.display = 'none';
  renderPostsList();
  showToast('Post deleted', 'success');
}

// ─── Rich Text Editor ─────────────────────────
function initializeRichEditors() {
  document.querySelectorAll('.rich-editor').forEach(editor => {
    const section = editor.dataset.section;
    const placeholder = getPlaceholder(section);

    editor.innerHTML = `
      <div class="rich-editor-toolbar">
        <button type="button" class="toolbar-btn" data-command="bold" title="Bold"><b>B</b></button>
        <button type="button" class="toolbar-btn" data-command="italic" title="Italic"><i>I</i></button>
        <span class="toolbar-divider"></span>
        <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="Bullet List">•</button>
        <button type="button" class="toolbar-btn" data-command="createLink" title="Add Link">🔗</button>
      </div>
      <div class="rich-editor-content" contenteditable="true" data-placeholder="${placeholder}"></div>
    `;

    const content = editor.querySelector('.rich-editor-content');
    const toolbar = editor.querySelector('.rich-editor-toolbar');

    toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.dataset.command;
        if (command === 'createLink') {
          const url = prompt('Enter URL:');
          if (url) document.execCommand('createLink', false, url);
        } else {
          document.execCommand(command, false, null);
        }
        content.focus();
      });
    });
  });
}

function getPlaceholder(section) {
  const placeholders = {
    activities: 'Describe what you worked on, skills you used, and any realizations...',
    deadlines: 'Did you meet your deadlines? What\'s coming up next?',
    learning: 'What new things did you learn? How did you learn them?',
    environment: 'Tell us about your workspace, colleagues, mentor...',
    positive: 'End with something positive! A win, a nice moment, something you\'re proud of...'
  };
  return placeholders[section] || 'Write here...';
}

function setEditorContent(editorId, content) {
  const editor = document.getElementById(editorId);
  const contentDiv = editor?.querySelector('.rich-editor-content');
  if (contentDiv) contentDiv.innerHTML = content;
}

function getEditorContent(editorId) {
  const editor = document.getElementById(editorId);
  const contentDiv = editor?.querySelector('.rich-editor-content');
  return contentDiv ? contentDiv.innerHTML : '';
}

// ─── Preview ──────────────────────────────────
function showPreview() {
  const post = {
    week: document.getElementById('postWeek').value,
    date: document.getElementById('postDate').value,
    title: document.getElementById('postTitle').value,
    sections: {
      activities: getEditorContent('section1Editor'),
      deadlines: getEditorContent('section2Editor'),
      learning: getEditorContent('section3Editor'),
      environment: getEditorContent('section4Editor'),
      strengths: document.getElementById('strengthsEditor').value,
      growth: document.getElementById('growthEditor').value,
      growthPlan: document.getElementById('growthPlanEditor').value,
      positive: getEditorContent('section6Editor')
    }
  };

  const formattedDate = post.date 
    ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No date';

  previewContent.innerHTML = `
    <style>
      .preview-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .preview-date { font-size: 0.9rem; color: var(--color-text-muted); }
      .preview-title { font-family: var(--font-heading); font-size: 2rem; font-weight: 400; margin-bottom: 40px; line-height: 1.2; }
      .preview-section { margin-bottom: 32px; padding: 24px; background: var(--color-bg-alt); border-radius: var(--radius-md); }
      .preview-section h2 { font-family: var(--font-heading); font-size: 1.2rem; font-weight: 400; margin-bottom: 16px; }
      .preview-content { font-size: 0.95rem; line-height: 1.7; color: var(--color-text-secondary); }
      .preview-content p { margin-bottom: 12px; }
      .preview-content ul { margin: 12px 0; padding-left: 20px; }
      .preview-content li { margin-bottom: 6px; }
      .preview-content strong { color: var(--color-text); font-weight: 600; }
      .preview-skills { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
      .preview-skill-card { padding: 20px; border-radius: var(--radius-sm); }
      .preview-skill-card h4 { font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; }
      .preview-skill-card ul { list-style: none; font-size: 0.9rem; color: var(--color-text-secondary); padding: 0; }
      .preview-skill-card li { padding: 4px 0; }
      .preview-growth-plan { font-size: 0.9rem; color: var(--color-text-secondary); margin-top: 16px; }
      .preview-section-highlight { background: linear-gradient(135deg, var(--color-accent-light), #FEF3C7); }
      .preview-section-highlight .preview-content { color: var(--color-text); }
    </style>
    <div class="post-preview">
      <div class="preview-meta">
        <span class="week-badge">${post.week || 'No week'}</span>
        <span class="preview-date">${formattedDate}</span>
      </div>
      <h1 class="preview-title">${post.title || 'Untitled'}</h1>

      <div class="preview-section">
        <h2>🛠️ What I've Been Working On</h2>
        <div class="preview-content">${post.sections.activities || '<em>No content yet</em>'}</div>
      </div>

      <div class="preview-section">
        <h2>📅 Deadlines & Planning</h2>
        <div class="preview-content">${post.sections.deadlines || '<em>No content yet</em>'}</div>
      </div>

      <div class="preview-section">
        <h2>💡 What I Learned</h2>
        <div class="preview-content">${post.sections.learning || '<em>No content yet</em>'}</div>
      </div>

      <div class="preview-section">
        <h2>👥 Environment & People</h2>
        <div class="preview-content">${post.sections.environment || '<em>No content yet</em>'}</div>
      </div>

      <div class="preview-section">
        <h2>📊 Strengths & Growth Areas</h2>
        <div class="preview-skills">
          <div class="preview-skill-card skill-strength">
            <h4>💪 Going Well</h4>
            <ul>${formatListItems(post.sections.strengths)}</ul>
          </div>
          <div class="preview-skill-card skill-growth">
            <h4>🌱 Room to Grow</h4>
            <ul>${formatListItems(post.sections.growth)}</ul>
          </div>
        </div>
        ${post.sections.growthPlan ? `<p class="preview-growth-plan">${post.sections.growthPlan}</p>` : ''}
      </div>

      <div class="preview-section preview-section-highlight">
        <h2>✨ Ending on a High Note</h2>
        <div class="preview-content">${post.sections.positive || '<em>No content yet</em>'}</div>
      </div>
    </div>
  `;

  previewModal.classList.add('open');
}

function formatListItems(text) {
  if (!text) return '<li><em>None listed</em></li>';
  return text.split('\n')
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(line => line)
    .map(line => `<li>→ ${line}</li>`)
    .join('') || '<li><em>None listed</em></li>';
}

// ─── Utilities ────────────────────────────────
function showToast(message, type = '') {
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 2500);
}
