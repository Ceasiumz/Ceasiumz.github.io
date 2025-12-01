// Ensure marked.js is loaded
if (typeof marked === 'undefined') {
  console.error('marked.js is not loaded. Please ensure it is included in the HTML.');
} else {
  console.log('marked.js is loaded successfully.');
}

// Configure marked.js
marked.setOptions({
  highlight: function (code, lang) {
    const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
    console.log('Highlighting code with language:', validLang);
    return hljs.highlight(code, { language: validLang }).value;
  },
  langPrefix: 'hljs language-',
  breaks: true
});

// Load and render a single Markdown file
function loadMarkdown(url) {
  fetch(url)
    .then(res => res.text())
    .then(md => {
      const html = marked.parse(md);
      const container = document.getElementById('markdown-container');
      if (container) {
        container.innerHTML = html;

        document.querySelectorAll('pre code').forEach((block) => {
          const lang = block.className.split(' ').find(c => c.startsWith('language-'))?.replace('language-', '') || 'plaintext';
          const pre = block.parentElement;
          const langLabel = document.createElement('div');
          langLabel.textContent = lang;
          langLabel.classList.add('code-lang-label');
          pre.classList.add('code-block-container');
          pre.appendChild(langLabel);
          hljs.highlightElement(block, { language: lang });
        });
      }
    })
    .catch(err => console.error('Error loading markdown content:', err));
}

// Load and render multiple Markdown files
async function loadMarkdownFiles() {
  try {
    const response = await fetch('/md_files.json');
    const files = await response.json();

    const normalizedDir = `/Ceasiumz.github.io${window.location.pathname.replace(/[^/]+$/, '')}`;
    const filtered = files.filter(file => file.url.startsWith(normalizedDir));

    const result = filtered.map(file => ({
      name: file.url.replace(normalizedDir, ''),
      url: file.url.replace(normalizedDir, '')
    }));

    const container = document.getElementById('markdowns-container');
    if (!container) {
      console.error('Markdowns container not found!');
      return;
    }

    result.forEach(file => {
      const link = document.createElement('a');
      link.href = file.url;
      link.textContent = file.name;
      link.className = 'md-link';
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const response = await fetch(file.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${file.url}`);
          }
          const markdownContent = await response.text();
          container.id = 'markdown-container';
          container.innerHTML = marked.parse(markdownContent);
          console.log('Navigating to:', file.url);
          window.history.pushState({ path: file.url }, '', file.url);
        } catch (error) {
          console.error('Error rendering markdown file:', error);
        }
      });
      container.appendChild(link);
    });
  } catch (error) {
    console.error('Error loading markdown files:', error);
  }
}

// Initialize based on the current URL
// a quick test for "code" block
const currentUrl = window.location.href;
if (currentUrl.indexOf('code') > -1) {
  loadMarkdown('/article/Csharp/Csharp_instru4_28.md');
} else {
  loadMarkdownFiles();
}