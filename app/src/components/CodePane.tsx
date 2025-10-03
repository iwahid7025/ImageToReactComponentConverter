import Editor from "@monaco-editor/react";

type Props = {
  code: string;
  onChange?: (value: string) => void;
};

/**
 * Monaco editor for TS/TSX.
 * - Editable so you can tweak the AI output.
 * - We keep word wrap and a small feature set to stay beginner-friendly.
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