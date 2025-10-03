import DemoComponent from "../samples/DemoComponent";

/**
 * Renders a static demo TSX component so you can verify the preview region works.
 * Later, we'll replace this with dynamically evaluated AI-generated components.
 */
export default function PreviewPane() {
  return (
    <div className="preview-pane">
      <DemoComponent />
    </div>
  );
}