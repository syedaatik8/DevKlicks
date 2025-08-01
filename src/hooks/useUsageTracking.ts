import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface UsageData {
  imageResizes: number
  maxImageResizes: number
}

export const useUsageTracking = () => {
  const { user } = useAuth()
  const [usage, setUsage] = useState<UsageData>({
    imageResizes: 0,
    maxImageResizes: 10 // Free tier limit
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUsage()
    }
  }, [user])

  const fetchUsage = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('get_usage', {
        p_user_id: user.id,
        p_feature_type: 'image_resize'
      })

      if (error) throw error

      setUsage(prev => ({
        ...prev,
        imageResizes: data || 0
      }))
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const incrementImageResize = async () => {
    if (!user) return false

    try {
      const { data, error } = await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_feature_type: 'image_resize'
      })

      if (error) throw error

      setUsage(prev => ({
        ...prev,
        imageResizes: data
      }))

      return true
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
  }

  const canUseImageResize = usage.imageResizes < usage.maxImageResizes

  return {
    usage,
    loading,
    incrementImageResize,
    canUseImageResize,
    refreshUsage: fetchUsage
  }
}