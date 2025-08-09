import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useToastContext } from './ToastContext'

interface AuthContextType {
  user: User | null
  session: Session | null
  userTier: 'free' | 'premium'
  hasLifetimeUpdates: boolean
  purchaseInfo: {
    hasPremium: boolean
    hasLifetimeUpdates: boolean
    activatedAt: string | null
    totalSpent: number
  } | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  refreshPurchaseInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free')
  const [hasLifetimeUpdates, setHasLifetimeUpdates] = useState(false)
  const [purchaseInfo, setPurchaseInfo] = useState<{
    hasPremium: boolean
    hasLifetimeUpdates: boolean
    activatedAt: string | null
    totalSpent: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Load user tier if user exists
      if (session?.user) {
        loadUserInfo(session.user.id)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadUserInfo(session.user.id)
      } else {
        setUserTier('free')
        setHasLifetimeUpdates(false)
        setPurchaseInfo(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserInfo = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('subscription_tier, has_premium_access, has_lifetime_updates, premium_activated_at')
        .eq('id', userId)
        .single()
      
      const tier = data?.has_premium_access ? 'premium' : 'free'
      setUserTier(tier)
      setHasLifetimeUpdates(data?.has_lifetime_updates || false)
      
      // Load purchase info
      await loadPurchaseInfo(userId)
    } catch (err) {
      setUserTier('free')
      setHasLifetimeUpdates(false)
      setPurchaseInfo(null)
    }
  }

  const loadPurchaseInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_purchase_info', {
        p_user_id: userId
      })

      if (error) throw error

      if (data && data.length > 0) {
        const info = data[0]
        setPurchaseInfo({
          hasPremium: info.has_premium || false,
          hasLifetimeUpdates: info.has_lifetime_updates || false,
          activatedAt: info.activated_at || null,
          totalSpent: parseFloat(info.total_spent) || 0
        })
      }
    } catch (err) {
      console.error('Error loading purchase info:', err)
      setPurchaseInfo(null)
    }
  }

  const refreshPurchaseInfo = async () => {
    if (user) {
      await loadUserInfo(user.id)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUserTier('free')
      setHasLifetimeUpdates(false)
      setPurchaseInfo(null)
      // Note: We can't use toast here as this context is above ToastProvider
      // Toast will be handled in the component that calls signOut
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const value = {
    user,
    session,
    userTier,
    hasLifetimeUpdates,
    purchaseInfo,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshPurchaseInfo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}