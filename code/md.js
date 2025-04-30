document.addEventListener('DOMContentLoaded', function () {
    console.log('md.js::DOM loading');
});
function loadMarkdown(url) {
    fetch(url)
        .then(res => res.text())
        .then(md => {
            document.getElementById('markdown-container').innerHTML = marked.parse(md);
        });
}



console.log('md.js::NATW');

// get current url
var currentUrl = window.location.href;
console.log('md.js::currentUrl: ' + currentUrl);
if (currentUrl.indexOf('code') > -1) {
    console.log('md.js::Csharp');
    loadMarkdown('/article/Csharp/Csharp_instru4_28.md');
} else {
    console.log('md.js::loadReadmeMarkdown');
    // 加载本文件夹的 README.md
    var folder = location.pathname.replace(/\/$/, '');
    loadMarkdown(folder + '/README.md');
}

import { readdirSync } from 'fs';

import { extname } from 'path';

function getMarkdownFiles(dir) {
  return readdirSync(dir).filter(file => 
    extname(file) === '.md'
  );
}

const files = getMarkdownFiles('/data/markdown');
const baseUrl = '/';

const urls = files.map(file => ({
  name: path.basename(file, '.md'),
  url: baseUrl + path.relative('/data/markdown', file).replace(/\\/g, '/')
}));
console.log(urls);