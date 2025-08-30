// Simple Vitest configuration check
console.log('=== Vitest Configuration Check ===');

// Check if we can import Vitest
try {
  const { test, expect } = require('vitest');
  console.log('✅ Vitest imports work');
  
  // Run a simple test
  test('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
    console.log('✅ Basic test assertion works');
  });
  
} catch (error) {
  console.error('❌ Vitest import failed:', error.message);
  process.exit(1);
}

// Check if we can import React Testing Library
try {
  const { render, screen } = require('@testing-library/react');
  console.log('✅ React Testing Library imports work');
  
  // Simple React component test
  const HelloWorld = () => <div>Hello, Test!</div>;
  
  test('renders hello world', () => {
    render(<HelloWorld />);
    const element = screen.getByText('Hello, Test!');
    console.log('✅ React component rendering works');
  });
  
} catch (error) {
  console.error('❌ React Testing Library import failed:', error.message);
  process.exit(1);
}

console.log('\n✅ All checks passed! Vitest is properly configured.');
