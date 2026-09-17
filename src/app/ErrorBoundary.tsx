import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('AI Quest error boundary', error, info)
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="card space-y-3 p-6">
            <h2 className="font-semibold">Something went wrong in this lesson.</h2>
            <p className="text-sm ink-2">{this.state.error.message}</p>
            <button type="button" className="btn btn-secondary" onClick={() => this.setState({ error: null })}>
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
