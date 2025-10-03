import { ChangeEvent } from "react";

type Props = {
  onFileSelected: (file: File | null) => void;
};

/**
 * A minimal file picker for images.
 * Step 5 still uses this unchanged.
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