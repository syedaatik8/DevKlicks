import React, { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  Download, 
  Palette,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Heart,
  Trash2,
  Square,
  Image as ImageIcon,
  RefreshCw,
  Archive
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import JSZip from 'jszip'

interface SavedFavicon {
  id?: string
  name: string
  original_image: string
  background_color: string
  sizes: {
    '16x16': string
    '32x32': string
    '64x64': string
    '128x128': string
  }
  created_at?: string
}

const FAVICON_SIZES = [
  { size: 16, label: '16×16', description: 'Browser tab' },
  { size: 32, label: '32×32', description: 'Taskbar' },
  { size: 64, label: '64×64', description: 'Desktop' },
  { size: 128, label: '128×128', description: 'High-res displays' }
]

const MAX_FREE_FAVICONS = 10

export const FaviconGenerator: React.FC = () => {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false)
  const [generatedFavicons, setGeneratedFavicons] = useState<{ [key: string]: string }>({})
  const [savedFavicons, setSavedFavicons] = useState<SavedFavicon[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'generator' | 'saved'>('generator')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load saved favicons on component mount
  React.useEffect(() => {
    loadSavedFavicons()
  }, [])

  const loadSavedFavicons = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('saved_favicons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedFavicons(data || [])
    } catch (err) {
      console.error('Error loading saved favicons:', err)
    }
  }

  const handleFileSelect = useCallback((file: File) => {
    setError('')
    setSuccess('')
    
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setSelectedFile(file)
    setGeneratedFavicons({})
    
    const img = document.createElement('img')
    img.onload = () => {
      setOriginalImage(img)
      
      // Check if image has transparency
      checkImageTransparency(img)
    }
    
    img.src = URL.createObjectURL(file)
  }, [])

  const checkImageTransparency = async (img: HTMLImageElement) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Check for transparency
    let hasTransparency = false
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        hasTransparency = true
        break
      }
    }

    if (hasTransparency) {
      setShowBackgroundPicker(true)
      setSuccess('Transparent areas detected! You can add a background color for better visibility.')
    } else {
      setShowBackgroundPicker(false)
    }
  }

  const generateFavicons = async () => {
    if (!originalImage || !canvasRef.current) return

    setIsProcessing(true)
    setError('')

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      const newFavicons: { [key: string]: string } = {}

      // Generate each size
      for (const { size } of FAVICON_SIZES) {
        canvas.width = size
        canvas.height = size

        // Fill background if color is selected
        if (showBackgroundPicker && backgroundColor) {
          ctx.fillStyle = backgroundColor
          ctx.fillRect(0, 0, size, size)
        } else {
          ctx.clearRect(0, 0, size, size)
        }

        // Calculate dimensions to maintain aspect ratio and center the image
        const imageAspect = originalImage.width / originalImage.height
        let drawWidth = size
        let drawHeight = size

        if (imageAspect > 1) {
          // Image is wider than tall
          drawHeight = size / imageAspect
        } else if (imageAspect < 1) {
          // Image is taller than wide
          drawWidth = size * imageAspect
        }

        const offsetX = (size - drawWidth) / 2
        const offsetY = (size - drawHeight) / 2

        // Apply high-quality scaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        ctx.drawImage(originalImage, offsetX, offsetY, drawWidth, drawHeight)

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png')
        newFavicons[`${size}x${size}`] = dataUrl
      }

      setGeneratedFavicons(newFavicons)
      setSuccess('Favicons generated successfully!')
    } catch (err) {
      setError('Failed to generate favicons. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadFavicon = (size: string, dataUrl: string) => {
    const link = document.createElement('a')
    link.download = `favicon-${size}.png`
    link.href = dataUrl
    link.click()
  }

  // Create and download ZIP file with all favicons
  const downloadAllFaviconsAsZip = async () => {
    try {
      const zip = new JSZip()

      // Add each favicon to the zip
      Object.entries(generatedFavicons).forEach(([size, dataUrl]) => {
        // Convert data URL to blob
        const base64Data = dataUrl.split(',')[1]
        zip.file(`favicon-${size}.png`, base64Data, { base64: true })
      })

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Download the zip
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = `favicons-${selectedFile?.name?.split('.')[0] || 'icons'}.zip`
      link.click()
      
      // Clean up
      URL.revokeObjectURL(link.href)
      
      setSuccess('Favicon ZIP downloaded successfully!')
    } catch (err) {
      setError('Failed to create ZIP file. Downloading individually...')
      // Fallback to individual downloads
      Object.entries(generatedFavicons).forEach(([size, dataUrl], index) => {
        setTimeout(() => downloadFavicon(size, dataUrl), index * 200)
      })
    }
  }

  const saveFaviconSet = async () => {
    if (!user || !selectedFile || Object.keys(generatedFavicons).length === 0) return

    // Check if user has reached the free limit
    if (savedFavicons.length >= MAX_FREE_FAVICONS) {
      setError(`Free users can save up to ${MAX_FREE_FAVICONS} favicon sets. Upgrade for unlimited storage!`)
      return
    }

    const faviconName = prompt('Enter a name for this favicon set:')
    if (!faviconName) return

    try {
      // Convert original image to base64
      const originalImageData = originalImage?.src || ''

      const { error } = await supabase
        .from('saved_favicons')
        .insert({
          user_id: user.id,
          name: faviconName,
          original_image: originalImageData,
          background_color: showBackgroundPicker ? backgroundColor : '',
          sizes: generatedFavicons
        })

      if (error) throw error

      setSuccess('Favicon set saved successfully!')
      loadSavedFavicons()
    } catch (err) {
      setError('Failed to save favicon set')
    }
  }

  const deleteFaviconSet = async (faviconId: string) => {
    if (!confirm('Are you sure you want to delete this favicon set?')) return

    try {
      const { error } = await supabase
        .from('saved_favicons')
        .delete()
        .eq('id', faviconId)

      if (error) throw error

      setSuccess('Favicon set deleted successfully!')
      loadSavedFavicons()
    } catch (err) {
      setError('Failed to delete favicon set')
    }
  }

  const resetGenerator = () => {
    setSelectedFile(null)
    setOriginalImage(null)
    setGeneratedFavicons({})
    setShowBackgroundPicker(false)
    setBackgroundColor('#ffffff')
    setError('')
    setSuccess('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSavedFaviconSetAsZip = async (faviconSet: SavedFavicon) => {
    try {
      const zip = new JSZip()

      // Add each favicon to the zip
      Object.entries(faviconSet.sizes).forEach(([size, dataUrl]) => {
        // Convert data URL to blob
        const base64Data = dataUrl.split(',')[1]
        zip.file(`favicon-${size}.png`, base64Data, { base64: true })
      })

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Download the zip
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = `${faviconSet.name.replace(/\s+/g, '_')}-favicons.zip`
      link.click()
      
      // Clean up
      URL.revokeObjectURL(link.href)
      
      setSuccess('Favicon ZIP downloaded successfully!')
    } catch (err) {
      setError('Failed to create ZIP file. Downloading individually...')
      // Fallback to individual downloads
      Object.entries(faviconSet.sizes).forEach(([size, dataUrl], index) => {
        setTimeout(() => downloadFavicon(size, dataUrl), index * 200)
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with Generate Another Button */}
      {(selectedFile || Object.keys(generatedFavicons).length > 0) && (
        <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Current Project</h3>
            <p className="text-gray-400 text-sm">
              {selectedFile ? selectedFile.name : 'Generated favicons ready'}
            </p>
          </div>
          <button
            onClick={resetGenerator}
            className="flex items-center px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Another Favicon
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-700/30 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'generator'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Favicon Generator
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Saved Favicons ({savedFavicons.length}/{MAX_FREE_FAVICONS})
        </button>
      </div>

      {/* Generator Tab */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Upload Icon</h2>
            
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Drop your icon here</h3>
                <p className="text-gray-400 mb-3">or click to browse files</p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-center mb-2">
                    <Square className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-blue-400 font-medium">Recommended: 1:1 Ratio</span>
                  </div>
                  <p className="text-blue-300 text-sm">Square images work best for favicons</p>
                </div>
                <p className="text-sm text-gray-500">Supports JPEG, PNG, WebP, SVG (max 10MB)</p>
                
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
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={resetGenerator}
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

                {/* Background Color Picker */}
                {showBackgroundPicker && (
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium">Background Color</h4>
                        <p className="text-gray-400 text-sm">Add background for transparent areas</p>
                      </div>
                      <button
                        onClick={() => setShowBackgroundPicker(false)}
                        className="text-gray-400 hover:text-gray-300 text-sm"
                      >
                        Skip
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={generateFavicons}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Generating Favicons...
                    </div>
                  ) : (
                    'Generate Favicons'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Generated Favicons */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Generated Favicons</h2>
            
            {Object.keys(generatedFavicons).length > 0 ? (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={saveFaviconSet}
                    className="flex items-center px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save Set
                  </button>
                  <button
                    onClick={downloadAllFaviconsAsZip}
                    className="flex items-center px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 border border-green-500/30 rounded-lg transition-colors"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Download ZIP
                  </button>
                </div>

                {/* Favicon Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {FAVICON_SIZES.map(({ size, label, description }) => {
                    const dataUrl = generatedFavicons[`${size}x${size}`]
                    if (!dataUrl) return null

                    return (
                      <div key={size} className="bg-gray-700/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">{label}</h4>
                            <p className="text-xs text-gray-400">{description}</p>
                          </div>
                          <button
                            onClick={() => downloadFavicon(`${size}x${size}`, dataUrl)}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                            title="Download this size"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-center bg-gray-800/50 rounded-lg p-4 min-h-[80px]">
                          <img
                            src={dataUrl}
                            alt={`Favicon ${label}`}
                            className="max-w-full max-h-full"
                            style={{ 
                              width: `${Math.min(size, 64)}px`, 
                              height: `${Math.min(size, 64)}px`,
                              imageRendering: size <= 32 ? 'pixelated' : 'auto'
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload an icon to generate favicons</p>
                <p className="text-sm">Multiple sizes will be created automatically</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Favicons Tab */}
      {activeTab === 'saved' && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Saved Favicon Sets</h2>
            <div className="text-sm text-gray-400">
              {savedFavicons.length}/{MAX_FREE_FAVICONS} sets used
            </div>
          </div>
          
          {savedFavicons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedFavicons.map((faviconSet) => (
                <div key={faviconSet.id} className="bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-medium">{faviconSet.name}</h4>
                      <p className="text-xs text-gray-400">
                        {new Date(faviconSet.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteFaviconSet(faviconSet.id!)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete favicon set"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Object.entries(faviconSet.sizes).map(([size, dataUrl]) => (
                      <div key={size} className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <img
                          src={dataUrl}
                          alt={`Favicon ${size}`}
                          className="w-8 h-8 mx-auto mb-1"
                          style={{ imageRendering: parseInt(size) <= 32 ? 'pixelated' : 'auto' }}
                        />
                        <p className="text-xs text-gray-400">{size}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => downloadSavedFaviconSetAsZip(faviconSet)}
                    className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg py-2 transition-colors"
                  >
                    <Archive className="w-4 h-4 inline mr-2" />
                    Download ZIP
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No saved favicon sets yet</p>
              <p className="text-sm">Generate and save favicon sets from the generator tab</p>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <p className="text-green-400">{success}</p>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}