import { useState } from "react";
import UploadImage from "./components/UploadImage";
import CodePane from "./components/CodePane";
import "./index.css";

/**
 * Step 6:
 * - Monaco is now editable.
 * - The Preview pane renders whatever TSX is in the editor using a sandboxed iframe.
 * - The Generate button still calls your MCP server to produce initial TSX from an image.
 */
export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>(
    `/** 
 * This area will show AI-generated React TSX.
 * Try pasting a simple component, e.g.:
 *
 * export default function Hello() {
 *   return <div style={{padding:16}}>Hello, Preview!</div>;
 * }
 */
`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toBase64DataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result)); // data:*/*;base64,....
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    setErrorMsg(null);

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
          hints: "produce a clean, semantic layout",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const json = await res.json();
      if (!json?.tsx) throw new Error("No TSX in server response.");
      setGeneratedCode(json.tsx);
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      {/* Left column: image upload */}
      <aside className="left-col">
        <h2>1) Upload UI Image</h2>
        <p className="muted">
          Select a PNG or JPG screenshot/sketch. Then click <em>Generate from Image</em>.
        </p>

        <UploadImage onFileSelected={setImageFile} />
        {imageFile && (
          <p className="muted">
            Selected: <strong>{imageFile.name}</strong>
          </p>
        )}

        <button className="upload-btn" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? "Generating…" : "Generate from Image"}
        </button>

        {errorMsg && (
          <p className="muted" style={{ color: "#fca5a5", marginTop: 8 }}>
            {errorMsg}
          </p>
        )}
      </aside>

      {/* Right column: code only */}
      <main className="right-col">
        <section className="pane" style={{ flex: 1 }}>
          <h2>2) Generated Code</h2>
          <CodePane code={generatedCode} onChange={setGeneratedCode} />
        </section>
      </main>
    </div>
  );
}