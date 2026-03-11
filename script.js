/* ============================================
   INTERNSHIP JOURNAL — PUBLIC SITE
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Load and render posts
  loadAndRenderPosts();

  // Mobile menu
  setupMobileMenu();

  // Smooth scroll
  setupSmoothScroll();
});

// ─── Load Posts ───────────────────────────────
async function loadAndRenderPosts() {
  const featuredPost = document.getElementById('featuredPost');
  const postsGrid = document.getElementById('postsGrid');
  const emptyState = document.getElementById('emptyState');
  const postsContainer = document.getElementById('postsContainer');

  let posts = [];

  // Try to load from Supabase first
  if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: false });

      if (error) throw error;
      posts = data || [];
    } catch (err) {
      console.error('Error loading from Supabase:', err);
      // Fallback to localStorage
      posts = getLocalPosts();
    }
  } else {
    // Use localStorage if Supabase not configured
    posts = getLocalPosts();
  }

  if (posts.length === 0) {
    postsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  postsContainer.style.display = 'block';
  emptyState.style.display = 'none';

  // Featured post (most recent)
  const featured = posts[0];
  const otherPosts = posts.slice(1);

  // Render featured
  featuredPost.innerHTML = renderFeaturedCard(featured);

  // Render grid
  if (otherPosts.length > 0) {
    postsGrid.innerHTML = otherPosts.map(post => renderPostCard(post)).join('');
    postsGrid.style.display = 'grid';
  } else {
    postsGrid.style.display = 'none';
  }

  // Add click handlers
  document.querySelectorAll('[data-post-id]').forEach(card => {
    card.addEventListener('click', () => {
      const postId = card.dataset.postId;
      const post = posts.find(p => p.id === postId);
      if (post) openPostModal(post);
    });
  });
}

function getLocalPosts() {
  const stored = localStorage.getItem('internship_blog_posts');
  const allPosts = stored ? JSON.parse(stored) : [];
  return allPosts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderFeaturedCard(post) {
  const formattedDate = formatDate(post.date);
  const readingTime = estimateReadingTime(post);

  return `
    <div class="featured-card" data-post-id="${post.id}">
      <div class="featured-image">
        <div class="featured-image-bg">
          <span class="featured-emoji">🚀</span>
        </div>
        <div class="featured-badge">Latest</div>
      </div>
      <div class="featured-content">
        <div class="featured-meta">
          <span class="week-badge">${post.week || 'Journal Entry'}</span>
          <span class="reading-time">${readingTime} min read</span>
        </div>
        <h2 class="featured-title">${post.title || 'Untitled'}</h2>
        <p class="featured-excerpt">${post.excerpt || getExcerpt(post)}</p>
        <div class="featured-footer">
          <div class="featured-footer-item">
            <span class="featured-footer-label">Written by</span>
            <span class="featured-footer-value">Jha Sundaram</span>
          </div>
          <div class="featured-footer-item">
            <span class="featured-footer-label">Posted on</span>
            <span class="featured-footer-value">${formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPostCard(post) {
  const formattedDate = formatDate(post.date);
  const readingTime = estimateReadingTime(post);

  return `
    <article class="post-card" data-post-id="${post.id}">
      <div class="post-card-header">
        <div class="post-card-icon">📝</div>
        <div class="post-card-meta">
          <span class="post-card-week">${post.week || 'Entry'}</span>
          <span class="post-card-date">${formattedDate}</span>
        </div>
      </div>
      <h3 class="post-card-title">${post.title || 'Untitled'}</h3>
      <p class="post-card-excerpt">${post.excerpt || getExcerpt(post)}</p>
      <div class="post-card-footer">
        <span class="post-card-reading">${readingTime} min read</span>
        <span class="post-card-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </article>
  `;
}

// ─── Post Modal ───────────────────────────────
function openPostModal(post) {
  const modal = document.getElementById('postModal');
  const content = document.getElementById('postModalContent');
  const formattedDate = formatDate(post.date);
  const readingTime = estimateReadingTime(post);

  // Handle sections - could be object or JSON string from Supabase
  const sections = typeof post.sections === 'string' 
    ? JSON.parse(post.sections) 
    : (post.sections || {});

  content.innerHTML = `
    <div class="modal-header">
      <button class="modal-close" id="modalCloseBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to journal
      </button>
      <div class="modal-meta">
        <span class="week-badge">${post.week || 'Journal Entry'}</span>
        <span class="reading-time">${readingTime} min read</span>
      </div>
      <h1 class="modal-title">${post.title || 'Untitled'}</h1>
      <div class="modal-author">
        <span class="modal-author-name">Jha Sundaram</span>
        <span class="modal-author-date">${formattedDate}</span>
      </div>
    </div>
    <div class="modal-body">
      ${sections.activities ? `
        <div class="modal-section">
          <h3><span class="modal-section-icon">🛠️</span> What I've Been Working On</h3>
          <div class="modal-section-content">${sections.activities}</div>
        </div>
      ` : ''}

      ${sections.deadlines ? `
        <div class="modal-section">
          <h3><span class="modal-section-icon">📅</span> Deadlines & Planning</h3>
          <div class="modal-section-content">${sections.deadlines}</div>
        </div>
      ` : ''}

      ${sections.learning ? `
        <div class="modal-section">
          <h3><span class="modal-section-icon">💡</span> What I Learned</h3>
          <div class="modal-section-content">${sections.learning}</div>
        </div>
      ` : ''}

      ${sections.environment ? `
        <div class="modal-section">
          <h3><span class="modal-section-icon">👥</span> Environment & People</h3>
          <div class="modal-section-content">${sections.environment}</div>
        </div>
      ` : ''}

      ${(sections.strengths || sections.growth) ? `
        <div class="modal-section">
          <h3><span class="modal-section-icon">📊</span> Strengths & Growth Areas</h3>
          <div class="skills-grid">
            <div class="skill-card skill-strength">
              <h4>💪 Going Well</h4>
              <ul>${formatSkillList(sections.strengths)}</ul>
            </div>
            <div class="skill-card skill-growth">
              <h4>🌱 Room to Grow</h4>
              <ul>${formatSkillList(sections.growth)}</ul>
            </div>
          </div>
          ${sections.growthPlan ? `<p class="growth-plan">${sections.growthPlan}</p>` : ''}
        </div>
      ` : ''}

      ${sections.positive ? `
        <div class="modal-section modal-section-highlight">
          <h3><span class="modal-section-icon">✨</span> Ending on a High Note</h3>
          <div class="modal-section-content">${sections.positive}</div>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Close handlers
  document.getElementById('modalCloseBtn').addEventListener('click', closePostModal);
  document.getElementById('postModalOverlay').addEventListener('click', closePostModal);

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closePostModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function closePostModal() {
  const modal = document.getElementById('postModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Utilities ────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function estimateReadingTime(post) {
  const sections = typeof post.sections === 'string' 
    ? JSON.parse(post.sections) 
    : (post.sections || {});
  const text = Object.values(sections).join(' ');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getExcerpt(post) {
  const sections = typeof post.sections === 'string' 
    ? JSON.parse(post.sections) 
    : (post.sections || {});
  const firstSection = sections.activities || sections.learning || '';
  const stripped = firstSection.replace(/<[^>]+>/g, '');
  return stripped.slice(0, 150) + (stripped.length > 150 ? '...' : '');
}

function formatSkillList(text) {
  if (!text) return '<li>None listed</li>';
  return text.split('\n')
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(line => line)
    .map(line => `<li>${line}</li>`)
    .join('') || '<li>None listed</li>';
}

// ─── Mobile Menu ──────────────────────────────
function setupMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }
}

// ─── Smooth Scroll ────────────────────────────
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav')?.offsetHeight || 64;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 24;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
