import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAuthContext } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import AuthForm from './components/Auth/AuthForm'
import Home from './pages/Home'
import MyGallery from './pages/MyGallery'
import Generated from './pages/Generated'
import Explore from './pages/Explore'
import Upload from './pages/Upload'

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  const [isLogin, setIsLogin] = React.useState(true)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
  }

  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="my-gallery" element={<MyGallery />} />
                <Route path="generated" element={<Generated />} />
                <Route path="explore" element={<Explore />} />
                <Route path="upload" element={<Upload />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthWrapper>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App