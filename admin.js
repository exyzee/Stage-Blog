/* ============================================
   ADMIN PANEL — BLOG MANAGEMENT
   All data flows through Supabase JS client.
   No manual SQL for data. Ever.
   ============================================ */

const ADMIN_PASSWORD = 'jhajhablinks';

// Minimal SQL: just table + RLS. Data is handled by JS.
const SETUP_SQL = `-- Run this ONCE in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  week TEXT,
  date DATE,
  status TEXT DEFAULT 'draft',
  title TEXT,
  excerpt TEXT,
  sections JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published" ON posts;
DROP POLICY IF EXISTS "Anyone can do anything" ON posts;

-- Let anyone read published posts (public blog)
CREATE POLICY "Anyone can read published" ON posts
  FOR SELECT USING (true);

-- Let anyone insert/update/delete (admin uses anon key)
CREATE POLICY "Anyone can do anything" ON posts
  FOR ALL USING (true) WITH CHECK (true);
`;

// ─── State ───────────────────────────────────
let currentPostId = null;
let posts = [];
let useSupabase = false;

// ─── DOM ─────────────────────────────────────
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

// ─── Init ────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  useSupabase = typeof isSupabaseConfigured === 'function' && isSupabaseConfigured();
  console.log('[Admin] Supabase configured:', useSupabase);

  if (sessionStorage.getItem('admin_logged_in') === 'true') {
    await tryShowDashboard();
  }

  setupEventListeners();
  initializeRichEditors();
});

// ─── Events ──────────────────────────────────
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

  if (copySqlBtn) {
    copySqlBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(SETUP_SQL).then(() => {
        copySqlBtn.textContent = '✓ Copied!';
        setTimeout(() => copySqlBtn.textContent = '📋 Copy Setup SQL', 2000);
      });
    });
  }

  if (retrySetupBtn) {
    retrySetupBtn.addEventListener('click', async () => {
      retrySetupBtn.textContent = 'Checking...';
      retrySetupBtn.disabled = true;
      await tryShowDashboard();
      retrySetupBtn.textContent = "I've run the SQL — Try Again";
      retrySetupBtn.disabled = false;
    });
  }
}

// ─── Auth ────────────────────────────────────
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
    const ok = await checkTable();
    if (!ok) {
      console.log('[Admin] Table not found — showing setup screen');
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

async function checkTable() {
  try {
    const { error } = await supabase.from('posts').select('id').limit(1);
    if (error) {
      console.log('[Admin] Table check error:', error.message);
      return !error.message.includes('does not exist') && !error.message.includes('relation');
    }
    return true;
  } catch (err) {
    console.log('[Admin] Table check exception:', err);
    return false;
  }
}

// ─── Posts CRUD ──────────────────────────────
async function loadPosts() {
  if (useSupabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      posts = (data || []).map(p => ({
        ...p,
        sections: typeof p.sections === 'string' ? JSON.parse(p.sections) : p.sections
      }));
      console.log('[Admin] Loaded', posts.length, 'posts from Supabase');
    } catch (err) {
      console.error('[Admin] Load error:', err);
      showToast('Error loading posts: ' + err.message, 'error');
      loadLocalPosts();
    }
  } else {
    loadLocalPosts();
  }
}

function loadLocalPosts() {
  const stored = localStorage.getItem('internship_blog_posts');
  posts = stored ? JSON.parse(stored) : [];
}

function saveLocalPosts() {
  localStorage.setItem('internship_blog_posts', JSON.stringify(posts));
}

