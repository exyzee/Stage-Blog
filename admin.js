/* ============================================
   ADMIN PANEL — GITHUB BACKEND
   Posts stored in posts.json, committed via GitHub API
   ============================================ */

const ADMIN_PASSWORD = 'jhajhablinks';

// ─── State ───────────────────────────────────
let currentPostId = null;
let posts = [];
let postsSha = null;

// ─── DOM ─────────────────────────────────────
const loginScreen = document.getElementById('loginScreen');
const setupScreen = document.getElementById('setupScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const tokenInput = document.getElementById('tokenInput');
const saveTokenBtn = document.getElementById('saveTokenBtn');
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

// ─── Init ────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
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
  saveTokenBtn.addEventListener('click', handleSaveToken);
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) previewModal.classList.remove('open');
  });
  
  // Quick paste functionality
  const autoFillBtn = document.getElementById('autoFillBtn');
  const toggleQuickPaste = document.getElementById('toggleQuickPaste');
  const quickPasteSection = document.getElementById('quickPasteSection');
  
  if (autoFillBtn) {
    autoFillBtn.addEventListener('click', handleAutoFill);
  }
  
  if (toggleQuickPaste && quickPasteSection) {
    toggleQuickPaste.addEventListener('click', () => {
      const isHidden = quickPasteSection.style.display === 'none';
      quickPasteSection.style.display = isHidden ? 'block' : 'none';
      toggleQuickPaste.textContent = isHidden ? 'Hide Quick Paste' : 'Show Quick Paste';
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

async function handleSaveToken() {
  const token = tokenInput.value.trim();
  if (!token) {
    alert('Please enter a token');
    return;
  }
  setGitHubToken(token);
  saveTokenBtn.textContent = 'Checking...';
  saveTokenBtn.disabled = true;
  
  try {
    await loadPosts();
    setupScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    renderPostsList();
    showToast('Token saved! Ready to manage posts.', 'success');
  } catch (err) {
    alert('Token failed: ' + err.message + '\n\nMake sure you checked the "repo" scope.');
    saveTokenBtn.textContent = 'Save Token & Continue';
    saveTokenBtn.disabled = false;
  }
}

async function tryShowDashboard() {
  loginScreen.style.display = 'none';
  
  const token = localStorage.getItem('github_token');
  if (!token) {
    console.log('[Admin] No GitHub token — showing setup');
    setupScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
    return;
  }
  
  setGitHubToken(token);
  
  try {
    await loadPosts();
    setupScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    renderPostsList();
  } catch (err) {
    console.error('[Admin] Failed to load posts:', err);
    setupScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
  }
}

// ─── Posts CRUD ──────────────────────────────
async function loadPosts() {
  const { posts: allPosts, sha } = await fetchAllPosts();
  posts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  postsSha = sha;
  console.log('[Admin] Loaded', posts.length, 'posts');
}

async function saveAllPosts() {
  const res = await savePosts(posts, postsSha);
  postsSha = res.content.sha;
  console.log('[Admin] Saved posts to GitHub');
}

function renderPostsList() {
  if (!posts.length) {
    postsList.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--color-text-muted); font-size: 0.9rem;">No posts yet</p>';
    return;
  }

  postsList.innerHTML = posts.map(p => `
    <div class="post-item ${p.id === currentPostId ? 'active' : ''}" data-id="${p.id}">
      <div class="post-item-header">
        <h4>${p.title || 'Untitled'}</h4>
        <span class="status-badge status-${p.status}">${p.status}</span>
      </div>
      <p class="post-item-meta">${p.week || 'No week'} • ${fmtDate(p.date)}</p>
    </div>
  `).join('');

  postsList.querySelectorAll('.post-item').forEach(el => {
    el.addEventListener('click', () => loadPostIntoEditor(el.dataset.id));
  });
}

// ─── Editor ──────────────────────────────────
function createNewPost() {
  currentPostId = 'post_' + Date.now();
  const today = new Date().toISOString().split('T')[0];
  
  editorEmpty.style.display = 'none';
  editorForm.style.display = 'block';
  
  document.getElementById('weekInput').value = '';
  document.getElementById('dateInput').value = today;
  document.getElementById('statusInput').value = 'draft';
  document.getElementById('titleInput').value = '';
  document.getElementById('excerptInput').value = '';
  
  clearEditor('activitiesEditor');
  clearEditor('deadlinesEditor');
  clearEditor('learningEditor');
  clearEditor('environmentEditor');
  clearEditor('positiveEditor');
  
  document.getElementById('strengthsInput').value = '';
  document.getElementById('growthInput').value = '';
  document.getElementById('growthPlanInput').value = '';
  
  renderPostsList();
  document.getElementById('titleInput').focus();
}

function loadPostIntoEditor(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  
  currentPostId = id;
  editorEmpty.style.display = 'none';
  editorForm.style.display = 'block';
  
  document.getElementById('weekInput').value = post.week || '';
  document.getElementById('dateInput').value = post.date || '';
  document.getElementById('statusInput').value = post.status || 'draft';
  document.getElementById('titleInput').value = post.title || '';
  document.getElementById('excerptInput').value = post.excerpt || '';
  
  const s = post.sections || {};
  setEditorHTML('activitiesEditor', s.activities || '');
  setEditorHTML('deadlinesEditor', s.deadlines || '');
  setEditorHTML('learningEditor', s.learning || '');
  setEditorHTML('environmentEditor', s.environment || '');
  setEditorHTML('positiveEditor', s.positive || '');
  
  document.getElementById('strengthsInput').value = s.strengths || '';
  document.getElementById('growthInput').value = s.growth || '';
  document.getElementById('growthPlanInput').value = s.growthPlan || '';
  
  renderPostsList();
}

async function handleSavePost(e) {
  e.preventDefault();
  
  const postData = {
    id: currentPostId,
    week: document.getElementById('weekInput').value.trim(),
    date: document.getElementById('dateInput').value,
    status: document.getElementById('statusInput').value,
    title: document.getElementById('titleInput').value.trim(),
    excerpt: document.getElementById('excerptInput').value.trim(),
    sections: {
      activities: getEditorHTML('activitiesEditor'),
      deadlines: getEditorHTML('deadlinesEditor'),
      learning: getEditorHTML('learningEditor'),
      environment: getEditorHTML('environmentEditor'),
      strengths: document.getElementById('strengthsInput').value.trim(),
      growth: document.getElementById('growthInput').value.trim(),
      growthPlan: document.getElementById('growthPlanInput').value.trim(),
      positive: getEditorHTML('positiveEditor')
    }
  };
  
  const idx = posts.findIndex(p => p.id === currentPostId);
  if (idx >= 0) {
    posts[idx] = postData;
  } else {
    posts.unshift(postData);
  }
  
  try {
    await saveAllPosts();
    showToast('Post saved!', 'success');
    renderPostsList();
  } catch (err) {
    showToast('Failed to save: ' + err.message, 'error');
  }
}

async function handleDeletePost() {
  if (!currentPostId) return;
  if (!confirm('Delete this post permanently?')) return;
  
  posts = posts.filter(p => p.id !== currentPostId);
  
  try {
    await saveAllPosts();
    showToast('Post deleted', 'success');
    currentPostId = null;
    editorForm.style.display = 'none';
    editorEmpty.style.display = 'flex';
    renderPostsList();
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

// ─── Rich Editor ─────────────────────────────
function initializeRichEditors() {
  document.querySelectorAll('.rich-editor').forEach(editor => {
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.execCommand('insertHTML', false, '<br><br>');
      }
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'b') {
          e.preventDefault();
          document.execCommand('bold');
        } else if (e.key === 'i') {
          e.preventDefault();
          document.execCommand('italic');
        }
      }
    });
  });
}

