import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { HiChat, HiHeart, HiLocationMarker, HiShoppingCart, HiStar } from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../api/apiClient'
import ProductGallery from '../components/ProductGallery'
import { useAuth } from '../context/AuthContext'

export default function ProductPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState({ reviews: [], average_rating: null, total: 0 })
  const [loading, setLoading] = useState(true)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiClient.get(`/products/${id}`),
      apiClient.get(`/reviews/products/${id}`),
    ])
      .then(([prodRes, revRes]) => {
        setProduct(prodRes.data)
        setReviews(revRes.data)
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false))
  }, [id])

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return }
    try {
      await apiClient.post('/orders', { product_id: id })
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order')
    }
  }

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return }
    try {
      await apiClient.post(`/wishlist/add?product_id=${id}`)
      toast.success('Added to wishlist')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    try {
      await apiClient.post('/reviews', {
        product_id: id,
        rating: reviewRating,
        comment: reviewText || null,
      })
      toast.success('Review submitted')
      setReviewText('')
      // Refresh reviews
      const res = await apiClient.get(`/reviews/products/${id}`)
      setReviews(res.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <ProductGallery images={product.images} />

        {/* Details */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-400 text-xs font-medium rounded-md mb-2">
                {product.condition}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {product.title}
              </h1>
            </div>
          </div>

          {/* Price */}
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-600">
              UGX {Number(product.price).toLocaleString()}
            </span>
          </div>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <HiStar
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(reviews.average_rating || 0)
                      ? 'text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {reviews.average_rating?.toFixed(1) || 'No ratings'} ({reviews.total} reviews)
            </span>
          </div>

          {/* Location */}
          {product.location && (
            <div className="mt-3 flex items-center gap-1 text-gray-500 text-sm">
              <HiLocationMarker className="w-4 h-4" />
              <span>{product.location}</span>
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Seller */}
          {product.seller && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Seller</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-primary-900 dark:text-primary-400 font-bold text-sm">
                    {product.seller.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{product.seller.username}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {product.status === 'active' && product.seller_id !== user?.id && (
              <button onClick={handleOrder} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <HiShoppingCart className="w-5 h-5" />
                Buy Now
              </button>
            )}
            <button onClick={handleWishlist} className="btn-outline flex items-center justify-center gap-2">
              <HiHeart className="w-5 h-5" />
            </button>
            {product.seller && user && product.seller_id !== user.id && (
              <button
                onClick={() => navigate(`/messages?user=${product.seller_id}&product=${product.id}`)}
                className="btn-outline flex items-center justify-center gap-2"
              >
                <HiChat className="w-5 h-5" />
              </button>
            )}
          </div>

          {product.status !== 'active' && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium text-center">
              This product is {product.status}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Reviews ({reviews.total})
        </h2>

        {/* Review form */}
        {user && product.seller_id !== user.id && (
          <form onSubmit={handleReview} className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-0.5"
                >
                  <HiStar className={`w-6 h-6 ${star <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a review..."
              rows={3}
              className="input-field mb-3"
            />
            <button type="submit" className="btn-primary text-sm">
              Submit Review
            </button>
          </form>
        )}

        {/* Review list */}
        {reviews.reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.reviews.map((review) => (
              <div key={review.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <HiStar
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
