/**
 * Live Preview Component
 *
 * Renders a live preview of the generated React component.
 * Currently displays a static demo component to verify the preview functionality.
 *
 * @component
 *
 * @future
 * - Will dynamically evaluate and render AI-generated TSX code
 * - Will support real-time updates as code changes
 * - Will handle runtime errors with error boundaries
 */

import DemoComponent from "../samples/DemoComponent";

export default function PreviewPane() {
  return (
    <div className="preview-pane">
      {/* Temporary static component - will be replaced with dynamic rendering */}
      <DemoComponent />
    </div>
  );
}