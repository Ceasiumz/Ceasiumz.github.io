(function () {
    'use strict';
    const root = document.querySelector('[data-markdown-directory]');
    if (!root) return;
    const directory = decodeURIComponent(location.pathname).replace(/\/index\.html$/, '').replace(/^\/|\/$/g, '');
    const cards = document.getElementById('markdown-directory');
    const reader = root.querySelector('.directory-reader');
    const content = document.getElementById('markdown-container');
    const back = document.getElementById('directory-back');
    const title = document.getElementById('directory-title');
    const breadcrumbs = root.querySelector('.directory-breadcrumbs');
    const encodePath = value => '/' + value.split('/').map(encodeURIComponent).join('/');
    const directoryUrl = encodePath(directory) + '/';
    let documents = [];
    let requestId = 0;

    function link(label, href) {
        const anchor = document.createElement('a');
        anchor.textContent = label;
        anchor.href = href;
        anchor.className = 'menu';
        return anchor;
    }

    breadcrumbs.append(link('Home', '/'));
    directory.split('/').forEach((part, index, parts) => {
        breadcrumbs.append(' / ', link(part, encodePath(parts.slice(0, index + 1).join('/')) + '/'));
    });
    title.textContent = directory.split('/').pop();
    back.href = directoryUrl;

    function card(label, description, href) {
        const anchor = link('', href);
        const box = document.createElement('div');
        box.className = 'gpart';
        const heading = document.createElement('div');
        heading.className = 'title';
        heading.textContent = label;
        const excerpt = document.createElement('div');
        excerpt.className = 'card-excerpt';
        excerpt.textContent = description;
        box.append(heading, excerpt);
        anchor.append(box);
        cards.append(anchor);
    }

    function renderCards() {
        cards.replaceChildren();
        const prefix = directory + '/';
        const folders = new Set();
        documents.forEach(item => {
            if (item.directory.startsWith(prefix)) folders.add(item.directory.slice(prefix.length).split('/')[0]);
        });
        [...folders].sort().forEach(folder => {
            const nested = prefix + folder;
            const count = documents.filter(item => item.directory === nested || item.directory.startsWith(nested + '/')).length;
            card(folder, count + ' 篇文章', encodePath(nested) + '/');
        });
        documents.filter(item => item.directory === directory).forEach(item => {
            card(item.name, item.excerpt, directoryUrl + '?note=' + encodeURIComponent(item.path));
        });
        if (!cards.children.length) cards.textContent = '此目录暂无 Markdown 文章。';
    }

    async function renderRoute() {
        const currentRequest = ++requestId;
        const note = new URLSearchParams(location.search).get('note');
        cards.hidden = Boolean(note);
        reader.hidden = !note;
        if (!note) {
            content.replaceChildren();
            return;
        }
        const item = documents.find(item => item.path === note && item.directory === directory);
        content.textContent = '正在读取文章…';
        if (!item) {
            content.textContent = '文章不存在，请返回目录。';
            return;
        }
        try {
            const response = await fetch(item.url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const source = await response.text();
            if (currentRequest !== requestId) return;
            if (window.marked && window.DOMPurify) {
                content.innerHTML = window.DOMPurify.sanitize(window.marked.parse(source, { breaks: true }));
                content.querySelectorAll('a[href], img[src]').forEach(element => {
                    const attribute = element.tagName === 'IMG' ? 'src' : 'href';
                    const value = element.getAttribute(attribute);
                    if (!value || value.startsWith('#')) return;
                    const target = new URL(value, new URL(item.url, location.origin));
                    const matching = documents.find(doc => new URL(doc.url, location.origin).href === target.origin + target.pathname);
                    if (attribute === 'href' && matching) {
                        element.href = encodePath(matching.directory) + '/?note=' + encodeURIComponent(matching.path) + target.hash;
                    } else {
                        element.setAttribute(attribute, target.href);
                    }
                });
                content.querySelectorAll('pre code').forEach(block => {
                    if (window.hljs) window.hljs.highlightElement(block);
                });
            } else {
                const pre = document.createElement('pre');
                pre.textContent = source;
                content.replaceChildren(pre);
            }
        } catch (error) {
            if (currentRequest === requestId) content.textContent = '文章加载失败，请刷新重试或返回目录。';
            console.error(error);
        }
    }

    root.addEventListener('click', event => {
        const anchor = event.target.closest('a');
        if (!anchor || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const url = new URL(anchor.href);
        if (url.origin !== location.origin || url.pathname !== directoryUrl || url.hash) return;
        event.preventDefault();
        history.pushState({}, '', url);
        renderRoute();
    });
    window.addEventListener('popstate', renderRoute);

    fetch('/markdown-index.json', { cache: 'no-cache' })
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(manifest => {
            documents = manifest.documents;
            renderCards();
            renderRoute();
        })
        .catch(error => {
            cards.textContent = '目录加载失败，请刷新重试。';
            console.error(error);
        });
})();
