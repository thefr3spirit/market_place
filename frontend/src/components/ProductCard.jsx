import { HiHeart, HiStar } from 'react-icons/hi'
import { Link } from 'react-router-dom'

export default function ProductCard({ product, onWishlist }) {
  const mainImage =
    product.images?.length > 0
      ? product.images[0].image_url
      : 'https://via.placeholder.com/300x200?text=No+Image'

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="card group cursor-pointer">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
            }}
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {product.condition === 'new' && (
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-md">
                New
              </span>
            )}
          </div>
          {/* Wishlist button */}
          {onWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onWishlist(product.id)
              }}
              className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white
                         transition-colors shadow-sm"
            >
              <HiHeart className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {product.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base font-bold text-green-600">
              UGX {Number(product.price).toLocaleString()}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <HiStar className="w-3.5 h-3.5 text-amber-400" />
            <span>4.5</span>
            {product.location && (
              <>
                <span className="mx-1">·</span>
                <span>{product.location}</span>
              </>
            )}
          </div>
          {product.seller && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 truncate">
              by {product.seller.username}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
