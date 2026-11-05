import assert from "node:assert/strict";
import test from "node:test";
import { bindTouchZoom, MIN_SCALE, MAX_SCALE } from "../assets/touch-zoom.mjs";

// These tests exercise real PDF.js touch recognition, without canvas rendering.
// Node has no canvas types; placeholders permit importing its browser build.
globalThis.DOMMatrix ??= class {};
globalThis.Path2D ??= class {};
globalThis.devicePixelRatio = 2;
const { TouchManager } = await import("../assets/pdfjs/legacy/build/pdf.mjs");

function setup(t, scale = 1) {
  const container = new EventTarget();
  let enabled = true;
  const updates = [], pans = [];
  const viewer = {
    currentScale: scale,
    updateScale(options) {
      updates.push(options);
      this.currentScale = Math.round(this.currentScale * options.scaleFactor * 100) / 100;
    },
    panBy(dx, dy) { pans.push([dx, dy]); },
  };
  const destroy = bindTouchZoom({ container, viewer, TouchManager, isEnabled: () => enabled });
  t.after(destroy);
  const touch = (identifier, x, y = 100) => ({ identifier, clientX: x, clientY: y, screenX: x, screenY: y });
  const pair = (span, center = 150, y = 100) => [touch(1, center - span / 2, y), touch(2, center + span / 2, y)];
  function send(type, touches, changedTouches = touches, cancelable = true) {
    const event = new Event(type, { cancelable });
    Object.assign(event, { touches, changedTouches });
    container.dispatchEvent(event);
    return event;
  }
  return { viewer, updates, pans, touch, pair, send, destroy, disable() { enabled = false; } };
}

test("one finger scrolls natively; two fingers zoom around their previous midpoint", t => {
  const { send, touch, pair, viewer, updates, pans } = setup(t);
  assert.equal(send("touchstart", [touch(1, 100)]).defaultPrevented, false);
  assert.equal(send("touchmove", [touch(1, 120)]).defaultPrevented, false);
  assert.equal(viewer.currentScale, 1);
  const touches = pair(100);
  assert.equal(send("touchstart", touches, [touches[1]]).defaultPrevented, true);
  send("touchmove", pair(140)); // PDF.js confirms an intentional pinch first.
  send("touchmove", pair(180, 160, 110));
  assert.equal(viewer.currentScale, 1.29);
  assert.deepEqual(updates.at(-1).origin, [150, 100]);
  assert.deepEqual(updates.at(-1).pan, [10, 10]);
  assert.equal(updates.at(-1).drawingDelay, 100);
  const previousScale = viewer.currentScale;
  send("touchmove", pair(180, 170, 120));
  assert.equal(viewer.currentScale, previousScale);
  assert.deepEqual(pans.at(-1), [10, 10]);
  send("touchend", [touch(1, 80)], [touch(2, 260)]);
  assert.equal(send("touchmove", [touch(1, 100)]).defaultPrevented, false);
});

test("pinch zoom respects the same upper and lower bounds as toolbar buttons", t => {
  const { send, pair, viewer, updates } = setup(t, 4.8);
  send("touchstart", pair(100));
  send("touchmove", pair(140));
  send("touchmove", pair(180));
  assert.equal(viewer.currentScale, MAX_SCALE);
  send("touchmove", pair(220, 160, 110));
  assert.equal(viewer.currentScale, MAX_SCALE);
  assert.deepEqual(updates.at(-1).pan, [10, 10]);
  send("touchend", []);
  viewer.currentScale = 0.3;
  send("touchstart", pair(400));
  send("touchmove", pair(300));
  send("touchmove", pair(200));
  assert.equal(viewer.currentScale, MIN_SCALE);
});

test("slow pinch movements accumulate instead of disappearing through rounding", t => {
  const { send, pair, viewer } = setup(t, 0.3);
  send("touchstart", pair(300));
  send("touchmove", pair(320));
  for (let span = 323; span <= 350; span += 3) send("touchmove", pair(span));
  assert.equal(viewer.currentScale, 0.33);
});

test("cancellation releases the gesture and resets rounding for the next pinch", t => {
  const { send, pair, viewer, updates } = setup(t, 0.41);
  function pinch() {
    send("touchstart", pair(100));
    send("touchmove", pair(140));
    send("touchmove", pair(180));
  }
  pinch();
  assert.equal(viewer.currentScale, 0.53);
  send("touchcancel", []);
  const count = updates.length;
  send("touchmove", pair(250));
  assert.equal(updates.length, count);
  viewer.currentScale = 0.41;
  pinch();
  assert.equal(viewer.currentScale, 0.53);
});

test("disabled, non-cancelable and disposed gestures do not change zoom", t => {
  const { send, pair, viewer, disable, destroy } = setup(t);
  send("touchstart", pair(100), pair(100), false);
  send("touchmove", pair(140), pair(140), false);
  send("touchmove", pair(180), pair(180), false);
  assert.equal(viewer.currentScale, 1);
  send("touchcancel", []);
  disable();
  assert.equal(send("touchstart", pair(100)).defaultPrevented, false);
  send("touchmove", pair(180));
  assert.equal(viewer.currentScale, 1);
  destroy();
  assert.equal(send("touchstart", pair(100)).defaultPrevented, false);
});
