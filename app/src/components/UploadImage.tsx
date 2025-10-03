import { ChangeEvent } from "react";

/**
 * Props for the UploadImage component
 */
type Props = {
  /** Callback invoked when a file is selected or cleared */
  onFileSelected: (file: File | null) => void;
};

/**
 * UploadImage Component
 *
 * A styled file input component for selecting image files.
 * Features:
 * - Hidden native file input for better styling
 * - Custom button appearance via label
 * - Accepts only image file types
 * - Notifies parent component when selection changes
 *
 * @param props - Component props
 * @param props.onFileSelected - Callback fired when user selects/clears a file
 */
export default function UploadImage({ onFileSelected }: Props) {
  /**
   * Handles file input change event
   * Extracts the first selected file (or null if none) and passes it to parent
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelected(file);
  };

  return (
    <label className="upload">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {/* Custom styled button */}
      <span className="upload-btn">Choose Image…</span>
    </label>
  );
}
