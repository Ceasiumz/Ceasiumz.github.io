# AlphaBridge

手机竖屏优先的桥牌叫牌助手。基于 React 与 Vite，内置新睿 CCBA v2.2 规则，支持简体中文和英语。

## 本地运行

使用 Node.js 22。

```sh
npm ci
npm run dev
```

开发端口默认是 5173。`npm run build` 生成 `dist/`，之后可用 `npm run preview:site` 预览静态网页。将 `dist/` 内容部署到 HTTPS 静态站点即可从 Chromium 的安装入口安装。相对资源路径支持站点子目录。

## 场景与组件

| 文件 | 职责 |
| --- | --- |
| `src/main.jsx` | 入口、主菜单、语言和设置。用 URL hash 切换子场景，浏览器后退键可返回上一个场景。 |
| `src/library.jsx` | 叫品图鉴、筛选和释义。体系 PDF 的入口集中在关于页。 |
| `src/simulator.jsx` | 开局配置、合法叫品网格、互动叫牌、时间轴、复盘和历史列表。只有玩家自己的回合提供互动叫牌。牌局配置可通过左下角齿轮查看。 |
| `src/ui.jsx`、`src/copy.js`、`src/style.css` | 共用叫品和弹窗组件、双语文案与手机优先的布局。 |
| `src/auction.js` | 纯函数计算座位、合法叫品、定约与庄家。编辑历史叫品时，保留后续仍连续合法的叫牌。 |
| `src/cache.js` | 保存授权、本地数据读写、旧设置迁移和牌局记录校验。 |
| `build-sw.mjs` | 构建后生成 Service Worker，缓存版本化的静态资源。牌局与设置的保存由本机存储授权单独控制。 |

## 牌局与本机存储

设置和牌局共用一个版本化的 `localStorage` 记录。每局保存配置、体系 ID、叫牌序列和更新时间。打出第一声后即可在模拟历史中查看，未结束的局可以继续，已结束的局可以复盘。修改或撤回叫牌会更新同一局，开新局会保留旧局。

应用先询问是否允许保存。允许后，刷新可恢复设置与历史。拒绝时仅记住授权选择，设置和牌局保留在当前页面内存中。可在设置中清除本机记录并停用保存。首次允许保存时，应用会导入旧版设置，同时保留本次访问已调整的选项。应用不向服务器发送牌局或设置。

## 扩展叫牌体系

`src/ccba.js` 将常用 CCBA 规则整理为可按序列匹配的数据，图鉴和模拟共用。新增体系时，在 `src/systems.js` 注册唯一 ID、双语名称、版本、来源、`library`、`rulesFor({dealer, calls, vulnerability})` 和 `referencePage(calls)`。规则可包含点力区间、牌型分类、特殊分支和出处页码。设置自动列出已注册体系，历史牌局按各自保存的体系 ID 解释。

## 匿名反馈部署

反馈接口位于 `feedback/worker.js`。访客提交正文后，Worker 用 `Ceasiumz` 的专用令牌创建公开 Issue。Issue 作者为 `Ceasiumz`，正文包含访客填写的内容。接口按来源检查请求，按访客 IP 和站点限流。Cloudflare 限流按数据中心分别计数。

在 AlphaBridge 目录运行以下 npm 脚本。脚本用 `npm run build` 调用 `package.json` 里的构建任务。只有构建成功，`&&` 后面的 Wrangler 命令才会执行。

| 命令 | 用途 |
| --- | --- |
| `npm run deploy` | 构建前端后，按 `feedback/wrangler.toml` 把反馈 Worker 部署到 Cloudflare。需先完成 Cloudflare 认证。 |
| `npm run preview` | 构建前端后，在本机启动反馈 Worker。Wrangler 默认监听 8787，可测试 `/feedback`。 |

前端的 `dist/` 由 GitHub Pages 发布。Wrangler 负责反馈接口。 [Wrangler 命令说明](https://developers.cloudflare.com/workers/wrangler/commands/workers/)

如果终端当前位于 `Ceasiumz.github.io` 仓库根目录，运行 `npm --prefix game/AlphaBridge run deploy`。这条命令会读取项目自带的 `feedback/wrangler.toml` 并部署 `alphabridge-feedback`。如果 Wrangler 询问框架、输出目录和构建命令，退出自动配置后改用这条命令。

1. 使用 `Ceasiumz` 登录 GitHub，创建 [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)。仓库仅选择 `Ceasiumz.github.io`，仓库权限选择 `Issues: Read and write`。
2. 用 Wrangler 4.119 或更新版本登录 Cloudflare。设备授权模式可以跳过本机的 `localhost:8976` 回调。确认 `whoami` 显示正确账号后，部署 Worker，然后在提示中输入令牌。令牌只存入 Worker 的 secret。

   ```sh
   npx wrangler@4 login --device --browser=false
   npx wrangler@4 whoami
   npm run deploy
   npx wrangler@4 secret put GITHUB_ISSUES_TOKEN --config feedback/wrangler.toml
   ```

3. 在 GitHub 仓库的 Actions Variables 中设置 `VITE_FEEDBACK_URL` 为 Worker 的公开 HTTPS 地址，末尾加 `/feedback`，然后重新运行 Pages 发布流程。使用自定义域名时，同步更新 `feedback/wrangler.toml` 的 `SITE_ORIGIN`。反馈表单始终提供 GitHub Issue 草稿入口，配置接口后同时启用匿名提交。

如果设备授权在生成设备码前返回 HTML 403，可在 Cloudflare 控制台用 **Edit Cloudflare Workers** 模板为目标账号创建 API Token。在当前 PowerShell 会话设置 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`，再运行第 2 步中的 `whoami`、`deploy` 和 `secret put`。Cloudflare API Token 用来部署 Worker，`GITHUB_ISSUES_TOKEN` 是另一个由 GitHub 签发的令牌。 [Cloudflare API Token 配置](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/#api-token)

图鉴展示约定叫的简明示例。模拟按本方叫品的顺序和叫牌者匹配应叫与再叫，普通 Pass 和对方插叫可以穿插。特定竞争规则优先解释同一个叫品，逆朱瑞和平衡位置等约定仍检查各自的 Pass 条件。候选叫品由当前牌局的合法叫品范围约束。

## TODOs

1. 第三轮之后的叫品
2. 图鉴中更好的术语提示
3. 测试版上线
