import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import apiClient from '../api/apiClient'
import CategoryList from '../components/CategoryList'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('category')

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  useEffect(() => {
    setLoading(true)
    const params = { page, page_size: pageSize }
    if (categoryId) params.category_id = categoryId
    apiClient
      .get('/products', { params })
      .then((res) => {
        setProducts(res.data.products)
        setTotal(res.data.total)
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [page, categoryId])

  const handleWishlist = async (productId) => {
    if (!user) {
      toast.error('Login to add to wishlist')
      return
    }
    try {
      await apiClient.post(`/wishlist/add?product_id=${productId}`)
      toast.success('Added to wishlist')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed'
      toast.error(msg)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero / Search */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Find Amazing Deals
        </h1>
        <p className="text-primary-100 mb-6 text-lg">
          Browse thousands of products from trusted sellers
        </p>
        <SearchBar className="max-w-2xl" />
      </div>

      {/* Categories */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Categories</h2>
        <CategoryList />
      </section>

      {/* Product Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {categoryId ? 'Category Products' : 'Latest Products'}
          </h2>
          <span className="text-sm text-gray-500">{total} products</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
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
            <p className="text-lg">No products found</p>
            <p className="text-sm mt-1">Check back later or try a different category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onWishlist={handleWishlist}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline !py-2 !px-4 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-outline !py-2 !px-4 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