function renderPostsList() {
  if (!posts.length) {
    postsList.innerHTML = '<div class="posts-list-empty">No posts yet.<br>Click "+ New Post" to start!</div>';
    return;
  }

  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  postsList.innerHTML = sorted.map(p => `
    <div class="post-list-item ${p.id === currentPostId ? 'active' : ''}" data-id="${p.id}">
      <div class="post-list-item-week">
        <span class="status-dot ${p.status}"></span>
        ${p.week || 'No week'}
      </div>
      <div class="post-list-item-title">${p.title || 'Untitled'}</div>
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
      const { error } = await supabase.from('posts').insert(newPost);
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

  const s = post.sections || {};
  setEditorContent('section1Editor', s.activities || '');
  setEditorContent('section2Editor', s.deadlines || '');
  setEditorContent('section3Editor', s.learning || '');
  setEditorContent('section4Editor', s.environment || '');
  setEditorContent('section6Editor', s.positive || '');
  document.getElementById('strengthsEditor').value = s.strengths || '';
  document.getElementById('growthEditor').value = s.growth || '';
  document.getElementById('growthPlanEditor').value = s.growthPlan || '';
}

async function handleSavePost(e) {
  e.preventDefault();
  if (!currentPostId) return;

  const idx = posts.findIndex(p => p.id === currentPostId);
  if (idx === -1) return;

  const updated = {
    ...posts[idx],
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
          week: updated.week, date: updated.date, status: updated.status,
          title: updated.title, excerpt: updated.excerpt, sections: updated.sections
        })
        .eq('id', currentPostId);
      if (error) throw error;
      console.log('[Admin] Saved to Supabase:', currentPostId);
    } catch (err) {
      showToast('Error saving: ' + err.message, 'error');
      return;
    }
  }

  posts[idx] = updated;
  if (!useSupabase) saveLocalPosts();
  renderPostsList();
  showToast('Post saved!', 'success');
}

async function handleDeletePost() {
  if (!currentPostId) return;
  if (!confirm('Delete this post permanently?')) return;

  if (useSupabase) {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', currentPostId);
      if (error) throw error;
      console.log('[Admin] Deleted from Supabase:', currentPostId);
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

// ─── Rich Text Editor ────────────────────────
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
    editor.querySelector('.rich-editor-toolbar').querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.command;
        if (cmd === 'createLink') {
          const url = prompt('Enter URL:');
          if (url) document.execCommand('createLink', false, url);
        } else {
          document.execCommand(cmd, false, null);
        }
        content.focus();
      });
    });
  });
}

function getPlaceholder(section) {
  const map = {
    activities: 'Describe what you worked on, skills you used, and any realizations...',
    deadlines: 'Did you meet your deadlines? What\'s coming up next?',
    learning: 'What new things did you learn? How did you learn them?',
    environment: 'Tell us about your workspace, colleagues, mentor...',
    positive: 'End with something positive! A win, a nice moment, something you\'re proud of...'
  };
  return map[section] || 'Write here...';
}

function setEditorContent(editorId, content) {
  const el = document.getElementById(editorId)?.querySelector('.rich-editor-content');
  if (el) el.innerHTML = content;
}

function getEditorContent(editorId) {
  const el = document.getElementById(editorId)?.querySelector('.rich-editor-content');
  return el ? el.innerHTML : '';
}

// ─── Preview ─────────────────────────────────
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
      .preview-section-highlight { background: linear-gradient(135deg, var(--color-accent-light), #F5F0FF); }
      .preview-section-highlight .preview-content { color: var(--color-text); }
    </style>
    <div class="post-preview">
      <div class="preview-meta">
        <span class="week-badge">${post.week || 'No week'}</span>
        <span class="preview-date">${formattedDate}</span>
      </div>
      <h1 class="preview-title">${post.title || 'Untitled'}</h1>
      <div class="preview-section"><h2>🛠️ What I've Been Working On</h2><div class="preview-content">${post.sections.activities || '<em>No content yet</em>'}</div></div>
      <div class="preview-section"><h2>📅 Deadlines & Planning</h2><div class="preview-content">${post.sections.deadlines || '<em>No content yet</em>'}</div></div>
      <div class="preview-section"><h2>💡 What I Learned</h2><div class="preview-content">${post.sections.learning || '<em>No content yet</em>'}</div></div>
      <div class="preview-section"><h2>👥 Environment & People</h2><div class="preview-content">${post.sections.environment || '<em>No content yet</em>'}</div></div>
      <div class="preview-section">
        <h2>📊 Strengths & Growth</h2>
        <div class="preview-skills">
          <div class="preview-skill-card skill-strength"><h4>💪 Going Well</h4><ul>${fmtList(post.sections.strengths)}</ul></div>
          <div class="preview-skill-card skill-growth"><h4>🌱 Room to Grow</h4><ul>${fmtList(post.sections.growth)}</ul></div>
        </div>
        ${post.sections.growthPlan ? `<p style="font-size:0.9rem;color:var(--color-text-secondary);margin-top:16px">${post.sections.growthPlan}</p>` : ''}
      </div>
      <div class="preview-section preview-section-highlight"><h2>✨ Ending on a High Note</h2><div class="preview-content">${post.sections.positive || '<em>No content yet</em>'}</div></div>
    </div>
  `;
  previewModal.classList.add('open');
}

function fmtList(text) {
  if (!text) return '<li><em>None listed</em></li>';
  return text.split('\n').map(l => l.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean).map(l => `<li>→ ${l}</li>`).join('') || '<li><em>None listed</em></li>';
}

// ─── Utils ───────────────────────────────────
function showToast(message, type = '') {
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 2500);
}
