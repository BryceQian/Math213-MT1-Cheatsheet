# MATH 213 · MT1 Cheatsheet

[在线阅读](https://BryceQian.github.io/Math213-MT1-Cheatsheet/)

直接使用 **Mozilla PDF.js 官方完整阅读器 6.5.438（legacy 兼容发行包）**，默认打开仓库根目录的 `main.pdf`。首页直接显示阅读器，没有中间跳转，不经过浏览器原生 PDF Viewer，也不在地址栏传入 PDF 原文件链接。侧边栏默认关闭，需要时可手动打开。

工具栏、搜索、页码跳转、缩放、适应宽度、连续滚动、双指手势及渲染均由官方成品提供。没有自定义手势、缩放算法、Canvas 渲染循环或前端框架；此前的自定义阅读页面、手势模块及其测试已移除。

## GitHub Pages 部署

1. 提交并推送完整的 `assets/`、`index.html`、`.nojekyll` 和根目录 `main.pdf`。
2. 打开仓库 **Settings → Pages**。
3. 选择 **Deploy from a branch → main → / (root)**，保存。
4. 等待部署完成，访问上方在线阅读入口。已启用此配置的仓库会在推送后自动更新。

无需构建、Node.js 或后端。入口、阅读器资源和默认 PDF 均使用相对路径，兼容 `/Math213-MT1-Cheatsheet/` 项目站点前缀、用户主页站点及自定义域名。仓库更名或转移后请修改本 README 的在线入口。

替换根目录 `main.pdf` 并推送即可更新内容。原有 LaTeX 文件及编译方式不变。

## 使用与兼容性

- 使用官方工具栏翻页、跳转页码、缩放或选择「适应宽度」。
- 使用搜索按钮或 Ctrl + F / Command + F 搜索 PDF 文本；扫描图片需先做 OCR。
- 移动端手势及性能策略沿用官方实现，实际体验取决于设备和浏览器。iPhone / iPad 的微信内置浏览器若体验受限，可从微信菜单选择「在 Safari 中打开」。本站没有额外叠加微信手势补丁。
- 请使用近期的 Safari、Chrome、Edge 或 Firefox。`legacy` 构建包含兼容补充，但不能保证支持所有旧浏览器或内置 WebView。
- 更新后若仍看到旧界面，请刷新或关闭旧页面重新打开。

本地预览：在仓库根目录运行 `python -m http.server 8000`，访问 `http://localhost:8000/`。直接双击 HTML 的 `file://` 访问不受支持。

## 文件与上游来源

- `index.html`：官方阅读器 HTML 的首页入口，仅适配资源引用路径，直接显示阅读器。
- `assets/pdfjs/`：来自[官方 6.5.438 release](https://github.com/mozilla/pdf.js/releases/tag/v6.5.438) 的完整 legacy 运行文件，含 viewer、core、worker、字体、CMaps、WASM、图标及全部语言包。
- `assets/pdfjs/web/viewer.html`：保留官方 HTML，仅修改标题并引用以下两个站点配置文件；旧的深层阅读器链接仍可使用。
- `assets/viewer-config.js`：通过官方 `webviewerloaded` 启动钩子配置资源路径、默认 PDF、默认关闭侧边栏，以及只读、隐藏下载和打印的官方选项。
- `assets/viewer-overrides.css`：仅隐藏下载、打印、打开本地文件、页面导出和编辑入口，不改动布局和手势样式。
- `assets/pdfjs/VERSION.json`：来源、GitHub release 的 SHA-256 校验值和集成改动记录。
- `assets/pdfjs/LICENSE` 及资源目录许可证：保留上游许可声明。
- `.nojekyll`：直接发布静态资源。

官方 viewer/core/worker 的 JavaScript 和渲染 CSS 均未经修改。仅省略开发用 source maps 和官方演示 PDF；运行资源全部从本站加载，无 CDN 依赖。升级时整体替换同一官方发行包，向 `web/viewer.html` 加回两个配置文件引用和标题，再将其复制到根目录 `index.html` 并调整六处资源引用路径，更新版本记录。

## 下载与打印说明

隐藏下载、打印按钮和原文件入口只是降低普通用户下载的便利性，**不是 DRM 或版权保护措施**。浏览器仍需获取 PDF 才能渲染，用户仍可通过网络请求、开发者工具或浏览器自身功能获取、打印内容。
