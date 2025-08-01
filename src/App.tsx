import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import { Dashboard } from './pages/Dashboard'
import { ImageResizerPage } from './pages/ImageResizerPage'
import { RemoveBackgroundPage } from './pages/RemoveBackgroundPage'
import { ColorPickerPage } from './pages/ColorPickerPage'
import { FaviconGeneratorPage } from './pages/FaviconGeneratorPage'
import { QRCodeGeneratorPage } from './pages/QRCodeGeneratorPage'
import { ContentGeneratorPage } from './pages/ContentGeneratorPage'
import { Settings } from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image-resizer"
            element={
              <ProtectedRoute>
                <ImageResizerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/remove-background"
            element={
              <ProtectedRoute>
                <RemoveBackgroundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/color-picker"
            element={
              <ProtectedRoute>
                <ColorPickerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favicon-generator"
            element={
              <ProtectedRoute>
                <FaviconGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qr-generator"
            element={
              <ProtectedRoute>
                <QRCodeGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content-generator"
            element={
              <ProtectedRoute>
                <ContentGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App