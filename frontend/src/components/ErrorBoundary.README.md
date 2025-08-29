# ErrorBoundary Component

A reusable error boundary component that catches JavaScript errors in its child component tree, logs those errors, and displays a fallback UI.

## Features

- 🛡 Catches JavaScript errors in child components
- 📝 Logs errors to console in development
- 🎨 Customizable error UI
- 🔄 Retry mechanism for error recovery
- 🔍 Detailed error information in development
- 🧩 Higher-order component for easy integration
- 📊 Error reporting capabilities
- ⚡ Optimized performance with error boundary reset

## Installation

```bash
# If using npm
npm install @sentry/react # Optional: For production error tracking

# If using yarn
yarn add @sentry/react # Optional: For production error tracking
```

## Basic Usage

```tsx
import ErrorBoundary from './components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <YourComponent />
  </ErrorBoundary>
);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | The child components to be wrapped by the error boundary |
| `fallback` | `ReactElement` | `null` | Custom fallback UI to display when an error occurs |
| `onError` | `(error: Error, errorInfo: ErrorInfo) => void` | - | Callback function called when an error occurs |
| `showReportDialog` | `boolean` | `true` | Whether to show the report error button |
| `componentName` | `string` | - | Component name for better error reporting |
| `errorContext` | `Record<string, unknown>` | - | Additional error context for error reporting |
| `errorMessage` | `string` | - | Custom error message to display |
| `showDetailsInDev` | `boolean` | `true` in development | Whether to show error details in development |
| `title` | `string` | 'Oops! Something went wrong' | Custom title for the error boundary |
| `subtitle` | `string` | 'We\'ve been notified about this issue and are working on it.' | Custom subtitle for the error boundary |

## Advanced Usage

### With Custom Fallback UI

```tsx
<ErrorBoundary
  fallback={
    <div>
      <h2>Custom Error UI</h2>
      <p>Something went wrong in this component.</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

### With Error Reporting

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to your error tracking service
    logErrorToService(error, errorInfo);
  }}
  componentName="YourComponent"
  errorContext={{ userId: user?.id }}
>
  <YourComponent />
</ErrorBoundary>
```

### Using the HOC (Higher-Order Component)

```tsx
import { withErrorBoundary } from './components/ErrorBoundary';

function YourComponent() {
  // Your component code
}

export default withErrorBoundary(YourComponent, {
  componentName: 'YourComponent',
  onError: (error, errorInfo) => {
    console.error('Error in YourComponent:', error, errorInfo);
  },
});
```

## Error Recovery

The error boundary includes a "Try Again" button that resets the error state and re-renders the child components. You can also programmatically reset the error boundary using the `resetErrorBoundary` function provided to the fallback render prop.

## Development

In development, the error boundary will display detailed error information including:

- Error message
- Component stack trace
- Error boundary state

This information is hidden in production by default.

## Testing

To test the error boundary, you can use the provided test file:

```bash
# Run tests
npm test ErrorBoundary.test.tsx
```

## Demo

A demo page is available at `/error-boundary-demo` that demonstrates the error boundary in action.

## Best Practices

1. **Place error boundaries at strategic locations** - Wrap components that might fail at a granular level.
2. **Use meaningful error messages** - Help users understand what went wrong.
3. **Log errors to a service** - For production monitoring and debugging.
4. **Test error states** - Ensure your error boundaries work as expected.
5. **Provide recovery options** - Allow users to recover from errors when possible.

## License

MIT
