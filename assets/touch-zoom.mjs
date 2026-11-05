export const MIN_SCALE = 0.25;
export const MAX_SCALE = 5;

// Use PDF.js's own gesture recognizer and anchored page zoom, as its full viewer
// does. Keep native one-finger scrolling; only two-finger gestures are captured.
export function bindTouchZoom({ container, viewer, TouchManager, isEnabled }) {
  const lifetime = new AbortController();
  let unusedFactor = 1;
  const manager = new TouchManager({
    container,
    signal: lifetime.signal,
    isPinchingDisabled: () => !isEnabled(),
    onPinching(origin, previousDistance, distance, dx, dy) {
      if (!isEnabled()) return;
      // PDFViewer rounds scale to two decimals. Carry the remainder forward so
      // slow gestures still work when starting from a small, fit-width scale.
      const target = Math.min(MAX_SCALE, Math.max(MIN_SCALE,
        viewer.currentScale * distance / previousDistance * unusedFactor));
      const scale = Math.round(target * 100) / 100;
      unusedFactor = target / scale;
      viewer.updateScale({
        scaleFactor: scale / viewer.currentScale,
        origin,
        pan: [dx, dy],
        // Reuse the current canvas during rapid updates, then render sharply.
        drawingDelay: 100,
      });
    },
    onPanning(dx, dy) {
      if (isEnabled()) viewer.panBy(dx, dy);
    },
    onPinchEnd() { unusedFactor = 1; },
  });
  return () => {
    manager.destroy();
    lifetime.abort();
  };
}
