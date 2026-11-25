const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function element(properties = {}) {
  return {
    ...properties,
    handlers: {},
    attributes: {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
  };
}

const path = require("node:path");
const root = path.resolve(__dirname, "..");
const script = fs.readFileSync(path.join(root, "src/playground.js"), "utf8");
for (const asset of ["pets/spritesheet-v2.png", "assets/classic.webp", "assets/vertical-poses.webp"]) {
  assert(fs.statSync(path.join(root, asset)).size > 0);
  assert(script.includes(asset));
}
const paint = [];
let clipY = null;
let pendingClipY = null;
const context2d = {
  createLinearGradient() { return { addColorStop() {} }; },
  fillRect() {}, beginPath() {}, ellipse() {}, arc() {}, stroke() {}, fill() {},
  save() {}, restore() { clipY = null; },
  rect(x,y,w,h) { pendingClipY = h; },
  clip() { clipY = pendingClipY; },
  drawImage(image, sx, sy, sw, sh, x, y, w, h) {
    paint.push({ image, col: sx / sw, row: sy / sh, x, y, w, h, clipY });
  },
};
const arena = element({
  width: 660,
  height: 440,
  focus() {},
  setPointerCapture(id) { this.pointerId = id; },
  hasPointerCapture(id) { return this.pointerId === id; },
  releasePointerCapture() { this.pointerId = null; },
  getContext: () => context2d,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 660, height: 440 }),
});
const state = element(), compare = element(), progress = element(), prompt = element(), practice = element();
const nodes = { arena, state, compare, progress, prompt, practice };
const buttons = Array.from({length: 9}, (_, row) => element({ dataset: { row: String(row) } }));
const specialButtons = ["fly","burrow"].map(special => element({ dataset: { special } }));
const windowHandlers = {};
let currentTime = 0;
let nextFrame;
const browser = {
  Image: class { complete = true; naturalWidth = 1536; },
  HTMLButtonElement: class {},
  document: {
    getElementById: name => nodes[name],
    querySelectorAll: selector => selector === "[data-row]" ? buttons : specialButtons,
  },
  matchMedia: () => ({ matches: false }),
  performance: { now: () => currentTime },
  addEventListener: (name, fn) => windowHandlers[name] = fn,
  requestAnimationFrame: fn => nextFrame = fn,
};
vm.runInNewContext(script, browser);

function tick(milliseconds = 16) {
  currentTime += milliseconds;
  nextFrame(currentTime);
  return paint.at(-1);
}
function key(handler, code) {
  arena.handlers[handler]({ code, preventDefault() {} });
}
function point(name, x, y, pointerId = 1) {
  arena.handlers[name]({ clientX:x, clientY:y, pointerId, button:0 });
}

const originalPosition = tick().x;
assert.equal(state.textContent, "待机");
arena.handlers.pointermove({ clientX: 343, clientY: 15 });
assert.equal(tick(360).row, 9);
assert.equal(state.textContent, "视线跟随");
arena.handlers.pointerleave();
practice.handlers.click();
point("pointerdown",330,180);
point("pointermove",335,180);
point("pointerup",335,180);
assert.equal(tick().row,3);
assert.equal(progress.value,1);
key("keydown","ArrowRight");
assert.equal(tick().row,1);
assert(tick().x > originalPosition);
key("keyup","ArrowRight");
key("keydown","ArrowLeft");
const leftX = tick().x;
assert.equal(tick().row,2);
assert(tick().x < leftX);
key("keyup","ArrowLeft");
key("keydown","Space");
assert.equal(tick().row,4);
buttons[7].handlers.click();
assert.equal(tick().row,7);
assert.equal(progress.value,5);
assert(prompt.textContent.startsWith("跟练完成。"));

const revised = tick().image;
compare.handlers.click();
assert.notEqual(tick().image,revised);
assert.equal(compare.attributes["aria-pressed"],"true");
compare.handlers.click();
assert.equal(tick().image,revised);
for (const [i, button] of buttons.entries()) {
  button.handlers.click();
  assert.equal(tick().row,i);
  assert.equal(button.attributes["aria-pressed"],"true");
}
assert.equal(tick(1600).row,0);
key("keydown","ArrowRight");
key("keydown","ArrowLeft");
const leftStart = tick().x;
assert.equal(tick().row,2);
assert(tick().x < leftStart);
key("keyup","ArrowLeft");
assert.equal(tick().row,1);
arena.handlers.blur();
assert.equal(tick().row,0);
assert(!windowHandlers.keydown);
point("pointerdown",330,190);
const dragStart = tick().x;
point("pointermove",400,195);
assert.equal(tick().row,1);
assert(tick().x > dragStart + 50);
point("pointermove",300,195);
assert.equal(tick().row,2);
assert(tick().x < dragStart);
point("pointerup",300,195);
assert.notEqual(state.textContent,"招呼");

function recordVertical(dy, name) {
  point("pointerdown",330,190);
  point("pointermove",333,190+dy);
  const start = currentTime;
  point("pointerup",333,190+dy);
  const motion = [];
  for (let i = 0; i < 26; i++) {
    const frame = tick(50);
    const {image, ...geometry} = frame;
    motion.push({...geometry, ms:currentTime-start, label:state.textContent, special:image !== revised});
  }
  assert.equal(motion[0].label,name);
  assert(motion.slice(0,18).every(frame => frame.label === name));
  assert(!motion.some(frame => frame.label === "招呼"));
  assert.equal(motion.at(-1).y,73);
  return motion;
}
const fly = recordVertical(-63,"一飞冲天");
assert(fly.some(frame => frame.y + frame.h < 0));
assert(fly.every(frame => frame.clipY === null));
const burrow = recordVertical(66,"遁地");
assert(burrow.some(frame => frame.y > frame.clipY && frame.clipY === 343));
assert(burrow.filter(frame => frame.special).every(frame => frame.clipY === 343));
key("keydown","ArrowUp");
assert.equal(tick().row,0);
assert.equal(state.textContent,"一飞冲天");
tick(1400);
specialButtons[1].handlers.click();
assert.equal(tick().row,1);
assert.equal(state.textContent,"遁地");
tick(1400);
point("pointerdown",330,190);
point("pointercancel",330,190);
assert.notEqual(tick().row,3);
assert.equal(revised.src,"pets/spritesheet-v2.png");
assert(paint.every(frame => frame.row >= 0 && frame.row <= 10 && frame.col >= 0 && frame.col <= 7));
console.log("Interaction logic passed: horizontal drag, fly exit/return, clipped burrow, taps, keyboard, five-step practice and edition switch");
