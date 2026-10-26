import { Component, type ReactNode } from 'react';
import { gameStore } from '../game/core/gameStore';

/** Catches unexpected render errors so the player gets a way out instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Game error:', error);
  }

  private recover = () => {
    gameStore.getState().returnToTitle();
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="menu-backdrop" role="alert">
        <div className="menu-panel pixel-panel">
          <div className="menu-title">Something went wrong</div>
          <p>The game hit an unexpected problem. Your last save is safe.</p>
          <button className="menu-item selected" onClick={this.recover} autoFocus>
            Return to Main Menu
          </button>
        </div>
      </div>
    );
  }
}
