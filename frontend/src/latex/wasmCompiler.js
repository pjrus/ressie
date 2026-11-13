import { SiglumCompiler, resolveRuntime } from '@siglum/engine';
import workerUrl from '@siglum/engine/worker?url';
import awesomeCvCls from './awesome-cv.cls?raw';

let compilerInstance = null;
let initPromise = null;
let compileChain = Promise.resolve();

async function getCompiler(onProgress) {
  if (compilerInstance && compilerInstance.isReady()) {
    if (onProgress) compilerInstance.onProgress = onProgress;
    return compilerInstance;
  }

  if (!initPromise) {
    initPromise = (async () => {
      onProgress?.('runtime', 'Resolving TeX runtime…');
      const runtime = await resolveRuntime();
      const compiler = new SiglumCompiler({
        ...runtime,
        workerUrl,
        enableCtan: true,
        enableLazyFS: true,
        enableDocCache: true,
        onProgress: (stage, detail) => {
          onProgress?.(stage, detail);
        },
      });
      onProgress?.('init', 'Loading LaTeX WebAssembly engine…');
      await compiler.init();
      compilerInstance = compiler;
      return compiler;
    })().catch((err) => {
      initPromise = null;
      compilerInstance = null;
      throw err;
    });
  }

  const compiler = await initPromise;
  if (onProgress) compiler.onProgress = onProgress;
  return compiler;
}

/**
 * Pre-warm the WASM LaTeX compiler in the background.
 */
export function prewarmLatexCompiler() {
  getCompiler().catch(() => {
    // Ignore background prewarm failures; compileLatex will surface errors if needed.
  });
}

/**
 * Compile a LaTeX document in the browser via @siglum/engine (WASM TeX Live).
 * Calls are serialized because SiglumCompiler handles one active compile per worker.
 *
 * @param {string} source - Complete .tex document source
 * @param {{ onProgress?: (stage: string, detail: string) => void }} [options]
 * @returns {Promise<{ blob: Blob, log: string }>}
 */
export function compileLatexInBrowser(source, { onProgress } = {}) {
  const run = compileChain.then(async () => {
    const compiler = await getCompiler(onProgress);
    const additionalFiles = {};
    if (/\\documentclass(?:\[[^\]]*\])?\{awesome-cv\}/.test(source)) {
      additionalFiles['awesome-cv.cls'] = awesomeCvCls;
    }

    onProgress?.('compile', 'Compiling LaTeX in browser…');
    const result = await compiler.compile(source, {
      additionalFiles,
    });

    if (!result.success || !result.pdf) {
      const err = new Error(result.error || 'LaTeX compilation failed');
      err.detail = result.log || result.error || '';
      throw err;
    }

    const blob = new Blob([result.pdf], { type: 'application/pdf' });
    return { blob, log: result.log || '' };
  });

  // Keep the queue alive even if a single compile fails
  compileChain = run.catch(() => {});
  return run;
}
