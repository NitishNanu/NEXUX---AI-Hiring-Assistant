import React from 'react';
import { nexusToast } from './ui/NexusToast';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      console.error('Unhandled React error:', error, info);
      nexusToast('An unexpected error occurred. See console for details.', 'error');
    } catch (e) {
      // swallow
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid place-items-center h-full p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-glacier/70">The UI encountered an unexpected error. You can reload to continue.</p>
            <div className="mt-4">
              <button className="btn-primary" onClick={() => window.location.reload()}>Reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
