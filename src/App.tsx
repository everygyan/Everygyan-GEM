import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { BottomNav } from './components/BottomNav'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'
import { Learning } from './pages/Learning'
import { Travel } from './pages/Travel'
import { PostDetail } from './pages/PostDetail'
import { Newsletter } from './pages/Newsletter'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Profile } from './pages/Profile'
import { Admin } from './pages/Admin'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <Router>
          <div className="flex min-h-screen flex-col bg-background text-foreground antialiased transition-colors selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-300">
            <Navbar />
            {/* Main Content Area with mobile safe padding for BottomNav */}
            <main className="flex-1 pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/travel" element={<Travel />} />
                <Route path="/post/:slug" element={<PostDetail />} />
                <Route path="/newsletter" element={<Newsletter />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            {/* Mobile Bottom Navigation (<768px) */}
            <BottomNav />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
