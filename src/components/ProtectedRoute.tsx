import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToastContext } from '../contexts/ToastContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const toast = useToastContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading your workspace...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we set up your tools</p>
        </div>
      </div>
    )
  }

  if (!user) {
    toast.info('Please sign in to continue', 'You need to be signed in to access this page')
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}