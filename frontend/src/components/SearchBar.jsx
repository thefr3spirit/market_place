import { useState } from 'react'
import { HiSearch } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ className = '' }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What are you looking for?"
        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 
                   dark:border-gray-700 bg-white dark:bg-gray-800 
                   focus:border-primary-400 focus:ring-0 outline-none
                   text-gray-900 dark:text-white placeholder-gray-400 text-base"
      />
      <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-900 text-white 
                   px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
