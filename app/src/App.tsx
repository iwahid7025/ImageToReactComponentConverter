import { useState } from "react";
import UploadImage from "./components/UploadImage";
import CodePane from "./components/CodePane";
import PreviewPane from "./components/PreviewPane";
import "./index.css";

/**
 * Step 5:
 * - Converts the selected image to base64 in the browser (no secrets involved).
 * - Sends base64 to the MCP server's REST façade endpoint (/api/image-to-react).
 * - Shows returned TSX in Monaco (still read-only).
 */
export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>(
    `// AI-generated React (TSX) component will appear here after you click "Generate from Image".`
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

      // 1) Convert to base64 data URL in the browser
      const dataUrl = await toBase64DataUrl(imageFile);

      // 2) POST to the MCP server (server holds the OpenAI key)
      const res = await fetch("http://localhost:5287/api/image-to-react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          // optional hints; leave empty for now or wire a small input box
          hints: "produce a clean, semantic layout"
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const json = await res.json();
      if (!json?.tsx) {
        throw new Error("No TSX in server response.");
      }

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

      {/* Right column: code + preview */}
      <main className="right-col">
        <section className="pane">
          <h2>2) Generated Code</h2>
          <CodePane code={generatedCode} />
        </section>

        <section className="pane">
          <h2>3) Preview</h2>
          <PreviewPane />
          {/* NOTE: We don't render the generated TSX yet — Step 6 will safely evaluate and preview it. */}
        </section>
      </main>
    </div>
  );
}