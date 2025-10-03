import { useCallback, useState } from "react";
import UploadImage from "./components/UploadImage";
import CodePane from "./components/CodePane";
import "./index.css";

/**
 * Main App Component
 *
 * This is the root component for the Image-to-React converter application.
 * Features:
 *  - Upload UI screenshots/images
 *  - Generate React TSX components from images using AI (OpenAI Vision)
 *  - AI-powered code refinement (fixes, formatting, comments)
 *  - Editable Monaco code editor
 *  - Copy to clipboard functionality
 *  - Download generated code as .tsx file
 */
export default function App() {
  // ==================== STATE MANAGEMENT ====================

  /** Currently selected image file to convert */
  const [imageFile, setImageFile] = useState<File | null>(null);

  /** Generated or user-edited TSX code */
  const [generatedCode, setGeneratedCode] = useState<string>(
    `// AI-generated React (TSX) component will appear here after you click "Generate from Image".\n` +
    `// You can edit the code directly in this editor.`
  );

  /** Loading state for image-to-code generation */
  const [isLoading, setIsLoading] = useState(false);

  /** Loading state for code refinement */
  const [isRefining, setIsRefining] = useState(false);

  /** Error message to display to user */
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** Success/info notice to display to user */
  const [notice, setNotice] = useState<string | null>(null);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Converts a File object to a base64 data URL
   * @param file - The image file to convert
   * @returns Promise resolving to base64 data URL string
   */
  const toBase64DataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ==================== EVENT HANDLERS ====================

  /**
   * Handles the "Generate from Image" button click
   * Sends the selected image to the backend API and receives generated TSX code
   */
  const handleGenerate = async () => {
    // Clear previous messages
    setErrorMsg(null);
    setNotice(null);

    // Validation: ensure an image is selected
    if (!imageFile) {
      setErrorMsg("Please choose an image first.");
      return;
    }

    try {
      setIsLoading(true);

      // Convert image to base64 for API transmission
      const dataUrl = await toBase64DataUrl(imageFile);

      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL;

      // Call backend to generate TSX from image
      const res = await fetch(`${apiUrl}/api/image-to-react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          hints: "produce a clean, semantic layout"
        })
      });

      // Handle HTTP errors
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      // Parse and validate response
      const json = await res.json();
      if (!json?.tsx) {
        throw new Error("No TSX in server response.");
      }

      // Update UI with generated code
      setGeneratedCode(json.tsx);
      setNotice("Generated component code received.");
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copies the current code to the system clipboard
   * Uses the Clipboard API with fallback error handling
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setNotice("Copied to clipboard.");
    } catch {
      setErrorMsg("Failed to copy.");
    }
  }, [generatedCode]);

  /**
   * Downloads the current code as a .tsx file
   * Creates a temporary blob URL for download
   */
  const handleDownload = useCallback(() => {
    try {
      // Create blob from code text
      const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      // Create temporary anchor element for download
      const a = document.createElement("a");
      a.href = url;
      a.download = "GeneratedComponent.tsx";
      document.body.appendChild(a);
      a.click();

      // Cleanup
      a.remove();
      URL.revokeObjectURL(url);

      setNotice("Downloaded GeneratedComponent.tsx");
    } catch {
      setErrorMsg("Failed to download.");
    }
  }, [generatedCode]);

  /**
   * Handles the "AI Refine Code" button click
   * Sends current code to backend for AI-powered refinement:
   * - Fixes syntax errors and bugs
   * - Formats code properly
   * - Adds comprehensive comments
   * - Improves structure and readability
   */
  const handleRefineCode = async () => {
    // Clear previous messages
    setErrorMsg(null);
    setNotice(null);

    // Validation: ensure there's code to refine
    if (!generatedCode || generatedCode.trim().startsWith("//")) {
      setErrorMsg("No code to refine. Generate code first.");
      return;
    }

    try {
      setIsRefining(true);

      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL;

      // Call backend to refine the code
      const res = await fetch(`${apiUrl}/api/refine-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: generatedCode
        })
      });

      // Handle HTTP errors
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      // Parse and validate response
      const json = await res.json();
      if (!json?.refinedCode) {
        throw new Error("No refined code in server response.");
      }

      // Update UI with refined code
      setGeneratedCode(json.refinedCode);
      setNotice("Code refined successfully.");
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setIsRefining(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="app-shell">
      {/* Left column: image upload + action buttons */}
      <aside className="left-col">
        <h2>1) Upload UI Image</h2>
        <p className="muted">
          Select a PNG or JPG screenshot/sketch, then click <em>Generate from Image</em>.
        </p>

        {/* Image file selector */}
        <UploadImage onFileSelected={setImageFile} />

        {/* Display selected filename */}
        {imageFile && (
          <p className="muted">
            Selected: <strong>{imageFile.name}</strong>
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {/* Primary action: Generate code from image */}
          <button
            className="upload-btn"
            onClick={handleGenerate}
            disabled={isLoading || isRefining}
          >
            {isLoading ? "Generating…" : "Generate from Image"}
          </button>

          {/* AI Refine: Improve generated code */}
          <button
            className="secondary-btn"
            onClick={handleRefineCode}
            disabled={isLoading || isRefining}
          >
            {isRefining ? "Refining…" : "AI Refine Code"}
          </button>

          {/* Copy to clipboard */}
          <button className="secondary-btn" onClick={handleCopy}>
            Copy to Clipboard
          </button>

          {/* Download as .tsx file */}
          <button className="secondary-btn" onClick={handleDownload}>
            Download .tsx
          </button>
        </div>

        {/* Error message display */}
        {errorMsg && (
          <p className="muted" style={{ color: "#fca5a5", marginTop: 8 }}>
            {errorMsg}
          </p>
        )}

        {/* Success/info notice display */}
        {notice && (
          <p className="muted" style={{ color: "#a7f3d0", marginTop: 8 }}>
            {notice}
          </p>
        )}
      </aside>

      {/* Right column: Monaco code editor */}
      <main className="right-col one-pane">
        <section className="pane">
          <h2>2) Generated Code (editable)</h2>
          <CodePane code={generatedCode} onChange={setGeneratedCode} />
        </section>
      </main>
    </div>
  );
}
