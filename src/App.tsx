import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { NotFound } from './pages/NotFound'

// Admin Command Center Pages
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminPosts } from './pages/admin/AdminPosts'
import { AdminPostEditor } from './pages/admin/AdminPostEditor'
import { AdminComments } from './pages/admin/AdminComments'
import { AdminNewsletters } from './pages/admin/AdminNewsletters'

function AppLayout() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased transition-colors selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-300">
      {/* Public Navbar hidden on admin screens for distraction-free command workspace */}
      {!isAdminRoute && <Navbar />}

      {/* Main Content Area */}
      <main className={`flex-1 ${!isAdminRoute ? 'pb-16 md:pb-0' : ''}`}>
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

          {/* Protected Admin Command Center Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="posts/new" element={<AdminPostEditor />} />
            <Route path="posts/edit/:id" element={<AdminPostEditor />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="newsletters" element={<AdminNewsletters />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Public Footer & Mobile BottomNav hidden on admin screens */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <BottomNav />}
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
