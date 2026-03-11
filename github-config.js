/* ============================================
   GITHUB BACKEND CONFIGURATION
   Posts stored as JSON in the repo
   ============================================ */

const GITHUB_OWNER = 'exyzee';
const GITHUB_REPO = 'Stage-Blog';
const POSTS_FILE = 'posts.json';

// For admin panel - you'll set this via the UI
let GITHUB_TOKEN = localStorage.getItem('github_token') || '';

/**
 * Fetch published posts from GitHub
 */
async function fetchPublishedPosts() {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${POSTS_FILE}`;
  const res = await fetch(url + '?t=' + Date.now()); // Cache bust
  if (!res.ok) throw new Error('GitHub HTTP ' + res.status);
  const all = await res.json();
  return all.filter(p => p.status === 'published').sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * For admin: fetch all posts (including drafts)
 */
async function fetchAllPosts() {
  if (!GITHUB_TOKEN) throw new Error('No GitHub token');
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${POSTS_FILE}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) throw new Error('GitHub API ' + res.status);
  const data = await res.json();
  
  // Properly decode unicode content
  const content = decodeURIComponent(escape(atob(data.content)));
  const posts = JSON.parse(content);
  
  return { posts, sha: data.sha };
}

/**
 * For admin: save posts back to GitHub
 */
async function savePosts(posts, sha) {
  if (!GITHUB_TOKEN) throw new Error('No GitHub token');
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${POSTS_FILE}`;
  
  // Properly encode unicode (emojis, special chars) for btoa
  const jsonString = JSON.stringify(posts, null, 2);
  const content = btoa(unescape(encodeURIComponent(jsonString)));
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update blog posts',
      content,
      sha
    })
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to save');
  }
  return res.json();
}

function setGitHubToken(token) {
  GITHUB_TOKEN = token;
  localStorage.setItem('github_token', token);
}
