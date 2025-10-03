import { useEffect, useMemo, useRef } from "react";

/**
 * Props:
 *  - tsxCode: a string containing a complete React TSX component.
 * 
 * How it works:
 *  - We create a sandboxed <iframe> and feed it an HTML `srcdoc`.
 *  - Inside the iframe, we load TypeScript, React, and ReactDOM from CDNs.
 *  - We transpile the TSX string into JS using TypeScript's compiler (in the iframe),
 *    then `eval` it *inside the iframe* (not the parent page) and render the default export.
 * 
 * Security notes:
 *  - The iframe uses `sandbox="allow-scripts"` so the code can't touch parent DOM,
 *    cookies, localStorage, or the network (besides loading the CDNs).
 *  - This is useful for previewing potentially-untrusted code, like AI output.
 */
type Props = {
  tsxCode: string;
};

export default function PreviewPane({ tsxCode }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // To avoid constant iframe reloads on every keystroke, we memoize the srcdoc shell
  // and only pass the code string via postMessage after the iframe loads.
  const srcDoc = useMemo(() => {
    // We build an HTML document that:
    //  1. loads TypeScript, React, ReactDOM (UMD),
    //  2. listens for postMessage({ type:'render', tsx: string }) from the parent,
    //  3. transpiles the TSX to JS (CommonJS-style), and
    //  4. evals it and renders exports.default into #root.
    //
    // Any runtime/compile errors are caught and displayed in an error panel.
    return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Preview</title>
    <style>
      :root {
        --border: #1f2937; --bg: #0b1220; --text: #e5e7eb; --muted: #94a3b8;
        --errbg: #431515; --errtext: #fecaca; --errborder: #7f1d1d;
      }
      html, body { margin: 0; height: 100%; background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; }
      #root { padding: 12px; }
      .error {
        border: 1px solid var(--errborder);
        background: var(--errbg);
        color: var(--errtext);
        border-radius: 12px;
        padding: 12px;
        margin: 12px;
        white-space: pre-wrap;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
    </style>
    <!-- TypeScript (for in-iframe transpilation) -->
    <script src="https://unpkg.com/typescript@5.5.4/lib/typescript.js"></script>
    <!-- React 18 UMD builds -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <div id="error" class="error" style="display:none;"></div>
    <script>
      const ts = window.ts; // typescript compiler (global)
      const React = window.React;
      const ReactDOM = window.ReactDOM;

      function showError(msg) {
        const err = document.getElementById('error');
        err.textContent = String(msg);
        err.style.display = 'block';
      }

      function clearError() {
        const err = document.getElementById('error');
        err.textContent = '';
        err.style.display = 'none';
      }

      // Transpile TSX to JS (CommonJS-style exports)
      function transpileTsx(tsx) {
        const output = ts.transpileModule(tsx, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2019,
            module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.React,
            jsxFactory: 'React.createElement',
            jsxFragmentFactory: 'React.Fragment',
            esModuleInterop: true,
            strict: false,
          }
        });
        return output.outputText;
      }

      // Evaluate the transpiled code in a tiny CommonJS-ish sandbox,
      // returning module.exports (so we can access exports.default).
      function evalCommonJs(jsCode) {
        const module = { exports: {} };
        const exports = module.exports;
        // Provide React in scope for user code
        const fn = new Function('React', 'module', 'exports', jsCode + '\\nreturn module.exports;');
        return fn(React, module, exports);
      }

      function renderTsx(tsx) {
        clearError();
        try {
          const js = transpileTsx(tsx);
          const mod = evalCommonJs(js);
          const Comp = (mod && (mod.default || mod.GeneratedComponent)) || null;
          if (!Comp) throw new Error('No default export found. Ensure the component uses "export default".');
          const root = document.getElementById('root');
          // React 18 createRoot
          ReactDOM.createRoot(root).render(React.createElement(Comp));
        } catch (e) {
          console.error(e);
          showError(e && e.message ? e.message : e);
        }
      }

      // Listen for TSX from parent
      window.addEventListener('message', (ev) => {
        const data = ev.data || {};
        if (data.type === 'render' && typeof data.tsx === 'string') {
          renderTsx(data.tsx);
        }
      });

      // Ping parent that we're ready to receive code
      window.parent.postMessage({ type: 'preview-ready' }, '*');
    </script>
  </body>
</html>`;
  }, []);

  // When iframe loads (or when tsxCode changes), post the code to it.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let ready = false;

    function send() {
      if (!iframe.contentWindow) return;
      iframe.contentWindow.postMessage({ type: "render", tsx: tsxCode }, "*");
    }

    // Wait until the iframe signals it's ready
    function onMessage(ev: MessageEvent) {
      const data = (ev.data || {}) as any;
      if (data.type === "preview-ready" && ev.source === iframe.contentWindow) {
        ready = true;
        send();
      }
    }

    window.addEventListener("message", onMessage);

    // If the iframe is already loaded, attempt to send after a tick
    const id = setTimeout(() => {
      if (!ready) send();
    }, 300);

    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(id);
    };
  }, [tsxCode]);

  return (
    <div className="preview-pane" style={{ padding: 0 }}>
      <iframe
        ref={iframeRef}
        title="Component Preview"
        sandbox="allow-scripts"
        style={{ width: "100%", height: "100%", border: "0", borderRadius: 8 }}
        // Load the shell; TSX is sent via postMessage after load
        srcDoc={srcDoc}
      />
    </div>
  );
}