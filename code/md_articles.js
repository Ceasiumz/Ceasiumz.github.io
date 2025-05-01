// 获取当前目录（以 / 结尾）
const currentDir = window.location.pathname.replace(/[^/]+$/, '');

// 加载 md_files.json 并筛选当前目录下的 md 文件
fetch('/md_files.json')
  .then(res => res.json())
  .then(files => {
    // 过滤出当前目录下的 md 文件
    const filtered = files.filter(file => file.url.startsWith(currentDir));
    // 返回名字（相对当前目录）和绝对 url
    const result = filtered.map(file => ({
      name: file.url.replace(currentDir, ''), // 相对当前目录的文件名
      url: file.url                           // 绝对 url
    }));
    console.log(result);
    // 你可以在这里进一步处理 result，比如渲染到页面
  });