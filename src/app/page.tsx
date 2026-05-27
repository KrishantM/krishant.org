/**
 * Home (`/`) is intentionally empty. The persistent AskConsole is mounted in
 * the root layout, so visiting "/" shows the bare console with no overlay.
 * Every other route renders a <Panel> on top.
 */
export default function HomePage() {
  return null;
}
