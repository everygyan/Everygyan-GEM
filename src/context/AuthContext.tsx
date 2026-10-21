import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { UserProfile } from '../types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  mockLoginAsAdmin: () => void
  mockLoginAsUser: () => void
}

const MOCK_STORAGE_KEY = 'everygyan_mock_session'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user profile from Supabase profiles table
  const fetchProfile = async (userId: string, email: string) => {
    if (!isSupabaseConfigured) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          role: data.role as 'user' | 'admin',
          bio: data.bio,
          createdAt: data.created_at,
        })
      } else {
        // Fallback default profile if trigger hasn't fired yet
        setProfile({
          id: userId,
          email,
          role: 'user',
        })
      }
    } catch {
      setProfile({
        id: userId,
        email,
        role: 'user',
      })
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      // 1. Check for stored mock session (allows offline demo & unit test verification)
      try {
        const storedMock = localStorage.getItem(MOCK_STORAGE_KEY)
        if (storedMock) {
          const parsed = JSON.parse(storedMock)
          if (mounted) {
            setUser(parsed.user)
            setProfile(parsed.profile)
            setIsLoading(false)
          }
          return
        }
      } catch {
        // ignore storage error
      }

      // 2. Supabase Auth if credentials configured
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (mounted && session?.user) {
            setUser(session.user)
            await fetchProfile(session.user.id, session.user.email ?? '')
          }
        } catch {
          // ignore network failures
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (!mounted) return
            if (session?.user) {
              setUser(session.user)
              await fetchProfile(session.user.id, session.user.email ?? '')
            } else {
              setUser(null)
              setProfile(null)
            }
            setIsLoading(false)
          }
        )

        if (mounted) setIsLoading(false)
        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      }

      if (mounted) setIsLoading(false)
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Sign In with Email & Password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return { error }
        if (data.user) {
          setUser(data.user)
          await fetchProfile(data.user.id, data.user.email ?? '')
        }
        return { error: null }
      }

      // Fallback Mock Sign In
      const isAdmin = email.toLowerCase().includes('admin')
      const mockUser = {
        id: 'mock-user-' + Math.random().toString(36).substring(2, 9),
        email,
        app_metadata: {},
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User

      const mockProf: UserProfile = {
        id: mockUser.id,
        email,
        fullName: email.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      }

      setUser(mockUser)
      setProfile(mockProf)
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ user: mockUser, profile: mockProf }))
      return { error: null }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign Up with Email & Password
  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) return { error }
        if (data.user) {
          setUser(data.user)
          await fetchProfile(data.user.id, data.user.email ?? '')
        }
        return { error: null }
      }

      // Fallback Mock Sign Up
      return await signIn(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  // Google OAuth Sign In
  const signInWithGoogle = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      return { error: error ?? null }
    }

    // Mock Google sign in
    return await signIn('google-user@everygyan.com', 'password123')
  }

  // Password Reset
  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      return { error: error ?? null }
    }
    return { error: null }
  }

  // Sign Out
  const signOut = async () => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
      localStorage.removeItem(MOCK_STORAGE_KEY)
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('User not logged in') }

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          bio: updates.bio,
        })
        .eq('id', user.id)

      if (error) return { error }
    }

    // Update local state
    setProfile((prev) => (prev ? { ...prev, ...updates } : null))
    return { error: null }
  }

  // Quick helper to test Admin role directly in UI
  const mockLoginAsAdmin = () => {
    signIn('admin@everygyan.com', 'password')
  }

  // Quick helper to test Standard User role directly in UI
  const mockLoginAsUser = () => {
    signIn('reader@everygyan.com', 'password')
  }

  const isAdmin = profile?.role === 'admin'
  const isAuthenticated = Boolean(user)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isAuthenticated,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        signOut,
        updateProfile,
        mockLoginAsAdmin,
        mockLoginAsUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
