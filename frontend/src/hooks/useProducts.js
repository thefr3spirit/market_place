import { useCallback, useEffect, useState } from 'react'
import apiClient from '../api/apiClient'

export default function useProducts({ page = 1, pageSize = 20, categoryId = null } = {}) {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, page_size: pageSize }
      if (categoryId) params.category_id = categoryId
      const res = await apiClient.get('/products', { params })
      setProducts(res.data.products)
      setTotal(res.data.total)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, categoryId])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, total, loading, error, refetch: fetchProducts }
}
