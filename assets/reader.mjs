const byId = id => document.getElementById(id);
const container = byId("viewer-container");
const pageInput = byId("page-number");
const searchInput = byId("search-input");
const loading = byId("loading-status");
const controls = [...document.querySelectorAll(".toolbar button, .toolbar input, .search button, .search input")];
const assetUrl = path => new URL(`./pdfjs/${path}`, import.meta.url).href;
let ready = false;

function showError(error) {
  console.error("PDF reader:", error);
  ready = false;
  controls.forEach(control => { control.disabled = true; });
  loading.hidden = true;
  container.setAttribute("aria-busy", "false");
  byId("reading-status").textContent = "加载失败";
  byId("error-detail").textContent = location.protocol === "file:"
    ? "请通过 GitHub Pages 或 HTTP(S) 访问页面；浏览器不支持直接双击 HTML 加载 PDF 模块。"
    : "请确认仓库根目录存在 main.pdf、网站资源已完整部署，或检查网络连接后重试。";
  byId("error-message").hidden = false;
}

byId("retry").addEventListener("click", () => location.reload());

async function initialize() {
  if (location.protocol === "file:") throw new Error("HTTP(S) is required");
  // Load the official core before the viewer component, which reads pdfjsLib.
  const pdfjs = await import("./pdfjs/legacy/build/pdf.mjs");
  const { EventBus, PDFViewer, PDFLinkService, PDFFindController, FindState } =
    await import("./pdfjs/legacy/web/pdf_viewer.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = assetUrl("legacy/build/pdf.worker.mjs");

  const eventBus = new EventBus();
  const linkService = new PDFLinkService({ eventBus });
  const findController = new PDFFindController({ eventBus, linkService });
  const viewer = new PDFViewer({
    container,
    viewer: byId("viewer"),
    eventBus,
    linkService,
    findController,
    // A reading surface only: no attachment actions, form actions or PDF scripts.
    annotationMode: pdfjs.AnnotationMode.DISABLE,
    enableAutoLinking: false,
    imageResourcesPath: assetUrl("web/images/"),
    maxCanvasPixels: 16_777_216,
    maxCanvasDim: 8192,
  });
  linkService.setViewer(viewer);

  function updateNavigation() {
    pageInput.value = viewer.currentPageNumber;
    byId("previous-page").disabled = !ready || viewer.currentPageNumber <= 1;
    byId("next-page").disabled = !ready || viewer.currentPageNumber >= viewer.pagesCount;
    byId("reading-status").textContent = `第 ${viewer.currentPageNumber} 页 / 共 ${viewer.pagesCount} 页`;
  }

  eventBus.on("pagesinit", () => {
    ready = true;
    controls.forEach(control => { control.disabled = false; });
    pageInput.max = viewer.pagesCount;
    byId("page-count").textContent = viewer.pagesCount;
    viewer.currentScaleValue = "page-width";
    updateNavigation();
  });
  eventBus.on("pagerendered", ({ error }) => {
    if (error) return showError(error);
    loading.hidden = true;
    container.setAttribute("aria-busy", "false");
  });
  eventBus.on("pagechanging", updateNavigation);
  eventBus.on("scalechanging", ({ scale }) => {
    byId("zoom-value").textContent = `${Math.round(scale * 100)}%`;
    byId("fit-width").setAttribute("aria-pressed", String(viewer.currentScaleValue === "page-width"));
    byId("zoom-out").disabled = scale <= 0.25;
    byId("zoom-in").disabled = scale >= 5;
  });

  byId("previous-page").addEventListener("click", () => viewer.previousPage());
  byId("next-page").addEventListener("click", () => viewer.nextPage());
  byId("page-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!ready) return;
    const page = Number(pageInput.value);
    if (Number.isInteger(page) && page >= 1 && page <= viewer.pagesCount) {
      viewer.currentPageNumber = page;
      container.focus({ preventScroll: true });
    }
    updateNavigation();
  });
  function zoom(factor) {
    if (ready) viewer.currentScale = Math.min(5, Math.max(0.25, viewer.currentScale * factor));
  }
  byId("zoom-out").addEventListener("click", () => zoom(1 / 1.2));
  byId("zoom-in").addEventListener("click", () => zoom(1.2));
  byId("fit-width").addEventListener("click", () => { viewer.currentScaleValue = "page-width"; });
  // Keep page-width mode responsive to viewport and toolbar changes.
  new ResizeObserver(() => {
    if (ready && viewer.currentScaleValue === "page-width") viewer.currentScaleValue = "page-width";
  }).observe(container);

  function find(type = "", findPrevious = false) {
    if (!ready) return;
    eventBus.dispatch("find", {
      source: searchInput, type, query: searchInput.value,
      phraseSearch: true, caseSensitive: false, entireWord: false,
      highlightAll: true, findPrevious, matchDiacritics: false,
    });
    if (!searchInput.value.trim()) byId("search-status").textContent = "";
  }
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => find(), 180);
  });
  searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      clearTimeout(searchTimer);
      find("again", event.shiftKey);
    }
  });
  byId("search-form").addEventListener("submit", event => {
    event.preventDefault();
    clearTimeout(searchTimer);
    find("again");
  });
  byId("search-previous").addEventListener("click", () => {
    clearTimeout(searchTimer);
    find("again", true);
  });
  function updateMatches({ current, total }) {
    byId("search-status").textContent = searchInput.value.trim()
      ? (total ? `${current} / ${total} 处匹配` : "未找到匹配") : "";
  }
  eventBus.on("updatefindmatchescount", ({ matchesCount }) => updateMatches(matchesCount));
  eventBus.on("updatefindcontrolstate", ({ state, matchesCount }) => {
    if (state === FindState.PENDING && searchInput.value.trim()) {
      byId("search-status").textContent = "正在搜索…";
    } else updateMatches(matchesCount);
  });
  document.addEventListener("keydown", event => {
    if (!ready) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (event.key === "Escape" && document.activeElement === searchInput) {
      clearTimeout(searchTimer);
      searchInput.value = "";
      find();
      container.focus({ preventScroll: true });
    }
  });

  const task = pdfjs.getDocument({
    // Relative to the page, so project Pages subpaths and custom domains both work.
    url: new URL("./main.pdf", document.baseURI).href,
    cMapUrl: assetUrl("cmaps/"), cMapPacked: true,
    standardFontDataUrl: assetUrl("standard_fonts/"),
    wasmUrl: assetUrl("wasm/"), iccUrl: assetUrl("iccs/"),
    isEvalSupported: false,
  });
  task.onProgress = ({ loaded, total }) => {
    loading.textContent = total ? `正在加载文档… ${Math.min(100, Math.round(loaded / total * 100))}%` : "正在加载文档…";
  };
  const pdf = await task.promise;
  linkService.setDocument(pdf);
  viewer.setDocument(pdf);
}

initialize().catch(showError);
