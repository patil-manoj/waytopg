import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
// import { Home, Search, Info, Phone, LogOut, User, Menu, X } from 'lucide-react'
import { Home, Search, LogOut, User, Menu, X , Plus, Info } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUserRole = localStorage.getItem('userRole')
    setIsAuthenticated(!!token)
    setUserRole(storedUserRole)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/login'
  }

  const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: React.ElementType }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
        ${location.pathname === to
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
      onClick={() => setIsOpen(false)}
    >
      <Icon className="w-5 h-5 mr-2" />
      {children}
    </Link>
  )

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/about', label: 'About', icon: Info },
      ]
    }

    const items = [
      { to: '/accommodations', label: 'Listings', icon: Search },
      { to: '/about', label: 'About', icon: Info },
    ]

    if (userRole === 'owner') {
      items.push({ to: '/add-accommodation', label: 'Add Accommodation', icon: Plus })
    }

    items.push({ to: `/${userRole}-dashboard`, label: 'Profile', icon: User })
    
    return items
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
            Way2pg
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} icon={item.icon}>
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar