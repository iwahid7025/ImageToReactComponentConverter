import { useState } from "react";
import UploadImage from "./components/UploadImage";
import CodePane from "./components/CodePane";
import PreviewPane from "./components/PreviewPane";
import "./index.css";

/**
 * App is our top-level React component.
 * For Step 2, it only holds simple state and shows three regions:
 *  - Upload (left)
 *  - Generated Code placeholder (right/top)
 *  - Preview placeholder (right/bottom)
 */
export default function App() {
  // Keep track of the user-selected image file (if any).
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Placeholder text; in Step 5, this will be replaced by AI-generated TSX code.
  const [generatedCode] = useState<string>(
    `// AI-generated React (TSX) component will appear here in Step 5.
// For now, this is just a placeholder.`
  );

  return (
    <div className="app-shell">
      {/* Left column: image upload */}
      <aside className="left-col">
        <h2>1) Upload UI Image</h2>
        <p className="muted">
          Select a PNG or JPG screenshot/sketch. We’ll convert it to code in a later step.
        </p>
        <UploadImage onFileSelected={setImageFile} />
        {imageFile && (
          <p className="muted">
            Selected: <strong>{imageFile.name}</strong>
          </p>
        )}
      </aside>

      {/* Right column: code + preview placeholders */}
      <main className="right-col">
        <section className="pane">
          <h2>2) Generated Code (placeholder)</h2>
          <CodePane code={generatedCode} />
        </section>

        <section className="pane">
          <h2>3) Preview (placeholder)</h2>
          <PreviewPane />
        </section>
      </main>
    </div>
  );
}