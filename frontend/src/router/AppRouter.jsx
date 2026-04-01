import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import CreateListing from '../pages/CreateListing'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Messages from '../pages/Messages'
import Orders from '../pages/Orders'
import ProductPage from '../pages/ProductPage'
import Profile from '../pages/Profile'
import Register from '../pages/Register'
import Search from '../pages/Search'
import Wishlist from '../pages/Wishlist'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route
          path="/sell"
          element={<ProtectedRoute><CreateListing /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route
          path="/orders"
          element={<ProtectedRoute><Orders /></ProtectedRoute>}
        />
        <Route
          path="/messages"
          element={<ProtectedRoute><Messages /></ProtectedRoute>}
        />
        <Route
          path="/wishlist"
          element={<ProtectedRoute><Wishlist /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
