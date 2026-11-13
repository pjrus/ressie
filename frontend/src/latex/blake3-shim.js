// Pure-JS shim for blake3-wasm/browser.js (whose upstream package omits blake3_js_bg.js).
// Used by @siglum/engine/src/hash.js for non-cryptographic document change detection.
export function hash(content = '') {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  const str = String(content);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i), 0x85ebca6b) >>> 0;
  }
  const hex = h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  return {
    toString() {
      return hex;
    },
  };
}
