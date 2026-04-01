import { useEffect, useState } from 'react'
import {
    HiBookOpen,
    HiCube,
    HiDesktopComputer,
    HiDeviceMobile,
    HiHome as HiHomeIcon,
    HiMusicNote,
    HiSparkles,
    HiTruck
} from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useMarketplace } from '../context/MarketplaceContext'

const CATEGORY_ICONS = {
  'Electronics': HiDeviceMobile,
  'Computers': HiDesktopComputer,
  'Home': HiHomeIcon,
  'Vehicles': HiTruck,
  'Fashion': HiSparkles,
  'Books': HiBookOpen,
  'Music': HiMusicNote,
}

export default function CategoryList() {
  const { categories, fetchCategories } = useMarketplace()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchCategories().finally(() => setLoading(false))
  }, [])

  if (loading && categories.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto py-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.name] || HiCube
        return (
          <Link
            key={cat.id}
            to={`/?category=${cat.id}`}
            className="flex flex-col items-center gap-1.5 min-w-[80px] p-3 rounded-xl
                       bg-primary-50 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-gray-700 
                       transition-colors group"
          >
            <Icon className="w-6 h-6 text-primary-900 dark:text-primary-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center whitespace-nowrap">
              {cat.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
