import React, { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  Download, 
  Scissors,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  RefreshCw,
  Zap,
  FileImage,
  Crown,
  Heart,
  Trash2,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToastContext } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'

interface ProcessedImage {
  id?: string
  name: string
  original_url: string
  processed_url: string
  original_size: { width: number; height: number }
  processed_size: { width: number; height: number }
  created_at?: string
  tempId?: string
}

const MAX_FREE_BACKGROUND_REMOVALS = 5
const MAX_PREMIUM_BACKGROUND_REMOVALS = 20
const MAX_FREE_SAVED = 5
const MAX_PREMIUM_SAVED = 15

export const BackgroundRemover: React.FC = () => {
  const { user, userTier } = useAuth()
  const toast = useToastContext()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [processedImageData, setProcessedImageData] = useState<ProcessedImage | null>(null)
  const [savedImages, setSavedImages] = useState<ProcessedImage[]>([])
  const [dailyUsage, setDailyUsage] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'remover' | 'saved'>('remover')
  
  const isPremium = userTier === 'premium'
  const maxDailyRemovals = isPremium ? MAX_PREMIUM_BACKGROUND_REMOVALS : MAX_FREE_BACKGROUND_REMOVALS
  const maxSavedImages = isPremium ? MAX_PREMIUM_SAVED : MAX_FREE_SAVED

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved images and usage on component mount
  React.useEffect(() => {
    loadSavedImages()
    loadDailyUsage()
  }, [])

  const loadSavedImages = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('background_removed_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedImages(data || [])
    } catch (err) {
      console.error('Error loading saved images:', err)
    }
  }

  const loadDailyUsage = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('get_usage', {
        p_user_id: user.id,
        p_feature_type: 'background_removal'
      })

      if (error) throw error
      setDailyUsage(data || 0)
    } catch (err) {
      console.error('Error loading usage:', err)
    }
  }

  const incrementUsage = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_feature_type: 'background_removal'
      })

      if (error) throw error
      setDailyUsage(data)
    } catch (err) {
      console.error('Error incrementing usage:', err)
    }
  }

  const handleFileSelect = useCallback((file: File) => {
    setError('')
    setSuccess('')
    
    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be less than 15MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setSelectedFile(file)
    setProcessedImage(null)
    setProcessedImageData(null)
    
    const img = document.createElement('img')
    img.onload = () => {
      setOriginalImage(img)
    }
    
    img.src = URL.createObjectURL(file)
  }, [])

  const removeBackgroundWithClipdrop = async (imageFile: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image_file', imageFile)

    // Use Supabase Edge Function to hide API key
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/remove-background`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Background removal error:', errorData)
      
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.')
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Please try again.')
      } else if (response.status === 400) {
        throw new Error(errorData.error || 'Invalid image format. Please use JPEG, PNG, or WebP.')
      } else {
        throw new Error(`API error: ${response.status}. Please try again.`)
      }
    }

    const blob = await response.blob()
    
    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const removeBackground = async () => {
    if (!originalImage || !selectedFile) return

    // Check usage limits
    if (dailyUsage >= maxDailyRemovals) {
      setError(`Daily limit reached (${maxDailyRemovals} removals). ${isPremium ? 'Contact support for higher limits.' : 'Upgrade to Premium for more!'}`)
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Use Clipdrop API for background removal
      const processedDataUrl = await removeBackgroundWithClipdrop(selectedFile)
      
      setProcessedImage(processedDataUrl)

      // Create processed image data object
      const originalName = selectedFile.name.split('.')[0]
      const processedData_obj: ProcessedImage = {
        name: `${originalName}_background_removed.png`,
        original_url: originalImage.src,
        processed_url: processedDataUrl,
        original_size: { width: originalImage.width, height: originalImage.height },
        processed_size: { width: originalImage.width, height: originalImage.height }, // Clipdrop maintains original dimensions
        tempId: Date.now().toString()
      }
      setProcessedImageData(processedData_obj)

      // Increment usage counter
      await incrementUsage()
      
      setSuccess('Background removed successfully using AI!')
      toast.success('Background removed!', 'AI has successfully removed the background')
    } catch (err: any) {
      console.error('Background removal error:', err)
      setError(err.message || 'Failed to remove background. Please try again.')
      toast.error('Processing failed', err.message || 'Failed to remove background')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedImage || !processedImageData) return

    const link = document.createElement('a')
    link.download = processedImageData.name
    link.href = processedImage
    link.click()
  }

  const saveImage = async () => {
    if (!user || !processedImageData) return

    if (savedImages.length >= maxSavedImages) {
      setError(`You can save up to ${maxSavedImages} images. ${isPremium ? 'Contact support for higher limits.' : 'Upgrade to Premium for more!'}`)
      return
    }

    const imageName = prompt('Enter a name for this image:')
    if (!imageName) return

    try {
      const { error } = await supabase
        .from('background_removed_images')
        .insert({
          user_id: user.id,
          name: imageName,
          original_url: processedImageData.original_url,
          processed_url: processedImageData.processed_url,
          original_size: processedImageData.original_size,
          processed_size: processedImageData.processed_size
        })

      if (error) throw error

      setSuccess('Image saved successfully!')
      toast.success('Image saved!', 'Your processed image has been saved')
      loadSavedImages()
    } catch (err) {
      setError('Failed to save image')
      toast.error('Save failed', 'Failed to save image')
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const { error } = await supabase
        .from('background_removed_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      setSuccess('Image deleted successfully!')
      toast.success('Image deleted!', 'Your processed image has been deleted')
      loadSavedImages()
    } catch (err) {
      setError('Failed to delete image')
      toast.error('Delete failed', 'Failed to delete image')
    }
  }

  const resetTool = () => {
    setSelectedFile(null)
    setOriginalImage(null)
    setProcessedImage(null)
    setProcessedImageData(null)
    setError('')
    setSuccess('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Premium Only Notice for Free Users */}
      {!isPremium && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-yellow-500 mr-3" />
            <h3 className="text-2xl font-bold text-white">Premium Feature</h3>
          </div>
          <p className="text-gray-400 text-center mb-6">
            AI-powered background removal is available for Premium users only. 
            Upgrade to access professional background removal with industry-leading AI technology.
          </p>
          <div className="text-center">
            <button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {isPremium && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {isPremium && success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <p className="text-green-400">{success}</p>
          </div>
        </div>
      )}

      {/* Header with Reset Button */}
      {isPremium && (selectedFile || processedImage) && (
        <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Current Project</h3>
            <p className="text-gray-400 text-sm">
              {selectedFile ? selectedFile.name : 'Background removed successfully'}
            </p>
          </div>
          <button
            onClick={resetTool}
            className="flex items-center px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Remove Another Background
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      {isPremium && <div className="flex space-x-1 bg-gray-700/30 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('remover')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'remover'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Background Remover
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'saved'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Saved Images ({savedImages.length}/{maxSavedImages})
        </button>
      </div>
      }
      {/* Usage Info */}
      {isPremium && <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-400 font-medium">
              {isPremium ? 'Premium Plan' : 'Free Plan'} - Daily Usage: {dailyUsage}/{maxDailyRemovals}
            </span>
          </div>
          {!isPremium && (
            <Crown className="w-5 h-5 text-yellow-500" />
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1">
          {isPremium 
            ? '• AI-powered Clipdrop API • Original quality output • Priority support'
            : '• AI-powered Clipdrop API • Professional results • Upgrade for more removals'
          }
        </p>
      </div>
      }
      {/* Background Remover Tab */}
      {isPremium && activeTab === 'remover' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Upload Image</h2>
            
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Drop your image here</h3>
                <p className="text-gray-400 mb-3">or click to browse files</p>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="text-purple-400 font-medium">AI-Powered Background Removal</span>
                  </div>
                  <p className="text-purple-300 text-sm">Professional results using advanced AI technology</p>
                </div>
                <p className="text-sm text-gray-500">Supports JPEG, PNG, WebP (max 15MB)</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedFile.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {originalImage?.width} × {originalImage?.height} pixels
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                    <button
                      onClick={resetTool}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {originalImage && (
                    <div className="max-w-xs mx-auto">
                      <img
                        src={originalImage.src}
                        alt="Original"
                        className="w-full h-auto rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Process Button */}
                <button
                  onClick={removeBackground}
                  disabled={isProcessing || dailyUsage >= maxDailyRemovals}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Removing Background with AI...
                    </div>
                  ) : dailyUsage >= maxDailyRemovals ? (
                    `Daily Limit Reached (${dailyUsage}/${maxDailyRemovals})`
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Remove Background with AI
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Result</h2>
            
            {processedImage && processedImageData ? (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={saveImage}
                    className="flex items-center px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save Image
                  </button>
                  <button
                    onClick={downloadImage}
                    className="flex items-center px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 border border-green-500/30 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </button>
                </div>

                {/* Processed Image */}
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="mb-3">
                    <h4 className="text-white font-medium">{processedImageData.name}</h4>
                    <p className="text-xs text-gray-400">
                      {processedImageData.processed_size.width} × {processedImageData.processed_size.height} pixels • PNG
                      <span className="text-purple-400 ml-2">(AI Processed)</span>
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <img
                      src={processedImage}
                      alt="Background Removed"
                      className="w-full h-auto rounded-lg"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <FileImage className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload an image to remove background</p>
                <p className="text-sm">AI will automatically detect and remove the background</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Images Tab */}
      {isPremium && activeTab === 'saved' && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Saved Images</h2>
            <div className="text-sm text-gray-400">
              {savedImages.length}/{maxSavedImages} images saved
            </div>
          </div>
          
          {savedImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedImages.map((image) => (
                <div key={image.id} className="bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium text-sm">{image.name}</h4>
                    <button
                      onClick={() => deleteImage(image.id!)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
                    <img
                      src={image.processed_url}
                      alt={image.name}
                      className="w-full h-32 object-contain rounded"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-3">
                    <p>{image.processed_size.width} × {image.processed_size.height} pixels • PNG</p>
                    <p>{new Date(image.created_at!).toLocaleDateString()}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.download = `${image.name.replace(/\s+/g, '_')}.png`
                      link.href = image.processed_url
                      link.click()
                    }}
                    className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg py-2 transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download PNG
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No saved images yet</p>
              <p className="text-sm">Process and save images from the background remover</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}