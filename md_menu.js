/**
 * Builds the Markdown library manifest used by the homepage.
 *
 * Run with `node md_menu.js` (or `npm run content:index`) before publishing.
 * The scanner intentionally walks the repository instead of maintaining a list
 * of content folders, so a Markdown file added to a new folder is picked up too.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const ignoredDirectories = new Set([
  '.git',
  '.idea',
  '.obsidian',
  '.workspace',
  'node_modules',
  'dist',
  'build',
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      if (entry.isDirectory()) {
        return ignoredDirectories.has(entry.name)
          ? []
          : walk(path.join(directory, entry.name));
      }

      return entry.isFile() && path.extname(entry.name).toLowerCase() === '.md'
        ? [path.join(directory, entry.name)]
        : [];
    });
}

function firstHeading(markdown) {
  const match = markdown.match(/^\s{0,3}#\s+(.+?)\s*#*\s*$/m);
  return match ? match[1].replace(/[`*_]/g, '').trim() : '';
}

function firstExcerpt(markdown, fallback) {
  const line = markdown
    .split(/\r?\n/)
    .map((value) => value.trim())
    .find((value) => value && !value.startsWith('#') && !value.startsWith('```') && !value.startsWith('!['));

  const text = (line || fallback)
    .replace(/^>\s?/, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > 150 ? `${text.slice(0, 147)}…` : text;
}

const documents = walk(root)
  .map((fullPath) => {
    const relativePath = path.relative(root, fullPath).split(path.sep).join('/');
    const directory = path.posix.dirname(relativePath);
    const normalizedDirectory = directory === '.' ? '' : directory;
    const name = path.basename(fullPath, path.extname(fullPath));
    const markdown = fs.readFileSync(fullPath, 'utf8');

    return {
      title: firstHeading(markdown) || name,
      name,
      path: relativePath,
      url: `/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
      directory: normalizedDirectory,
      excerpt: firstExcerpt(markdown, name),
    };
  })
  .sort((left, right) => left.path.localeCompare(right.path, 'zh-Hans-CN'));

const manifest = {
  version: 1,
  documents,
};

fs.writeFileSync(path.join(root, 'markdown-index.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

// Keep the legacy flat index available for any older page that still consumes it.
const legacyIndex = documents.map(({ name, url }) => ({ name, url }));
fs.writeFileSync(path.join(root, 'md_files.json'), `${JSON.stringify(legacyIndex, null, 2)}\n`, 'utf8');

console.log(`Indexed ${documents.length} Markdown files in markdown-index.json.`);

// Materialize article directory URLs for static hosts (including new folders).
// Never replace unrelated custom pages.
const template = fs.readFileSync(path.join(root, 'directory-page.html'), 'utf8');
const directories = new Set(['article']);
for (const document of documents) {
  if (!document.directory.startsWith('article/')) continue;
  const parts = document.directory.split('/');
  while (parts.length) {
    directories.add(parts.join('/'));
    parts.pop();
  }
}
for (const directory of directories) {
  const destination = path.join(root, directory, 'index.html');
  const existing = fs.existsSync(destination) ? fs.readFileSync(destination, 'utf8') : '';
  const migratedPages = ['article', 'article/Csharp', 'article/Eco'];
  if (!existing || existing.includes('data-markdown-directory') || migratedPages.includes(directory)) {
    fs.writeFileSync(destination, template, 'utf8');
  }
}
