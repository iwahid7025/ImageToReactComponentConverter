/**
 * Demo Component
 *
 * A sample presentational component used to test the preview pane functionality.
 * This serves as a placeholder until AI-generated components are implemented.
 *
 * @component
 *
 * @example
 * ```tsx
 * <DemoComponent />
 * ```
 *
 * @note This component will be replaced by dynamically generated code in future iterations
 */
export default function DemoComponent() {
  return (
    <div
      style={{
        borderRadius: 12,
        padding: 16,
        border: "1px solid #1f2937",
        background: "#0b1220",
        color: "#e5e7eb",
        maxWidth: 420,
      }}
    >
      <h3 style={{ margin: "0 0 8px" }}>Demo Component</h3>
      <p style={{ margin: 0, color: "#94a3b8" }}>
        This is a static sample rendered in the Preview pane.
      </p>
    </div>
  );
}