/* ============================================
   INTERNSHIP JOURNAL — REFINED INTERACTIONS
   Intentional. Minimal. Considered.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavBehavior();
  initHeroReveal();
  initScrollReveals();
  loadAndRenderPosts();
  setupMobileMenu();
  setupSmoothScroll();
});

// ─── Scroll Progress ─────────────────────────
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ─── Nav: hide on scroll-down, show on scroll-up ─
function initNavBehavior() {
  const nav = document.querySelector('.nav');
  let last = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hidden', y > last && y > 80);
    last = y;
  }, { passive: true });
}

// ─── Hero Title Word-Reveal ──────────────────
function initHeroReveal() {
  const title = document.querySelector('.hero-title');
  const content = document.querySelector('.hero-content');
  if (!title || !content) return;

  // Wrap each word in reveal span
  const html = title.innerHTML;
  // Split by spaces but keep the HTML tags intact
  const processed = wrapWordsInHTML(title);
  title.innerHTML = processed;

  // Trigger after a short paint delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      title.classList.add('animate');
      content.classList.add('loaded');
    }, 100);
  });
}

function wrapWordsInHTML(el) {
  // Get text content and HTML
  const rawHTML = el.innerHTML.trim();
  
  // Simple approach: work with the inner HTML
  // Split top-level text nodes while preserving HTML elements
  const temp = document.createElement('div');
  temp.innerHTML = rawHTML;
  
  let result = '';
  
  temp.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Wrap each word in text nodes
      const words = node.textContent.split(/(\s+)/);
      words.forEach(word => {
        if (word.trim()) {
          result += `<span class="word"><span class="word-inner">${word}</span></span> `;
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Keep elements (like <span class="hero-name">) but wrap their text too
      const tag = node.tagName.toLowerCase();
      const attrs = Array.from(node.attributes).map(a => `${a.name}="${a.value}"`).join(' ');
      const innerWords = node.textContent.split(/(\s+)/);
      const wrappedInner = innerWords
        .map(w => w.trim() ? `<span class="word"><span class="word-inner">${w}</span></span>` : '')
        .filter(Boolean)
        .join(' ');
      result += `<${tag} ${attrs}>${wrappedInner}</${tag}> `;
    }
  });
  
  return result.trim();
}

// ─── Scroll Reveal (IntersectionObserver) ────
function initScrollReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  document.querySelectorAll('.section-header, .featured-post, .posts-grid, .footer-content, .empty-state')
    .forEach((el, i) => {
      el.classList.add('reveal');
      if (i > 0) el.classList.add(`reveal-d${Math.min(i, 4)}`);
      observer.observe(el);
    });
}

// ─── Load Posts ───────────────────────────────
async function loadAndRenderPosts() {
  const featuredPost = document.getElementById('featuredPost');
  const postsGrid = document.getElementById('postsGrid');
  const emptyState = document.getElementById('emptyState');
  const postsContainer = document.getElementById('postsContainer');

  let posts = [];

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
      console.error('Supabase error:', err);
      posts = getLocalPosts();
    }
  } else {
    posts = getLocalPosts();
  }

  if (!posts.length) {
    postsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  postsContainer.style.display = 'block';
  emptyState.style.display = 'none';

  const [featured, ...rest] = posts;

  featuredPost.innerHTML = renderFeaturedCard(featured);

  if (rest.length) {
    postsGrid.innerHTML = rest.map((p, i) => renderPostCard(p, i)).join('');
    postsGrid.style.display = 'grid';
  } else {
    postsGrid.style.display = 'none';
  }

  // Bind clicks
  document.querySelectorAll('[data-post-id]').forEach(card => {
    card.addEventListener('click', () => {
      const post = posts.find(p => p.id === card.dataset.postId);
      if (post) openPostModal(post);
    });
  });
}

function getLocalPosts() {
  const stored = localStorage.getItem('internship_blog_posts');
  const all = stored ? JSON.parse(stored) : [];
  return all.filter(p => p.status === 'published').sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderFeaturedCard(post) {
  const date = fmtDate(post.date);
  const time = readTime(post);
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
          <span class="reading-time">${time} min read</span>
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
            <span class="featured-footer-value">${date}</span>
          </div>
        </div>
        <div class="read-indicator">
          Read entry
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    </div>`;
}

function renderPostCard(post, i) {
  const date = fmtDate(post.date);
  const time = readTime(post);
  const icons = ['📝', '💭', '🎨', '🔮', '📊'];
  return `
    <article class="post-card" data-post-id="${post.id}" style="animation-delay:${0.05 + i * 0.06}s">
      <div class="post-card-header">
        <div class="post-card-icon">${icons[i % icons.length]}</div>
        <div class="post-card-meta">
          <span class="post-card-week">${post.week || 'Entry'}</span>
          <span class="post-card-date">${date}</span>
        </div>
      </div>
      <h3 class="post-card-title">${post.title || 'Untitled'}</h3>
      <p class="post-card-excerpt">${post.excerpt || getExcerpt(post)}</p>
      <div class="post-card-footer">
        <span class="post-card-reading">${time} min read</span>
        <span class="post-card-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </article>`;
}

// ─── Post Modal ───────────────────────────────
function openPostModal(post) {
  const modal = document.getElementById('postModal');
  const content = document.getElementById('postModalContent');
  const date = fmtDate(post.date);
  const time = readTime(post);

  const s = typeof post.sections === 'string' ? JSON.parse(post.sections) : (post.sections || {});

  content.innerHTML = `
    <div class="modal-header">
      <button class="modal-close" id="modalCloseBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to journal
      </button>
      <div class="modal-meta">
        <span class="week-badge">${post.week || 'Journal Entry'}</span>
        <span class="reading-time">${time} min read</span>
      </div>
      <h1 class="modal-title">${post.title || 'Untitled'}</h1>
      <div class="modal-author">
        <span class="modal-author-name">Jha Sundaram</span>
        <span class="modal-author-date">${date}</span>
      </div>
    </div>
    <div class="modal-body">
      ${s.activities ? sec('🛠️', 'What I've Been Working On', s.activities) : ''}
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

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Stagger modal sections in
  const sections = content.querySelectorAll('.modal-section');
  sections.forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 120 + i * 70);
  });

  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('postModalOverlay').addEventListener('click', closeModal);

  const esc = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc); } };
  document.addEventListener('keydown', esc);
}

function closeModal() {
  document.getElementById('postModal').classList.remove('open');
  document.body.style.overflow = '';
}

function sec(icon, title, content) {
  return `
    <div class="modal-section">
      <h3><span class="modal-section-icon">${icon}</span> ${title}</h3>
      <div class="modal-section-content">${content}</div>
    </div>`;
}

// ─── Utilities ────────────────────────────────
function fmtDate(d) {
  if (!d) return 'No date';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function readTime(post) {
  const s = typeof post.sections === 'string' ? JSON.parse(post.sections) : (post.sections || {});
  const words = Object.values(s).join(' ').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getExcerpt(post) {
  const s = typeof post.sections === 'string' ? JSON.parse(post.sections) : (post.sections || {});
  const first = s.activities || s.learning || '';
  const text = first.replace(/<[^>]+>/g, '');
  return text.slice(0, 150) + (text.length > 150 ? '…' : '');
}

function skillList(text) {
  if (!text) return '<li>None listed</li>';
  return text.split('\n')
    .map(l => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)
    .map(l => `<li>${l}</li>`)
    .join('') || '<li>None listed</li>';
}

// ─── Mobile Menu ──────────────────────────────
function setupMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
    })
  );
}

// ─── Smooth Scroll ────────────────────────────
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = document.querySelector('.nav')?.offsetHeight || 64;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset - 24, behavior: 'smooth' });
      }
    });
  });
}

// ─── Subtle parallax on hero ─────────────────
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const hero = document.querySelector('.hero-content');
    if (hero && y < window.innerHeight) {
      hero.style.transform = `translateY(${y * 0.08}px)`;
      hero.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.7));
    }
    ticking = false;
  });
}, { passive: true });

// ─── Respect reduced motion ──────────────────
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('scroll-behavior', 'auto');
}
