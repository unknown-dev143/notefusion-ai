import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EnhancedErrorBoundary from '../EnhancedErrorBoundary'

// Create a component that throws an error
const ThrowErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div data-testid="normal-component">Normal Component</div>
}

describe('EnhancedErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={false} />
      </EnhancedErrorBoundary>
    )

    expect(screen.getByTestId('normal-component')).toBeInTheDocument()
    expect(screen.queryByText(/Oops! Something went wrong/)).not.toBeInTheDocument()
  })

  it('catches and displays error when child component throws', () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(screen.queryByTestId('normal-component')).not.toBeInTheDocument()
    expect(screen.getByText(/Oops! Something went wrong/)).toBeInTheDocument()
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
  })

  it('displays retry button', () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    const retryButton = screen.getByText(/Try Again/i)
    expect(retryButton).toBeInTheDocument()
  })

  it('displays home button', () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    const homeButton = screen.getByText(/Go Home/i)
    expect(homeButton).toBeInTheDocument()
  })

  it('retries when retry button is clicked', () => {
    const { rerender } = render(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(screen.getByText(/Oops! Something went wrong/)).toBeInTheDocument()

    const retryButton = screen.getByText(/Try Again/i)
    fireEvent.click(retryButton)

    // Rerender with no error
    rerender(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={false} />
      </EnhancedErrorBoundary>
    )

    expect(screen.getByTestId('normal-component')).toBeInTheDocument()
    expect(screen.queryByText(/Oops! Something went wrong/)).not.toBeInTheDocument()
  })

  it('calls onError callback when provided', () => {
    const onError = vi.fn()
    
    render(
      <EnhancedErrorBoundary onError={onError}>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('uses custom fallback when provided', () => {
    const CustomFallback = ({ error, retry }: any) => (
      <div data-testid="custom-fallback">
        <p>Custom error: {error.message}</p>
        <button onClick={retry}>Custom Retry</button>
      </div>
    )

    render(
      <EnhancedErrorBoundary fallback={CustomFallback}>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.getByText(/Custom error: Test error message/)).toBeInTheDocument()
    expect(screen.getByText('Custom Retry')).toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <EnhancedErrorBoundary showDetails={true}>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(screen.getByText(/Error Details/i)).toBeInTheDocument()
    expect(screen.getByText(/Test error message/)).toBeInTheDocument()

    process.env.NODE_ENV = originalNodeEnv
  })

  it('hides error details when showDetails is false', () => {
    render(
      <EnhancedErrorBoundary showDetails={false}>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(screen.queryByText(/Error Details/i)).not.toBeInTheDocument()
  })

  it('logs error to console in development', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

    render(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error message')
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(consoleLogSpy).toHaveBeenCalled()
    expect(consoleGroupEndSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleLogSpy.mockRestore()
    consoleGroupEndSpy.mockRestore()
    
    process.env.NODE_ENV = originalNodeEnv
  })

  it('handles async errors', async () => {
    const AsyncErrorComponent = () => {
      throw new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Async error')), 0)
      })
    }

    render(
      <EnhancedErrorBoundary>
        <AsyncErrorComponent />
      </EnhancedErrorBoundary>
    )

    // Error boundary should catch the async error
    await vi.waitUntil(() => {
      return screen.queryByText(/Oops! Something went wrong/) !== null
    })
  })

  it('resets error state after successful retry', () => {
    const { rerender } = render(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(screen.getByText(/Oops! Something went wrong/)).toBeInTheDocument()

    const retryButton = screen.getByText(/Try Again/i)
    fireEvent.click(retryButton)

    // Rerender with error again to test state reset
    rerender(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(screen.getByText(/Oops! Something went wrong/)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    const errorContainer = screen.getByText(/Oops! Something went wrong/).closest('div')
    expect(errorContainer).toHaveAttribute('role', 'alert')
  })
})
