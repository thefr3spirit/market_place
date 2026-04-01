import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { HiPhotograph, HiX } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { useAuth } from '../context/AuthContext'
import { useMarketplace } from '../context/MarketplaceContext'

export default function CreateListing() {
  const { user } = useAuth()
  const { categories, fetchCategories } = useMarketplace()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    location: '',
    condition: 'new',
  })
  const [images, setImages] = useState([]) // File objects
  const [previews, setPreviews] = useState([]) // preview URLs
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchCategories()
  }, [user])

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFiles = (files) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const newFiles = Array.from(files).filter(
      (f) => allowed.includes(f.type) && f.size <= 5 * 1024 * 1024
    )
    const total = images.length + newFiles.length
    if (total > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    const updatedImages = [...images, ...newFiles]
    const updatedPreviews = updatedImages.map((f) => URL.createObjectURL(f))
    setImages(updatedImages)
    setPreviews(updatedPreviews)
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index])
    setImages(images.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('price', parseFloat(form.price))
      formData.append('category_id', form.category_id)
      formData.append('location', form.location)
      formData.append('condition', form.condition)
      images.forEach((file) => formData.append('images', file))

      await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Product listed successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sell Something</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images first — most visual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Photos (up to 5)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6
                       hover:border-primary-500 transition-colors cursor-pointer
                       flex flex-col items-center justify-center text-center min-h-[120px]"
          >
            <HiPhotograph className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-primary-600 font-medium">Click to upload</span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF — max 5MB each</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          {previews.length > 0 && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiX className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={200}
            className="input-field"
            placeholder="What are you selling?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (UGX)</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min="1"
              step="any"
              className="input-field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            minLength={10}
            rows={3}
            className="input-field"
            placeholder="Describe your product..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
            <select name="condition" value={form.condition} onChange={handleChange} className="input-field">
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="input-field"
              placeholder="City or area"
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full text-lg py-3">
          {submitting ? 'Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  )
}
