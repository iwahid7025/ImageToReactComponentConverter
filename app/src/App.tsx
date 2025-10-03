/**
 * Main Application Component
 *
 * This is the root component that orchestrates the Image to React Component conversion flow.
 * It manages the application state and coordinates three main sections:
 * 1. Image upload panel (left sidebar)
 * 2. Generated code viewer (right top)
 * 3. Live preview panel (right bottom)
 *
 * @component
 */

import { useState } from "react";
import UploadImage from "./components/UploadImage";
import CodePane from "./components/CodePane";
import PreviewPane from "./components/PreviewPane";
import "./index.css";

export default function App() {
  // Stores the user-selected image file for conversion
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Holds the AI-generated React component code
  // TODO: Replace with actual AI generation in future steps
  const [generatedCode] = useState<string>(
    `// AI-generated React (TSX) component will appear here in Step 5.
// For now, this is just a placeholder.`
  );

  return (
    <div className="app-shell">
      {/* Left Sidebar: Image Upload Section */}
      <aside className="left-col">
        <h2>1) Upload UI Image</h2>
        <p className="muted">
          Select a PNG or JPG screenshot/sketch. We'll convert it to code in a later step.
        </p>
        <UploadImage onFileSelected={setImageFile} />
        {/* Display selected file name when available */}
        {imageFile && (
          <p className="muted">
            Selected: <strong>{imageFile.name}</strong>
          </p>
        )}
      </aside>

      {/* Main Content Area: Code Editor and Live Preview */}
      <main className="right-col">
        {/* Code Editor Panel */}
        <section className="pane">
          <h2>2) Generated Code (placeholder)</h2>
          <CodePane code={generatedCode} />
        </section>

        {/* Live Preview Panel */}
        <section className="pane">
          <h2>3) Preview (placeholder)</h2>
          <PreviewPane />
        </section>
      </main>
    </div>
  );
}