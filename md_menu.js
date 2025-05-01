import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 支持多个文件夹
const mdDirs = [
  join(__dirname, 'article')
  // 可以继续添加其它目录
];
const output = join(__dirname, 'md_files.json');

function walk(dir) {
  let results = [];
  if (!readdirSync(dir, { withFileTypes: false })) return results;
  const list = readdirSync(dir);
  list.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

// 合并所有目录下的 md 文件
let files = [];
mdDirs.forEach(dir => {
  files = files.concat(walk(dir));
});

const fileObjs = files.map(fullPath => {
  const relPath = relative(join(__dirname, '..'), fullPath).replace(/\\/g, '/');
  return {
    name: basename(fullPath, '.md'),
    url: '/' + relPath
  };
});

writeFileSync(output, JSON.stringify(fileObjs, null, 2), 'utf-8');
console.log(`Generated ${output} with ${fileObjs.length} markdown files.`);