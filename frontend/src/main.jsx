import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { MarketplaceProvider } from './context/MarketplaceContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MarketplaceProvider>
          <App />
          <Toaster position="top-right" />
        </MarketplaceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
