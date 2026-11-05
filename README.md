# MATH 213 · MT1 Cheatsheet

[在线阅读](https://BryceQian.github.io/Math213-MT1-Cheatsheet/)

基于 Mozilla PDF.js 的静态阅读页面，默认阅读仓库根目录的 `main.pdf`。支持连续滚动、上一页 / 下一页、页码跳转、缩放、适应宽度，以及带高亮和结果切换的全文搜索。桌面端与移动端均可使用，无需 Node.js 构建或后端服务。

## GitHub Pages 部署

1. 将本次新增及修改的文件提交并推送至 GitHub，包括完整的 `assets/`、`index.html`、`.nojekyll` 和根目录 `main.pdf`。
2. 打开仓库 **Settings → Pages**。
3. 在 **Build and deployment → Source** 选择 **Deploy from a branch**。
4. 选择 **main** 分支、**/ (root)** 目录并保存。如果使用其他发布分支，请选择实际存放这些文件的分支。
5. 等待 GitHub 的 Pages 部署完成，然后访问上方在线阅读入口。最终网址以 Settings → Pages 显示的地址为准。

这是仓库项目站点，网址带有 `/Math213-MT1-Cheatsheet/` 前缀。HTML、样式、PDF、worker 和字体均使用相对路径；JavaScript 内的辅助资源基于 `import.meta.url` 解析，因此也兼容用户主页站点与自定义域名。仓库更名或转移后请同步修改本 README 的在线阅读地址。

替换根目录 `main.pdf` 并推送即可更新阅读内容。原有 LaTeX 源文件与编译方式不变。当前修改只提供网站文件，不会自动开启仓库的 Pages 设置。

## 使用

- 在页码框输入有效页码并按 Enter 跳转；滚动时页码自动更新。
- 使用 `−` / `+` 调整缩放，或点击「适应宽度」。适应宽度模式会随窗口变化调整。
- 输入关键词后自动搜索；Enter / Shift + Enter 或搜索框旁的箭头切换结果。
- Ctrl + F / Command + F 聚焦文档搜索；在搜索框按 Escape 清空搜索并返回阅读区。
- 搜索依赖 PDF 自带文本；纯扫描图片需要先做 OCR。

## 本地预览与兼容性

线上运行只需 GitHub Pages 的静态托管。本地调试时可在仓库根目录运行 `python -m http.server 8000`，然后访问 `http://localhost:8000/`。不要直接双击 `index.html`，浏览器的 `file://` 安全限制会阻止模块和 PDF 请求。

请使用支持 ES modules、Web Workers 与现代 PDF.js API 的近期 Chrome、Edge、Firefox 或 Safari。阅读器使用官方 `legacy` 兼容构建，以提供所需的新 JavaScript API 补充；这不保证支持所有旧浏览器。加载失败时页面会提供重试提示。

## 文件与依赖

- `index.html`：阅读器入口及无障碍工具栏。
- `assets/reader.css`：响应式页面样式。
- `assets/reader.mjs`：PDF.js 渲染、导航、缩放、搜索及加载状态。
- `assets/pdfjs/`：未经修改的官方 `pdfjs-dist` **6.5.438** 运行文件，包括 `legacy/` 中配套的 core、worker、viewer 兼容组件，以及共享的 CSS、CMaps、标准字体、WASM、ICC 配置及图标。
- `assets/pdfjs/VERSION.json`：固定版本、官方包来源与 SHA-512 校验值；下载时已校验完整性。
- `assets/pdfjs/LICENSE` 及各资源目录中的许可证：保留上游许可声明。
- `.nojekyll`：直接发布静态资源。
- `.gitignore`：保留已有编译产物忽略规则，同时允许跟踪阅读器文件。

依赖来源：[Mozilla PDF.js 官方发行版](https://github.com/mozilla/pdf.js/releases/tag/v6.5.438)、[官方 npm 发行包](https://www.npmjs.com/package/pdfjs-dist/v/6.5.438)。运行时全部从本站加载，不依赖第三方 CDN。升级时应从同一官方发行包同步替换 core、worker、viewer 与配套资源，并更新版本记录，避免版本混用。

## 下载与打印说明

页面没有下载、打印按钮或 PDF 原文件链接，也不加载官方完整 viewer 的工具栏。隐藏这些入口只是降低普通用户下载的便利性，**不是 DRM 或版权保护措施**。浏览器仍需请求 PDF 原文件才能渲染，用户仍可通过网络请求、开发者工具、浏览器自身功能等方式获取或打印内容。
