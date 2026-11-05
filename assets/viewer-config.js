// Configure the complete official viewer through its documented startup hook.
// Gesture handling, zooming, scrolling and rendering stay entirely upstream.
document.addEventListener("webviewerloaded", event => {
  event.detail.source.PDFViewerApplicationOptions.setAll({
    defaultUrl: new URL("../../../main.pdf", document.baseURI).href,
    disablePreferences: true,
    supportsDownloading: false,
    supportsPrinting: false,
    annotationEditorMode: -1,
    enableScripting: false,
  });
}, { once: true });
