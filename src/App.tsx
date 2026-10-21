import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { Navbar } from './components/Navbar'
import { BottomNav } from './components/BottomNav'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'
import { Learning } from './pages/Learning'
import { Travel } from './pages/Travel'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          {/* Mobile Bottom Navigation (<768px) */}
          <BottomNav />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
