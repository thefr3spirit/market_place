import { createContext, useCallback, useContext, useState } from 'react'
import apiClient from '../api/apiClient'

const MarketplaceContext = createContext(null)

export function MarketplaceProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('darkMode', String(next))
      return next
    })
  }

  // Categories cache
  const [categories, setCategories] = useState([])
  const fetchCategories = useCallback(async () => {
    if (categories.length > 0) return categories
    const res = await apiClient.get('/products/categories')
    setCategories(res.data)
    return res.data
  }, [categories])

  return (
    <MarketplaceContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        categories,
        fetchCategories,
      }}
    >
      <div className={darkMode ? 'dark' : ''}>{children}</div>
    </MarketplaceContext.Provider>
  )
}

export const useMarketplace = () => useContext(MarketplaceContext)
