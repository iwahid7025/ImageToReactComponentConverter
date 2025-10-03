type Props = {
  code: string;
};

/**
 * Read-only code area for Step 2.
 * In Step 3, we'll replace this with a Monaco editor.
 */
export default function CodePane({ code }: Props) {
  return (
    <textarea
      className="code-pane"
      value={code}
      readOnly
      spellCheck={false}
      aria-label="Generated code"
    />
  );
}