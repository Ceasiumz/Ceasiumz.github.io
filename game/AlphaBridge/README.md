# AlphaBridge

新睿 CCBA v2.2 桥牌叫品图鉴与模拟台。React 纯前端，界面支持简体中文和英语。

## 本地运行

需要 Node.js 22（或 Vite 6 支持的 Node 版本）。

```sh
npm ci
npm run dev
```

`npm run build` 生成 `dist/`。用 `npm run preview` 验证生产构建和 Service Worker。部署时将 `dist/` 内容放到 HTTPS 静态站点目录，构建支持子路径。Chromium 可通过地址栏或浏览器菜单安装。

## 规则与扩展

- `src/auction.js` 实现独立于体系的合法叫品、终局和庄家判定。修改时间轴上的叫品时，保留修改后仍连续合法的记录。
- `src/ccba.js` 收录《新睿 CCBA 体系说明 v2.2》的常用序列。图鉴和模拟共用规则。合法叫品的释义取决于序列、座次和局况，未结构化的序列可查阅原文。
- 添加体系时，在 `src/systems.js` 注册带有 ID、双语名称、版本、原文 URL、图鉴 `library`、`rulesFor({dealer, calls, vulnerability})` 和 `referencePage(calls)` 的对象。规则可附带点力区间、牌型分类、特殊分支标记和原文页码。设置会从注册表列出可用体系。
