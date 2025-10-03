/**
 * Image Upload Component
 *
 * Provides a file picker interface for users to select UI screenshots or sketches.
 * Currently accepts any image format (PNG, JPG, etc.) for conversion to React components.
 *
 * @component
 * @param {Props} props - Component props
 * @param {Function} props.onFileSelected - Callback invoked when user selects or clears a file
 */

import { ChangeEvent } from "react";

type Props = {
  /** Callback fired when a file is selected or cleared */
  onFileSelected: (file: File | null) => void;
};

export default function UploadImage({ onFileSelected }: Props) {
  /**
   * Handles file input change event
   * Extracts the first selected file and passes it to the parent component
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelected(file);
  };

  return (
    <label className="upload">
      {/* Hidden file input - triggered by clicking the styled button */}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <span className="upload-btn">Choose Image…</span>
    </label>
  );
}