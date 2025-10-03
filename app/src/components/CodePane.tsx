import Editor from "@monaco-editor/react";

/**
 * Props for the CodePane component
 */
type Props = {
  /** The TypeScript/TSX code to display in the editor */
  code: string;

  /** Optional callback invoked when the code changes */
  onChange?: (value: string) => void;
};

/**
 * CodePane Component
 *
 * A Monaco-based code editor configured for TypeScript/TSX editing.
 * Features:
 * - Syntax highlighting for TypeScript/TSX
 * - Word wrapping for better readability
 * - Auto-layout for responsive sizing
 * - Editable by default to allow tweaking AI-generated code
 * - Minimal UI (no minimap) to stay beginner-friendly
 *
 * @param props - Component props
 * @param props.code - The code content to display
 * @param props.onChange - Callback fired when user edits the code
 */
export default function CodePane({ code, onChange }: Props) {
  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <Editor
        height="100%"
        defaultLanguage="typescript"
        value={code}
        onChange={(val) => onChange?.(val ?? "")}
        options={{
          readOnly: false,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