function getEditorHTML(id) {
  const el = document.getElementById(id);
  return el.innerHTML.trim();
}

function setEditorHTML(id, html) {
  const el = document.getElementById(id);
  el.innerHTML = html;
}

function clearEditor(id) {
  document.getElementById(id).innerHTML = '';
}

// ─── Preview ─────────────────────────────────
function showPreview() {
  const s = {
    activities: getEditorHTML('activitiesEditor'),
    deadlines: getEditorHTML('deadlinesEditor'),
    learning: getEditorHTML('learningEditor'),
    environment: getEditorHTML('environmentEditor'),
    strengths: document.getElementById('strengthsInput').value.trim(),
    growth: document.getElementById('growthInput').value.trim(),
    growthPlan: document.getElementById('growthPlanInput').value.trim(),
    positive: getEditorHTML('positiveEditor')
  };
  
  const title = document.getElementById('titleInput').value.trim() || 'Untitled';
  const week = document.getElementById('weekInput').value.trim() || 'Entry';
  const date = fmtDate(document.getElementById('dateInput').value);
  
  previewContent.innerHTML = `
    <div class="modal-header" style="padding: 36px 44px; border-bottom: 1px solid var(--color-border-light);">
      <div class="modal-meta" style="display: flex; gap: 12px; margin-bottom: 12px;">
        <span class="week-badge">${week}</span>
      </div>
      <h1 class="modal-title" style="font-family: var(--font-heading); font-size: 2rem; margin-bottom: 16px;">${title}</h1>
      <div class="modal-author" style="font-size: 0.9rem; color: var(--color-text-muted);">
        <span>Jha Sundaram</span>
        <span>· ${date}</span>
      </div>
    </div>
    <div class="modal-body" style="padding: 36px 44px;">
      ${s.activities ? sec('🛠️', "What I've Been Working On", s.activities) : ''}
      ${s.deadlines ? sec('📅', 'Deadlines & Planning', s.deadlines) : ''}
      ${s.learning ? sec('💡', 'What I Learned', s.learning) : ''}
      ${s.environment ? sec('👥', 'Environment & People', s.environment) : ''}
      ${(s.strengths || s.growth) ? `
        <div class="modal-section">
          <h3><span class="modal-section-icon">📊</span> Strengths & Growth</h3>
          <div class="skills-grid">
            <div class="skill-card skill-strength">
              <h4>💪 Going Well</h4>
              <ul>${skillList(s.strengths)}</ul>
            </div>
            <div class="skill-card skill-growth">
              <h4>🌱 Room to Grow</h4>
              <ul>${skillList(s.growth)}</ul>
            </div>
          </div>
          ${s.growthPlan ? `<p class="growth-plan"><strong>My plan:</strong> ${s.growthPlan}</p>` : ''}
        </div>` : ''}
      ${s.positive ? `
        <div class="modal-section modal-section-highlight">
          <h3><span class="modal-section-icon">✨</span> Ending on a High Note</h3>
          <div class="modal-section-content">${s.positive}</div>
        </div>` : ''}
    </div>`;
  
  previewModal.classList.add('open');
}

