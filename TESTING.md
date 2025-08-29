# Testing Guide

This document provides instructions for running tests in the NoteFusion AI application.

## Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL (for backend tests)

## Backend Tests

### Running Tests

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements-test.txt

# Run all tests
pytest -v --cov=app

# Run a specific test file
pytest tests/test_notes.py -v

# Run tests with coverage report
pytest --cov=app --cov-report=html
```

### Test Structure

- `tests/` - Contains all test files
  - `conftest.py` - Test fixtures and configuration
  - `test_*.py` - Test modules
  - `mocks/` - Mock implementations for testing
  - `integration/` - Integration tests

## Frontend Tests

### Running Tests

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- `src/__tests__/` - Test utilities and setup
- `src/features/**/__tests__/` - Feature-specific tests
- `src/test-utils.tsx` - Test utilities and custom render

## CI/CD Pipeline

The CI/CD pipeline runs on every push and pull request to the `main` and `develop` branches. It includes:

1. Backend tests with PostgreSQL
2. Frontend tests
3. Deployment to staging (on `develop` branch)
4. Deployment to production (on `main` branch)

## Writing Tests

### Backend Testing Guidelines

Use pytest for backend tests. Follow these guidelines:

- Name test files with `test_` prefix
- Use fixtures for common test data
- Mock external services
- Keep tests independent and isolated

### Frontend Testing Guidelines

Use React Testing Library for frontend tests. Follow these guidelines:

- Test behavior, not implementation
- Use `@testing-library/react` for rendering components
- Mock API calls and external dependencies
- Use `userEvent` for simulating user interactions

## Debugging Tests

### Debugging Backend Tests

To debug a failing test:

```bash
# Run tests with pdb
pytest tests/test_notes.py -v --pdb

# Run with detailed logging
pytest -v --log-cli-level=DEBUG
```

### Debugging a Failing Frontend Test

To debug a failing test:

```bash
# Run tests in debug mode
npm test -- --debug

# Run a specific test file
npm test -- src/features/notes/__tests__/NoteEditor.test.tsx
```

## Code Coverage

Code coverage reports are generated during test runs:

- Backend: `backend/coverage/`
- Frontend: `frontend/coverage/`

Open the HTML reports in a browser to view detailed coverage information.
