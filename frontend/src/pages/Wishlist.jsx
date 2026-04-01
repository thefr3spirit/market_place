import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { HiTrash } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = () => {
    setLoading(true)
    apiClient
      .get('/wishlist')
      .then((res) => setProducts(res.data))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const removeFromWishlist = async (productId) => {
    try {
      await apiClient.delete(`/wishlist/remove?product_id=${productId}`)
      toast.success('Removed from wishlist')
      fetchWishlist()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Your wishlist is empty</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
