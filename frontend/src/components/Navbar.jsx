import { useState } from 'react'
import { HiHeart, HiMenu, HiMoon, HiSearch, HiShoppingCart, HiSun, HiUser, HiX } from 'react-icons/hi'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMarketplace } from '../context/MarketplaceContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useMarketplace()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <nav className="bg-primary-900/95 backdrop-blur-sm text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight">Marketplace</span>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2 rounded-lg text-gray-900 bg-white/90 
                           focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none
                           placeholder-gray-500 text-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-900">
                <HiSearch className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleDarkMode} className="p-2 hover:bg-primary-800 rounded-lg transition-colors">
              {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <Link to="/wishlist" className="p-2 hover:bg-primary-800 rounded-lg transition-colors">
                  <HiHeart className="w-5 h-5" />
                </Link>
                <Link to="/orders" className="p-2 hover:bg-primary-800 rounded-lg transition-colors">
                  <HiShoppingCart className="w-5 h-5" />
                </Link>
                <Link to="/sell" className="btn-secondary text-sm !py-1.5 !px-4">
                  Sell
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="p-2 hover:bg-primary-800 rounded-lg transition-colors"
                  >
                    <HiUser className="w-5 h-5" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/messages"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Messages
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false) }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium hover:text-primary-200 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary text-sm !py-1.5 !px-4">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-primary-800 rounded-lg"
          >
            {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary-900 border-t border-primary-800 pb-4">
          <form onSubmit={handleSearch} className="px-4 pt-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2 rounded-lg text-gray-900 bg-white/90 
                           placeholder-gray-500 text-sm outline-none"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                <HiSearch className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="px-4 mt-3 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm hover:text-primary-200">Home</Link>
            {user ? (
              <>
                <Link to="/sell" onClick={() => setMobileOpen(false)} className="block py-2 text-sm hover:text-primary-200">Sell</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 text-sm hover:text-primary-200">Wishlist</Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-sm hover:text-primary-200">Orders</Link>
                <Link to="/messages" onClick={() => setMobileOpen(false)} className="block py-2 text-sm hover:text-primary-200">Messages</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-sm hover:text-primary-200">Profile</Link>
                <button onClick={() => { logout(); setMobileOpen(false) }} className="block py-2 text-sm text-red-400">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm hover:text-primary-200">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-sm hover:text-primary-200">Sign Up</Link>
              </>
            )}
            <button onClick={toggleDarkMode} className="flex items-center space-x-2 py-2 text-sm hover:text-primary-200">
              {darkMode ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
