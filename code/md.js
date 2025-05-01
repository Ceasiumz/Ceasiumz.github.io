document.addEventListener('DOMContentLoaded', function () {
  console.log('md.js::DOM loading');
});

marked.setOptions({
  highlight: function (code, lang) {
    // 检测语言是否支持
    const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
    console.log('md.js::highlight: ' + validLang);
    return hljs.highlight(code, { language: validLang }).value;
  },
  langPrefix: 'hljs language-', // 生成的CSS类名前缀
  breaks: true
});

function loadMarkdown(url) {
  fetch(url)
    .then(res => res.text())
    .then(md => {
      const html = marked.parse(md);
      document.getElementById('markdown-container').innerHTML = html;

      // 手动触发代码块高亮（解决异步加载问题）
      document.querySelectorAll('pre code').forEach((block) => {
        const lang = block.className.split(' ').find(c => c.startsWith('language-'))?.replace('language-', '') || 'plaintext';
        
        // 添加语言名称到代码块右上角
        const pre = block.parentElement;
        const langLabel = document.createElement('div');
        langLabel.textContent = lang;
        langLabel.classList.add('code-lang-label'); // 添加样式类
        pre.classList.add('code-block-container'); // 确保父元素有样式类
        pre.appendChild(langLabel);

        hljs.highlightElement(block, { language: lang });
        // console.log('重新高亮代码块，语言:', lang); // 调试语句
    });
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