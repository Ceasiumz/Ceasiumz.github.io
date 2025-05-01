import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 支持多个文件夹
const imgDirs = [
  join(__dirname, 'gallery')
  // 可以继续添加其它目录
];
const output = join(__dirname, 'image_files.json');

function walk(dir) {
  let results = [];
  if (!readdirSync(dir, { withFileTypes: false })) return results;
  const list = readdirSync(dir);
  list.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (/\.(png|jpg|jpeg|webp|gif)$/i.test(file)) {
      results.push(filePath);
    }
  });
  return results;
}

// 合并所有目录下的图片文件
let files = [];
imgDirs.forEach(dir => {
  files = files.concat(walk(dir));
});

const fileObjs = files.map(fullPath => {
  const relPath = relative(join(__dirname, '..'), fullPath).replace(/\\/g, '/');
  return {
    name: basename(fullPath),
    url: '/' + relPath
  };
});

writeFileSync(output, JSON.stringify(fileObjs, null, 2), 'utf-8');
console.log(`Generated ${output} with ${fileObjs.length} image files.`);