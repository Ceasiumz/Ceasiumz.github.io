(function () {
    'use strict';

    const indexUrl = '/markdown-index.json';
    const library = document.getElementById('markdown-library');
    if (!library) return;

    const directoryContainer = document.getElementById('markdown-directory');
    const reader = document.getElementById('markdown-reader');
    const readerTitle = document.getElementById('markdown-reader-title');
    const readerPath = document.getElementById('markdown-reader-path');
    const readerContent = document.getElementById('markdown-reader-content');
    const closeButton = document.getElementById('markdown-reader-close');
    let documents = [];

    function folderName(directory) {
        return directory ? directory.split('/').join(' / ') : '主页根目录';
    }

    function escapeHtml(value) {
        const element = document.createElement('span');
        element.textContent = value || '';
        return element.innerHTML;
    }

    function createCard(document) {
        const card = window.document.createElement('button');
        card.className = 'markdown-card';
        card.type = 'button';
        card.dataset.markdownPath = document.path;
        card.innerHTML = `
            <span class="markdown-card__folder">${escapeHtml(folderName(document.directory))}</span>
            <span class="markdown-card__title">${escapeHtml(document.title)}</span>
            <span class="markdown-card__excerpt">${escapeHtml(document.excerpt)}</span>
            <span class="markdown-card__open" aria-hidden="true">打开笔记 →</span>
        `;
        return card;
    }

    function renderDirectory() {
        const groups = new Map();
        documents.forEach((document) => {
            const directory = document.directory || '';
            if (!groups.has(directory)) groups.set(directory, []);
            groups.get(directory).push(document);
        });

        directoryContainer.replaceChildren();
        [...groups.entries()].forEach(([directory, entries]) => {
            const section = window.document.createElement('section');
            section.className = 'markdown-folder';
            section.innerHTML = `<div class="markdown-folder__heading"><span>${escapeHtml(folderName(directory))}</span><small>${entries.length} 篇</small></div>`;
            const cards = window.document.createElement('div');
            cards.className = 'markdown-card-grid';
            entries.forEach((document) => cards.appendChild(createCard(document)));
            section.appendChild(cards);
            directoryContainer.appendChild(section);
        });
    }

    function getDocumentFromUrl() {
        const notePath = new URLSearchParams(window.location.search).get('note');
        return documents.find((document) => document.path === notePath);
    }

    function setUrl(document, mode) {
        const url = new URL(window.location.href);
        if (document) url.searchParams.set('note', document.path);
        else url.searchParams.delete('note');
        window.history[mode]({}, '', `${url.pathname}${url.search}${url.hash}`);
    }

    function resolveMarkdownLinks(container, markdownUrl) {
        container.querySelectorAll('a[href], img[src]').forEach((element) => {
            const attribute = element.tagName === 'IMG' ? 'src' : 'href';
            const value = element.getAttribute(attribute);
            if (!value || value.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('/')) return;

            const absoluteUrl = new URL(value, new URL(markdownUrl, window.location.origin));
            const matchingDocument = documents.find((document) => {
                const documentUrl = new URL(document.url, window.location.origin);
                return documentUrl.pathname === absoluteUrl.pathname;
            });

            if (matchingDocument && element.tagName === 'A') {
                element.href = `?note=${encodeURIComponent(matchingDocument.path)}`;
                element.dataset.markdownPath = matchingDocument.path;
            } else {
                element.setAttribute(attribute, absoluteUrl.href);
            }
        });
    }

    async function openDocument(document, historyMode) {
        if (!document) return;

        reader.hidden = false;
        readerTitle.textContent = document.title;
        readerPath.textContent = document.path;
        readerContent.innerHTML = '<p class="markdown-reader__loading">正在读取 Markdown…</p>';
        setUrl(document, historyMode || 'pushState');

        try {
            const response = await fetch(document.url, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const source = await response.text();
            readerContent.innerHTML = window.marked ? window.marked.parse(source) : `<pre>${escapeHtml(source)}</pre>`;
            resolveMarkdownLinks(readerContent, document.url);
            readerContent.querySelectorAll('pre code').forEach((block) => window.hljs && window.hljs.highlightElement(block));
            reader.scrollIntoView({ behavior: historyMode === 'popstate' ? 'auto' : 'smooth', block: 'start' });
        } catch (error) {
            readerContent.innerHTML = '<p class="markdown-reader__error">笔记无法加载，请稍后再试。</p>';
            console.error('Unable to load Markdown:', error);
        }
    }

    function closeDocument(historyMode) {
        reader.hidden = true;
        readerContent.replaceChildren();
        setUrl(null, historyMode || 'pushState');
    }

    directoryContainer.addEventListener('click', (event) => {
        const card = event.target.closest('[data-markdown-path]');
        if (!card) return;
        openDocument(documents.find((item) => item.path === card.dataset.markdownPath), 'pushState');
    });

    readerContent.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-markdown-path]');
        if (!link) return;
        event.preventDefault();
        openDocument(documents.find((item) => item.path === link.dataset.markdownPath), 'pushState');
    });

    closeButton.addEventListener('click', () => closeDocument('pushState'));
    window.addEventListener('popstate', () => {
        const document = getDocumentFromUrl();
        if (document) openDocument(document, 'replaceState');
        else closeDocument('replaceState');
    });

    fetch(indexUrl, { cache: 'no-cache' })
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then((manifest) => {
            documents = Array.isArray(manifest.documents) ? manifest.documents : [];
            renderDirectory();
            const document = getDocumentFromUrl();
            if (document) openDocument(document, 'replaceState');
        })
        .catch((error) => {
            directoryContainer.innerHTML = '<p class="markdown-library__error">目录索引暂时不可用。</p>';
            console.error('Unable to load Markdown index:', error);
        });
})();
