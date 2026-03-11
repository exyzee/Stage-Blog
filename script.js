/* ============================================
   INTERNSHIP JOURNAL — EXQUISITE INTERACTIONS
   Crafted with intention. Every animation matters.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize everything
  initCursor();
  initScrollProgress();
  initNavBehavior();
  initRevealAnimations();
  initMagneticElements();
  init3DCards();
  loadAndRenderPosts();
  setupMobileMenu();
  setupSmoothScroll();
  addGrainTexture();
  initFloatingShapes();
});

// ─── Custom Cursor ────────────────────────────
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor follow
  function animateCursor() {
    const ease = 0.15;
    cursorX += (mouseX - cursorX) * ease;
    cursorY += (mouseY - cursorY) * ease;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover states
  const hoverElements = document.querySelectorAll('a, button, [data-cursor="pointer"], .post-card, .featured-card, .hero-meta-item, .hero-eyebrow');
  
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Click effect
  document.addEventListener('mousedown', () => cursor.classList.add('click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('click'));
}

// ─── Scroll Progress Bar ─────────────────────
function initScrollProgress() {
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;
    progress.style.transform = `scaleX(${scrollPercent})`;
  });
}

// ─── Navigation Hide/Show on Scroll ──────────
function initNavBehavior() {
  const nav = document.querySelector('.nav');
  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        
        // Add scrolled class
        if (currentScroll > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        
        // Hide/show on scroll direction
        if (currentScroll > lastScroll && currentScroll > 100) {
          nav.classList.add('hidden');
        } else {
          nav.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ─── Scroll Reveal Animations ────────────────
function initRevealAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add reveal class to elements
  const revealElements = document.querySelectorAll('.section-header, .featured-post, .posts-grid, .footer-content');
  revealElements.forEach((el, i) => {
    el.classList.add('reveal');
    if (i > 0) el.classList.add(`reveal-delay-${Math.min(i, 4)}`);
    observer.observe(el);
  });
}

// ─── Magnetic Hover Effect ───────────────────
function initMagneticElements() {
  const magneticEls = document.querySelectorAll('.nav-cta, .hero-eyebrow, .hero-meta-item');
  
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => el.style.transition = '', 400);
    });
  });
}

// ─── 3D Card Tilt Effect ─────────────────────
function init3DCards() {
  // Will be initialized after cards are rendered
}

function apply3DToCards() {
  const cards = document.querySelectorAll('.featured-card, .post-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      const rotateX = y * -8;
      const rotateY = x * 8;
      
      card.style.transform = `
        perspective(1000px)
        translateY(-8px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 500);
    });
  });

  // Re-initialize cursor for new elements
  if (!window.matchMedia('(pointer: coarse)').matches) {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        card.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      });
    }
  }
}

// ─── Grain Texture ───────────────────────────
function addGrainTexture() {
  const grain = document.createElement('div');
  grain.className = 'grain';
  document.body.appendChild(grain);
}

// ─── Floating Shapes in Hero ─────────────────
function initFloatingShapes() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const shapesContainer = document.createElement('div');
  shapesContainer.className = 'floating-shapes';
  shapesContainer.innerHTML = `
    <div class="floating-shape"></div>
    <div class="floating-shape"></div>
    <div class="floating-shape"></div>
  `;
  hero.insertBefore(shapesContainer, hero.firstChild);

  // Parallax on mouse move
  document.addEventListener('mousemove', (e) => {
    const shapes = shapesContainer.querySelectorAll('.floating-shape');
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    
    shapes.forEach((shape, i) => {
      const factor = (i + 1) * 15;
      shape.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });
}

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
  featuredPost.classList.add('reveal', 'visible');

  // Render grid
  if (otherPosts.length > 0) {
    postsGrid.innerHTML = otherPosts.map((post, i) => renderPostCard(post, i)).join('');
    postsGrid.style.display = 'grid';
  } else {
    postsGrid.style.display = 'none';
  }

  // Apply 3D effects and click handlers
  setTimeout(() => {
    apply3DToCards();
    
    document.querySelectorAll('[data-post-id]').forEach(card => {
      card.addEventListener('click', () => {
        const postId = card.dataset.postId;
        const post = posts.find(p => p.id === postId);
        if (post) openPostModal(post);
      });
    });
  }, 100);
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
  const emojis = ['🚀', '✨', '💡', '🎯', '⚡'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  return `
    <div class="featured-card" data-post-id="${post.id}">
      <div class="featured-image">
        <div class="featured-image-bg">
          <span class="featured-emoji">${emoji}</span>
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

function renderPostCard(post, index) {
  const formattedDate = formatDate(post.date);
  const readingTime = estimateReadingTime(post);
  const emojis = ['📝', '💭', '🎨', '🔮', '📊'];
  const emoji = emojis[index % emojis.length];

  return `
    <article class="post-card" data-post-id="${post.id}" style="animation-delay: ${index * 0.1}s">
      <div class="post-card-header">
        <div class="post-card-icon">${emoji}</div>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
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
          ${sections.growthPlan ? `<p class="growth-plan"><strong>My plan:</strong> ${sections.growthPlan}</p>` : ''}
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
  const closeBtn = document.getElementById('modalCloseBtn');
  const overlay = document.getElementById('postModalOverlay');
  
  closeBtn.addEventListener('click', closePostModal);
  overlay.addEventListener('click', closePostModal);

  // Re-init cursor for modal buttons
  if (!window.matchMedia('(pointer: coarse)').matches) {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
      closeBtn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      closeBtn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    }
  }

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closePostModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Animate sections in
  setTimeout(() => {
    const sections = content.querySelectorAll('.modal-section');
    sections.forEach((section, i) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      setTimeout(() => {
        section.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, 100 + i * 80);
    });
  }, 200);
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
        const navHeight = document.querySelector('.nav')?.offsetHeight || 72;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 32;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ─── Staggered Animation Helper ──────────────
function staggerAnimation(elements, className, delay = 100) {
  elements.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add(className);
    }, i * delay);
  });
}

// ─── Parallax Scrolling ──────────────────────
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero-content');
  
  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.15}px)`;
    hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
  }
});

// ─── Keyboard Navigation ─────────────────────
document.addEventListener('keydown', (e) => {
  // J/K for scroll navigation
  if (e.key === 'j' && !e.metaKey && !e.ctrlKey) {
    window.scrollBy({ top: 100, behavior: 'smooth' });
  }
  if (e.key === 'k' && !e.metaKey && !e.ctrlKey) {
    window.scrollBy({ top: -100, behavior: 'smooth' });
  }
});

// ─── Easter Egg: Konami Code ─────────────────
let konamiProgress = 0;
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === konamiCode.length) {
      document.body.style.transition = 'filter 0.5s';
      document.body.style.filter = 'hue-rotate(180deg)';
      setTimeout(() => {
        document.body.style.filter = '';
      }, 2000);
      konamiProgress = 0;
    }
  } else {
    konamiProgress = 0;
  }
});

// ─── Performance: Reduce motion for those who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--duration-fast', '0s');
  document.documentElement.style.setProperty('--duration-normal', '0s');
  document.documentElement.style.setProperty('--duration-slow', '0s');
}
