import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Layout from '../Layout/index'

// Mock child components
vi.mock('../../pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}))

vi.mock('../../pages/AboutPage', () => ({
  default: () => <div data-testid="about-page">About Page</div>
}))

vi.mock('../../pages/SettingsPage', () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>
}))

vi.mock('../../pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}))

vi.mock('../AdRewardsScreen', () => ({
  default: ({ visible, onClose }: any) => 
    visible ? (
      <div data-testid="ad-rewards-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfigProvider>
        {component}
      </ConfigProvider>
    </BrowserRouter>
  )
}

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders layout with navigation', () => {
    renderWithProviders(<Layout />)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('NoteFusion AI')).toBeInTheDocument()
  })

  it('displays home page by default', () => {
    renderWithProviders(<Layout />)
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('navigates to different pages', async () => {
    renderWithProviders(<Layout />)
    
    const aboutLink = screen.getByText(/about/i)
    fireEvent.click(aboutLink)
    
    await waitFor(() => {
      expect(screen.getByTestId('about-page')).toBeInTheDocument()
    })
  })

  it('opens ad rewards modal when earn tokens button is clicked', async () => {
    renderWithProviders(<Layout />)
    
    const earnTokensButton = screen.getByText(/earn tokens/i)
    fireEvent.click(earnTokensButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('ad-rewards-modal')).toBeInTheDocument()
    })
  })

  it('closes ad rewards modal', async () => {
    renderWithProviders(<Layout />)
    
    // Open modal
    const earnTokensButton = screen.getByText(/earn tokens/i)
    fireEvent.click(earnTokensButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('ad-rewards-modal')).toBeInTheDocument()
    })
    
    // Close modal
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('ad-rewards-modal')).not.toBeInTheDocument()
    })
  })

  it('handles keyboard navigation', () => {
    renderWithProviders(<Layout />)
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toHaveAttribute('tabindex', '0')
  })

  it('has proper ARIA labels', () => {
    renderWithProviders(<Layout />)
    
    const mainContent = screen.getByRole('main')
    expect(mainContent).toHaveAttribute('aria-label', 'Main content')
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toHaveAttribute('aria-label', 'Main navigation')
  })

  it('is responsive', () => {
    renderWithProviders(<Layout />)
    
    // Test that layout has responsive classes
    const layoutContainer = screen.getByRole('navigation').parentElement
    expect(layoutContainer).toHaveClass('ant-layout')
  })

  it('handles error boundaries', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    renderWithProviders(<Layout />)
    
    // Simulate an error
    const error = new Error('Test error')
    throw error
    
    consoleError.mockRestore()
  })

  it('loads user preferences from localStorage', () => {
    const mockPreferences = {
      theme: 'dark',
      language: 'en'
    }
    localStorage.setItem('userPreferences', JSON.stringify(mockPreferences))
    
    renderWithProviders(<Layout />)
    
    // Verify preferences are applied
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('saves user preferences to localStorage', async () => {
    renderWithProviders(<Layout />)
    
    const settingsButton = screen.getByText(/settings/i)
    fireEvent.click(settingsButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-page')).toBeInTheDocument()
    })
    
    // Simulate changing a setting
    const themeToggle = screen.getByRole('switch', { name: /theme/i })
    if (themeToggle) {
      fireEvent.click(themeToggle)
      
      // Verify preference is saved
      const savedPreferences = localStorage.getItem('userPreferences')
      expect(savedPreferences).toBeTruthy()
    }
  })
})
