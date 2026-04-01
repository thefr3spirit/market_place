import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-primary-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3">Marketplace</h3>
              <p className="text-primary-200 text-sm">
                Your trusted multi-vendor marketplace for buying and selling products.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-primary-200 text-sm">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/products" className="hover:text-white">Browse Products</a></li>
                <li><a href="/sell" className="hover:text-white">Sell an Item</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Contact</h3>
              <p className="text-primary-200 text-sm">support@marketplace.com</p>
            </div>
          </div>
          <div className="border-t border-primary-800 mt-8 pt-6 text-center text-primary-300 text-sm">
            © {new Date().getFullYear()} Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
