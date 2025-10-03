/**
 * Code Editor Component
 *
 * Displays AI-generated React/TypeScript code in a Monaco editor.
 * Currently configured as read-only for viewing generated code.
 *
 * Features:
 * - Syntax highlighting for TypeScript/TSX
 * - Code folding and formatting
 * - Word wrapping for better readability
 *
 * @component
 * @param {Props} props - Component props
 * @param {string} props.code - The TypeScript/TSX code to display
 *
 * @future Will support live editing with error highlighting and type checking
 */

import Editor from "@monaco-editor/react";

type Props = {
  /** The code string to display in the editor */
  code: string;
};

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
          minimap: { enabled: false }, // Disable minimap for cleaner UI
          scrollBeyondLastLine: false,
          wordWrap: "on", // Enable word wrapping for long lines
        }}
      />
    </div>
  );
}