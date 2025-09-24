import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Optional: log to an error reporting service
    // console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="dashboard-container">
          <div className="error" style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>Something went wrong rendering this view.</div>
            <button onClick={this.handleRetry} className="retry-button">Try Again</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
