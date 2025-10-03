import { useCallback, useState } from "react";
import UploadImage from "./components/UploadImage";
import CodePane from "./components/CodePane";
import "./index.css";

/**
 * Phase 1 (final): No Preview. We:
 *  - Upload image → call server → receive TSX
 *  - Show TSX in Monaco (editable)
 *  - Add "Copy" and "Download .tsx" actions
 *  - Add "AI Refine Code" to fix, format, and comment code
 */
export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>(
    `// AI-generated React (TSX) component will appear here after you click "Generate from Image".\n` +
    `// You can edit the code directly in this editor.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const toBase64DataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result)); // data:*/*;base64,....
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    setErrorMsg(null);
    setNotice(null);

    if (!imageFile) {
      setErrorMsg("Please choose an image first.");
      return;
    }

    try {
      setIsLoading(true);
      const dataUrl = await toBase64DataUrl(imageFile);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5287";
      const res = await fetch(`${apiUrl}/api/image-to-react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          hints: "produce a clean, semantic layout"
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const json = await res.json();
      if (!json?.tsx) throw new Error("No TSX in server response.");

      setGeneratedCode(json.tsx);
      setNotice("Generated component code received.");
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setNotice("Copied to clipboard.");
    } catch {
      setErrorMsg("Failed to copy.");
    }
  }, [generatedCode]);

  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "GeneratedComponent.tsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotice("Downloaded GeneratedComponent.tsx");
    } catch {
      setErrorMsg("Failed to download.");
    }
  }, [generatedCode]);

  const handleRefineCode = async () => {
    setErrorMsg(null);
    setNotice(null);

    if (!generatedCode || generatedCode.trim().startsWith("//")) {
      setErrorMsg("No code to refine. Generate code first.");
      return;
    }

    try {
      setIsRefining(true);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5287";
      const res = await fetch(`${apiUrl}/api/refine-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: generatedCode
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const json = await res.json();
      if (!json?.refinedCode) throw new Error("No refined code in server response.");

      setGeneratedCode(json.refinedCode);
      setNotice("Code refined successfully.");
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="app-shell">
      {/* Left column: image upload + actions */}
      <aside className="left-col">
        <h2>1) Upload UI Image</h2>
        <p className="muted">
          Select a PNG or JPG screenshot/sketch, then click <em>Generate from Image</em>.
        </p>

        <UploadImage onFileSelected={setImageFile} />
        {imageFile && (
          <p className="muted">
            Selected: <strong>{imageFile.name}</strong>
          </p>
        )}

        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <button className="upload-btn" onClick={handleGenerate} disabled={isLoading || isRefining}>
            {isLoading ? "Generating…" : "Generate from Image"}
          </button>
          <button className="secondary-btn" onClick={handleRefineCode} disabled={isLoading || isRefining}>
            {isRefining ? "Refining…" : "AI Refine Code"}
          </button>
          <button className="secondary-btn" onClick={handleCopy}>
            Copy to Clipboard
          </button>
          <button className="secondary-btn" onClick={handleDownload}>
            Download .tsx
          </button>
        </div>

        {errorMsg && (
          <p className="muted" style={{ color: "#fca5a5", marginTop: 8 }}>
            {errorMsg}
          </p>
        )}
        {notice && (
          <p className="muted" style={{ color: "#a7f3d0", marginTop: 8 }}>
            {notice}
          </p>
        )}
      </aside>

      {/* Right column: generated code only */}
      <main className="right-col one-pane">
        <section className="pane">
          <h2>2) Generated Code (editable)</h2>
          <CodePane code={generatedCode} onChange={setGeneratedCode} />
        </section>
      </main>
    </div>
  );
}