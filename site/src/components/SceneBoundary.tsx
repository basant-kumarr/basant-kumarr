import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode; onError?: () => void };
type State = { failed: boolean };

/**
 * Isolates the WebGL layer from the document.
 *
 * If three.js throws — a driver quirk, a failed chunk load, an unsupported
 * extension — the page keeps every word of its content and swaps in the
 * static backdrop. Nothing about the portfolio depends on the scene rendering.
 */
export class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept as a warning rather than an error: this path is handled, and a red
    // console entry on a working page is misleading.
    console.warn('3D layer unavailable, falling back to static backdrop.', error, info.componentStack);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
