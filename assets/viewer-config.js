// Configure the complete official viewer through its documented startup hook.
// Gesture handling, zooming, scrolling and rendering stay entirely upstream.
const assetsUrl = new URL("./", document.currentScript.src);
const assetUrl = path => new URL(path, assetsUrl).href;
document.addEventListener("webviewerloaded", event => {
  event.detail.source.PDFViewerApplicationOptions.setAll({
    defaultUrl: new URL("../main.pdf", assetsUrl).href,
    // Resolve from this configuration file, for both root and nested entrypoints.
    cMapUrl: assetUrl("pdfjs/web/cmaps/"),
    standardFontDataUrl: assetUrl("pdfjs/web/standard_fonts/"),
    iccUrl: assetUrl("pdfjs/web/iccs/"),
    wasmUrl: assetUrl("pdfjs/web/wasm/"),
    imageResourcesPath: assetUrl("pdfjs/web/images/"),
    workerSrc: assetUrl("pdfjs/build/pdf.worker.mjs"),
    rendererSrc: assetUrl("pdfjs/build/pdf.renderer.mjs"),
    sandboxBundleSrc: assetUrl("pdfjs/build/pdf.sandbox.mjs"),
    debuggerSrc: assetUrl("pdfjs/web/debugger.mjs"),
    sidebarViewOnLoad: 0, // Official SidebarView.NONE; overrides saved/sidebar PDF state.
    disablePreferences: true,
    supportsDownloading: false,
    supportsPrinting: false,
    annotationEditorMode: -1,
    enableScripting: false,
  });
}, { once: true });
