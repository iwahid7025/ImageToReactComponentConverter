import { useState } from "react";
import UploadImage from "./components/UploadImage";
import CodePane from "./components/CodePane";
import PreviewPane from "./components/PreviewPane";
import "./index.css";

/**
 * App is the top-level React component.
 * - Left: image upload + "Test MCP Tool" button (hits /api/image-to-react)
 * - Right: "Generated Code" (Monaco editor, read-only for now)
 * - Right: "Preview" (renders a static sample component for now)
 *
 * Next steps:
 *  - Step 5: wire OpenAI Vision in the server and send real images
 *  - Step 6: render returned TSX dynamically and show errors nicely
 */
export default function App() {
  // Keep track of the selected image file (not uploaded yet in Step 3/4).
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Placeholder text; if server returns TSX, we overwrite this.
  const [generatedCode, setGeneratedCode] = useState<string>(
    `// AI-generated React (TSX) component will appear here after calling the server.\n` +
      `// For now, click "Test MCP Tool" to fetch a placeholder component from your C# server.\n\n` +
      `// Example output format expected from the server:\n` +
      `// export default function MyComponent() {\n` +
      `//   return <div>Hello from AI!</div>;\n` +
      `// }`
  );

  /**
   * Tests the MCP server connection by calling the image-to-react endpoint.
   * Currently sends placeholder data; will be updated to send real base64 images in Step 5.
   * Updates the generatedCode state with the server response or error message.
   *
   * @remarks The URL/port should match your server configuration (currently localhost:5287)
   */
  async function testCall() {
    try {
      const res = await fetch("http://localhost:5287/api/image-to-react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Step 4 ignores the actual image; we’ll send the real base64 in Step 5.
        body: JSON.stringify({
          imageBase64: "data:image/png;base64,AAAA",
          hints: "simple card",
        }),
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const json = (await res.json()) as { tsx?: string };
      if (json?.tsx) setGeneratedCode(json.tsx);
    } catch (err) {
      console.error("Server test error:", err);
      setGeneratedCode(
        `// Error calling server. Check the console and that the server is running.\n// ${String(err)}`
      );
    }
  }

  return (
    <div className="app-shell">
      {/* Left: Upload & actions */}
      <aside className="left-col">
        <h2>1) Upload UI Image</h2>
        <p className="muted">
          Select a PNG or JPG screenshot/sketch. In the next steps we’ll send it
          to the MCP server for conversion.
        </p>

        <UploadImage onFileSelected={setImageFile} />

        {imageFile && (
          <p className="muted" style={{ marginTop: 8 }}>
            Selected: <strong>{imageFile.name}</strong>
          </p>
        )}

        <div style={{ marginTop: 12 }}>
          <button className="upload-btn" onClick={testCall}>
            Test MCP Tool
          </button>
          <p className="muted" style={{ marginTop: 8 }}>
            This calls <code>/api/image-to-react</code> on your C# server and
            shows the returned TSX in the editor.
          </p>
        </div>
      </aside>

      {/* Right: Code + Preview */}
      <main className="right-col">
        <section className="pane">
          <h2>2) Generated Code</h2>
          <CodePane code={generatedCode} onChange={(value) => setGeneratedCode(value || "")} />
        </section>

        <section className="pane">
          <h2>3) Preview</h2>
          <PreviewPane />
        </section>
      </main>
    </div>
  );
}