function sec(icon, title, content) {
  return `
    <div class="modal-section">
      <h3><span class="modal-section-icon">${icon}</span> ${title}</h3>
      <div class="modal-section-content">${content}</div>
    </div>`;
}

function skillList(text) {
  if (!text) return '<li>None listed</li>';
  return text.split('\n')
    .map(l => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)
    .map(l => `<li>${l}</li>`)
    .join('') || '<li>None listed</li>';
}

// ─── Utils ───────────────────────────────────
function fmtDate(d) {
  if (!d) return 'No date';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Quick Paste Auto-Fill ──────────────────
function handleAutoFill() {
  const input = document.getElementById('quickPasteInput');
  const text = input.value.trim();
  
  if (!text) {
    showToast('Please paste some content first', 'error');
    return;
  }
  
  try {
    const parsed = smartParseBlogPost(text);
    
    // Fill in metadata
    if (parsed.week) document.getElementById('weekInput').value = parsed.week;
    if (parsed.date) document.getElementById('dateInput').value = parsed.date;
    if (parsed.title) document.getElementById('titleInput').value = parsed.title;
    if (parsed.excerpt) document.getElementById('excerptInput').value = parsed.excerpt;
    
    // Fill in sections
    if (parsed.activities) setEditorHTML('activitiesEditor', formatContent(parsed.activities));
    if (parsed.deadlines) setEditorHTML('deadlinesEditor', formatContent(parsed.deadlines));
    if (parsed.learning) setEditorHTML('learningEditor', formatContent(parsed.learning));
    if (parsed.environment) setEditorHTML('environmentEditor', formatContent(parsed.environment));
    if (parsed.positive) setEditorHTML('positiveEditor', formatContent(parsed.positive));
    
    if (parsed.strengths) document.getElementById('strengthsInput').value = parsed.strengths;
    if (parsed.growth) document.getElementById('growthInput').value = parsed.growth;
    if (parsed.growthPlan) document.getElementById('growthPlanInput').value = parsed.growthPlan;
    
    showToast('✨ Auto-filled successfully!', 'success');
    
    // Clear the paste area
    input.value = '';
    
  } catch (err) {
    console.error('Parse error:', err);
    showToast('Could not parse content. Try formatting it better.', 'error');
  }
}

function smartParseBlogPost(text) {
  const result = {};
  
  // Normalize line breaks
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Extract week (flexible patterns)
  const weekMatch = text.match(/(?:week|Week|WEEK)[\s:]*([^\n]+)/i);
  if (weekMatch) result.week = weekMatch[1].trim();
  
  // Extract date (various formats)
  const dateMatch = text.match(/(?:date|Date|DATE)[\s:]*([^\n]+)/i);
  if (dateMatch) {
    const dateStr = dateMatch[1].trim();
    // Try to parse and format as YYYY-MM-DD
    const parsed = new Date(dateStr);
    if (!isNaN(parsed)) {
      result.date = parsed.toISOString().split('T')[0];
    }
  }
  
  // Extract title
  const titleMatch = text.match(/(?:title|Title|TITLE)[\s:]*([^\n]+)/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  } else {
    // Try to find first big line that looks like a title
    const lines = text.split('\n').filter(l => l.trim());
    for (let line of lines) {
      if (line.length > 10 && line.length < 100 && !line.includes(':')) {
        result.title = line.trim();
        break;
      }
    }
  }
  
  // Extract excerpt/summary
  const excerptMatch = text.match(/(?:excerpt|Excerpt|summary|Summary|EXCERPT)[\s:]*([^\n]+(?:\n(?!(?:week|date|title|activities|deadlines|learning|environment|strengths|growth|positive))[^\n]+)*)/i);
  if (excerptMatch) {
    result.excerpt = excerptMatch[1].trim().replace(/\n+/g, ' ').slice(0, 250);
  }
  
  // Extract sections with flexible keywords
  result.activities = extractSection(text, [
    'activities', 'what i\'ve been working on', 'what have you been doing',
    'work', 'tasks', 'working on', 'been doing'
  ]);
  
  result.deadlines = extractSection(text, [
    'deadlines', 'planning', 'timeline', 'schedule', 'next steps',
    'upcoming', 'goals'
  ]);
  
  result.learning = extractSection(text, [
    'learning', 'learned', 'what i learned', 'new things', 'insights',
    'lessons', 'takeaways'
  ]);
  
  result.environment = extractSection(text, [
    'environment', 'people', 'colleagues', 'team', 'mentor',
    'office', 'workplace', 'culture'
  ]);
  
  result.positive = extractSection(text, [
    'positive', 'highlight', 'ending on a high note', 'best moment',
    'exciting', 'grateful', 'looking forward'
  ]);
  
  // Extract strengths and growth (often in lists)
  const strengthsMatch = extractSection(text, [
    'strengths', 'going well', 'doing well', 'good at', 'strong in'
  ]);
  if (strengthsMatch) {
    result.strengths = convertToList(strengthsMatch);
  }
  
  const growthMatch = extractSection(text, [
    'growth', 'room to grow', 'improve', 'working on', 'challenges',
    'areas for improvement'
  ]);
  if (growthMatch) {
    result.growth = convertToList(growthMatch);
  }
  
  const planMatch = extractSection(text, [
    'growth plan', 'plan', 'how to improve', 'next steps for growth'
  ]);
  if (planMatch) {
    result.growthPlan = planMatch;
  }
  
  return result;
}

function extractSection(text, keywords) {
  // Try each keyword
  for (let keyword of keywords) {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(?:^|\\n)\\s*(?:##?\\s*)?${escapedKeyword}[:\\s]*\\n([\\s\\S]*?)(?=\\n\\s*(?:##?\\s*)?(?:${allSectionKeywords.join('|')})[:\\s]*\\n|$)`,
      'i'
    );
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }
  return '';
}

// All possible section headers for splitting
const allSectionKeywords = [
  'week', 'date', 'title', 'excerpt', 'summary',
  'activities', 'what i\'ve been working on', 'work', 'tasks',
  'deadlines', 'planning', 'timeline',
  'learning', 'learned', 'lessons',
  'environment', 'people', 'colleagues', 'team',
  'strengths', 'going well', 'doing well',
  'growth', 'room to grow', 'improve',
  'growth plan', 'plan',
  'positive', 'highlight', 'ending on a high note'
];

function convertToList(text) {
  // If already in list format, keep it
  if (text.match(/^[-•*]\s/m)) {
    return text;
  }
  // Convert numbered list or comma-separated to bullet points
  if (text.match(/^\d+\./m)) {
    return text.replace(/^\d+\.\s*/gm, '• ');
  }
  // If comma or semicolon separated
  if (text.includes(',') || text.includes(';')) {
    return text.split(/[,;]+/).map(s => '• ' + s.trim()).join('\n');
  }
  // If newline separated, add bullets
  return text.split('\n').filter(l => l.trim()).map(l => '• ' + l.trim()).join('\n');
}

function formatContent(text) {
  // Convert plain text to HTML with paragraphs
  if (!text) return '';
  
  // Split into paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map(p => {
      p = p.trim();
      if (!p) return '';
      // Check if it's a list
      if (p.match(/^[-•*]\s/m) || p.match(/^\d+\./m)) {
        const items = p.split('\n').filter(l => l.trim());
        return '<ul>' + items.map(item => {
          const cleaned = item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '');
          return '<li>' + cleaned + '</li>';
        }).join('') + '</ul>';
      }
      return '<p>' + p + '</p>';
    })
    .filter(Boolean)
    .join('\n');
}
