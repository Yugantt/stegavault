import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'
import AppLayout from './components/layout/AppLayout'
import CinematicIntro from './components/CinematicIntro'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import TwoFactor from './pages/TwoFactor'
import Dashboard from './pages/Dashboard'
import ImageHide from './pages/ImageHide'
import ImageExtract from './pages/ImageExtract'
import History from './pages/History'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import ComingSoon from './pages/ComingSoon'
import Preview3D from './pages/Preview3D'
import Help from './pages/Help'
import NotFound from './pages/NotFound'
import { useAuthStore } from './store/authStore'

function shouldShowIntro(): boolean {
  try {
    if (localStorage.getItem('sv_intro_seen') === 'true') return false
    return true
  } catch {
    return false
  }
}

function AppContent() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      return false
    }
    return shouldShowIntro()
  })

  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const path = window.location.pathname
    if (!showIntro && token && (path === '/' || path === '')) {
      navigate('/dashboard', { replace: true })
    }
  }, [showIntro, token, navigate])

  const handleIntroComplete = () => {
    setShowIntro(false)
    try {
      localStorage.setItem('sv_intro_seen', 'true')
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      <Routes>
        {/* Public routes */}
        <Route path="/preview" element={<Preview3D />} />
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/2fa" element={<TwoFactor />} />

        {/* Protected routes with app layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stego/image" element={<ImageHide />} />
            <Route path="/stego/extract" element={<ImageExtract />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/stego/audio" element={<ComingSoon />} />
            <Route path="/stego/video" element={<ComingSoon />} />
            <Route path="/stego/scan" element={<ComingSoon />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all — MUST be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
