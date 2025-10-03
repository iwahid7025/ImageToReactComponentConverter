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
 * @param {function} props.onChange - Optional callback when code is edited
 *
 * @remarks Currently supports manual editing. Error highlighting and type checking planned for future iterations
 */

import Editor from "@monaco-editor/react";

type Props = {
  /** The code string to display in the editor */
  code: string;
  /** Optional callback when code changes */
  onChange?: (value: string | undefined) => void;
};

/**
 * Controlled Monaco editor:
 * - Use `value={code}` (NOT defaultValue) so updates from parent state appear.
 * - Keep it read-only for now.
 */
export default function CodePane({ code, onChange }: Props) {
  return (
    <div style={{ flex: 1, minHeight: 0, height: "100%" }}>
      <Editor
        height="100%"
        language="typescript"
        value={code}                 // <-- controlled
        onChange={onChange}          // <-- sync changes back to parent
        options={{
          readOnly: false,
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