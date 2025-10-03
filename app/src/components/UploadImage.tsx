import { ChangeEvent } from "react";

type Props = {
  // Called whenever the user picks a file (or clears it)
  onFileSelected: (file: File | null) => void;
};

/**
 * A minimal file picker for images.
 * We keep it simple for Step 2: no preview, no uploads yet.
 */
export default function UploadImage({ onFileSelected }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelected(file);
  };

  return (
    <label className="upload">
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