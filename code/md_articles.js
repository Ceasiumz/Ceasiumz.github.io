// 获取当前目录（以 / 结尾）
// const currentDir = 

// 确保 marked.js 正确加载并使用
if (typeof marked === 'undefined') {
  console.error('marked.js is not loaded. Please ensure it is included in the HTML.');
} else {
  console.log('marked.js is loaded successfully.');
}

// 渲染 Markdown 文件到指定的容器
async function loadMarkdownFiles() {
  try {
    const response = await fetch('/md_files.json');
    const files = await response.json();

    // 修正 currentDir 的路径格式，确保与 md_files.json 中的 url 一致
    const normalizedDir = `/Ceasiumz.github.io${window.location.pathname.replace(/[^/]+$/, '')}`;

    // 过滤出当前目录下的 md 文件
    const filtered = files.filter(file => file.url.startsWith(normalizedDir));

    // 返回名字（相对当前目录）和绝对 url
    const result = filtered.map(file => ({
      name: file.url.replace(normalizedDir, ''), // 相对当前目录的文件名
      url: file.url.replace(normalizedDir, ''), // 相对当前目录的文件名
      // url: file.url                             // 绝对 url
    }));

    console.log(result);

    // 渲染到页面
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
          container.id = 'markdown-container'; // 设置容器 ID
          container.innerHTML = marked.parse(markdownContent); // 使用 marked 解析 Markdown
          console.log('Navigating to:', file.url);
          window.history.pushState({ path: file.url }, '', '');
          window.addEventListener('popstate', async (event) => {
            console.log('just now md: '+ file.url);
        });
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

// 调用函数加载 Markdown 文件
loadMarkdownFiles();