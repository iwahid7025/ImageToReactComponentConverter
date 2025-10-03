import Editor from "@monaco-editor/react";

type Props = {
  code: string;
};

/**
 * Read-only Monaco editor for now.
 * In Step 6, we'll wire this to render the generated TSX and show errors.
 */
export default function CodePane({ code }: Props) {
  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <Editor
        height="100%"
        defaultLanguage="typescript"
        defaultValue={code}
        options={{
          readOnly: true,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
      />
    </div>
  );
}