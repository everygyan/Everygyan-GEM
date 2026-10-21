import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

const AdminDashboard = () => <div>Welcome to Super Admin Dashboard</div>
const UserProfilePage = () => <div>Welcome to User Profile</div>
const LoginPage = () => <div>Login Screen</div>

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('redirects unauthenticated visitors to /login', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Login Screen')).toBeInTheDocument()
    expect(screen.queryByText('Welcome to Super Admin Dashboard')).toBeNull()
  })

  it('blocks non-admin authenticated users from /admin and displays Access Denied', () => {
    // Set mock standard reader session
    localStorage.setItem(
      'everygyan_mock_session',
      JSON.stringify({
        user: { id: 'reader-1', email: 'reader@everygyan.com' },
        profile: { id: 'reader-1', email: 'reader@everygyan.com', role: 'user', fullName: 'Reader User' },
      })
    )

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.getByText(/Administrator privileges are required/i)).toBeInTheDocument()
    expect(screen.queryByText('Welcome to Super Admin Dashboard')).toBeNull()
  })

  it('allows authenticated standard users to view standard protected route /profile', () => {
    localStorage.setItem(
      'everygyan_mock_session',
      JSON.stringify({
        user: { id: 'reader-1', email: 'reader@everygyan.com' },
        profile: { id: 'reader-1', email: 'reader@everygyan.com', role: 'user', fullName: 'Reader User' },
      })
    )

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireAdmin={false}>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Welcome to User Profile')).toBeInTheDocument()
  })

  it('allows admin users with role=admin to access /admin', () => {
    // Set mock admin session
    localStorage.setItem(
      'everygyan_mock_session',
      JSON.stringify({
        user: { id: 'admin-1', email: 'admin@everygyan.com' },
        profile: { id: 'admin-1', email: 'admin@everygyan.com', role: 'admin', fullName: 'Admin User' },
      })
    )

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Welcome to Super Admin Dashboard')).toBeInTheDocument()
  })
})
