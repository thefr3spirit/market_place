import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../api/apiClient'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get('/orders/my-orders')
      .then((res) => setOrders(res.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId, status) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status })
      toast.success(`Order ${status}`)
      // Refresh
      const res = await apiClient.get('/orders/my-orders')
      setOrders(res.data.orders)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No orders yet</p>
          <p className="text-sm mt-1">Start shopping to see orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isBuyer = order.buyer_id === user?.id
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">Order #{order.id.split('-')[0]}</p>
                    <p className="text-lg font-bold text-green-600">
                      UGX {Number(order.price).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{isBuyer ? 'You bought' : 'You sold'}</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                {order.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    {!isBuyer && (
                      <button
                        onClick={() => updateStatus(order.id, 'confirmed')}
                        className="btn-primary text-xs !py-1.5 !px-3"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(order.id, 'cancelled')}
                      className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {order.status === 'confirmed' && !isBuyer && (
                  <button
                    onClick={() => updateStatus(order.id, 'shipped')}
                    className="btn-primary text-xs !py-1.5 !px-3 mt-3"
                  >
                    Mark Shipped
                  </button>
                )}
                {order.status === 'shipped' && isBuyer && (
                  <button
                    onClick={() => updateStatus(order.id, 'delivered')}
                    className="btn-primary text-xs !py-1.5 !px-3 mt-3"
                  >
                    Confirm Delivery
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
