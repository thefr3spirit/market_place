import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import apiClient from '../api/apiClient'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'

export default function Search() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  // Filters
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [condition, setCondition] = useState('')

  useEffect(() => {
    if (!query) return
    setLoading(true)

    const params = { q: query, page, page_size: 20 }
    if (minPrice) params.min_price = parseFloat(minPrice)
    if (maxPrice) params.max_price = parseFloat(maxPrice)
    if (condition) params.condition = condition

    apiClient
      .get('/search', { params })
      .then((res) => {
        setResults(res.data.hits || [])
        setTotal(res.data.total || 0)
      })
      .catch(() => {
        // Fallback to product endpoint if search engine unavailable
        apiClient
          .get('/products', { params: { page, page_size: 20 } })
          .then((res) => {
            setResults(res.data.products)
            setTotal(res.data.total)
          })
          .catch(() => toast.error('Search failed'))
      })
      .finally(() => setLoading(false))
  }, [query, page, minPrice, maxPrice, condition])

  const handleWishlist = async (productId) => {
    if (!user) { toast.error('Login to add to wishlist'); return }
    try {
      await apiClient.post(`/wishlist/add?product_id=${productId}`)
      toast.success('Added to wishlist')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Search results for &ldquo;{query}&rdquo;
      </h1>
      <p className="text-sm text-gray-500 mb-6">{total} results found</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="input-field !w-32 text-sm"
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="input-field !w-32 text-sm"
        />
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="input-field !w-40 text-sm"
        >
          <option value="">All conditions</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>
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
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No results found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} onWishlist={handleWishlist} />
          ))}
        </div>
      )}
    </div>
  )
}
