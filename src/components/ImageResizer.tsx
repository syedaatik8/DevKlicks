import React, { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Palette,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  RefreshCw,
  Zap,
  FileImage,
  Maximize,
  Minimize
} from 'lucide-react'
import { useUsageTracking } from '../hooks/useUsageTracking'

interface ImageDimensions {
  width: number
  height: number
}

interface ResizeSettings {
  width: number
  height: number
  percentage: number
  lockAspectRatio: boolean
  backgroundColor: string
  outputFormat: string
}

const SUPPORTED_FORMATS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'bmp', label: 'BMP' }
]

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

export const ImageResizer: React.FC = () => {
  const { usage, incrementImageResize, canUseImageResize } = useUsageTracking()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ width: 0, height: 0 })
  const [resizedImage, setResizedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'percentage' | 'custom'>('percentage')
  
  const [settings, setSettings] = useState<ResizeSettings>({
    width: 0,
    height: 0,
    percentage: 100,
    lockAspectRatio: true,
    backgroundColor: '#ffffff',
    outputFormat: 'jpeg'
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    setError('')
    setSuccess('')
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 15MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setSelectedFile(file)
    setResizedImage(null) // Clear previous result
    
    const img = document.createElement('img') // Use document.createElement instead of new Image()
    img.onload = () => {
      setOriginalImage(img)
      setOriginalDimensions({ width: img.width, height: img.height })
      setSettings(prev => ({
        ...prev,
        width: img.width,
        height: img.height
      }))
    }
    
    img.src = URL.createObjectURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const updateDimensions = (field: 'width' | 'height' | 'percentage', value: number) => {
    if (!originalDimensions.width || !originalDimensions.height) return

    const aspectRatio = originalDimensions.width / originalDimensions.height

    setSettings(prev => {
      if (field === 'percentage') {
        const newWidth = Math.round((originalDimensions.width * value) / 100)
        const newHeight = Math.round((originalDimensions.height * value) / 100)
        return {
          ...prev,
          percentage: value,
          width: newWidth,
          height: newHeight
        }
      }

      if (field === 'width') {
        const newHeight = prev.lockAspectRatio ? Math.round(value / aspectRatio) : prev.height
        const newPercentage = Math.round((value / originalDimensions.width) * 100)
        return {
          ...prev,
          width: value,
          height: newHeight,
          percentage: newPercentage
        }
      }

      if (field === 'height') {
        const newWidth = prev.lockAspectRatio ? Math.round(value * aspectRatio) : prev.width
        const newPercentage = Math.round((value / originalDimensions.height) * 100)
        return {
          ...prev,
          width: newWidth,
          height: value,
          percentage: newPercentage
        }
      }

      return prev
    })
  }

  const resizeImage = async () => {
    if (!originalImage || !canvasRef.current) return

    // Check usage limits
    if (!canUseImageResize) {
      setError(`Daily limit reached (${usage.maxImageResizes} resizes). Upgrade for unlimited access!`)
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      canvas.width = settings.width
      canvas.height = settings.height

      // Fill background if not maintaining aspect ratio
      if (!settings.lockAspectRatio) {
        ctx.fillStyle = settings.backgroundColor
        ctx.fillRect(0, 0, settings.width, settings.height)
      }

      // Calculate positioning for aspect ratio maintenance
      let drawWidth = settings.width
      let drawHeight = settings.height
      let offsetX = 0
      let offsetY = 0

      if (settings.lockAspectRatio) {
        const originalAspect = originalImage.width / originalImage.height
        const targetAspect = settings.width / settings.height

        if (originalAspect > targetAspect) {
          drawHeight = settings.width / originalAspect
          offsetY = (settings.height - drawHeight) / 2
        } else {
          drawWidth = settings.height * originalAspect
          offsetX = (settings.width - drawWidth) / 2
        }

        // Fill background if there are gaps
        if (offsetX > 0 || offsetY > 0) {
          ctx.fillStyle = settings.backgroundColor
          ctx.fillRect(0, 0, settings.width, settings.height)
        }
      }

      // Apply image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      ctx.drawImage(originalImage, offsetX, offsetY, drawWidth, drawHeight)

      const quality = settings.outputFormat === 'jpeg' ? 0.92 : undefined
      const dataUrl = canvas.toDataURL(`image/${settings.outputFormat}`, quality)
      setResizedImage(dataUrl)
      
      // Increment usage counter
      await incrementImageResize()
      
      setSuccess('Image resized successfully!')
    } catch (err) {
      setError('Failed to resize image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!resizedImage || !selectedFile) return

    const link = document.createElement('a')
    link.download = `resized_${selectedFile.name.split('.')[0]}.${settings.outputFormat}`
    link.href = resizedImage
    link.click()
  }

  const resetAll = () => {
    setSelectedFile(null)
    setOriginalImage(null)
    setOriginalDimensions({ width: 0, height: 0 })
    setResizedImage(null)
    setError('')
    setSuccess('')
    setActiveTab('percentage')
    setSettings({
      width: 0,
      height: 0,
      percentage: 100,
      lockAspectRatio: true,
      backgroundColor: '#ffffff',
      outputFormat: 'jpeg'
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const startNewResize = () => {
    setSelectedFile(null)
    setOriginalImage(null)
    setOriginalDimensions({ width: 0, height: 0 })
    setResizedImage(null)
    setError('')
    setSuccess('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // If we have a resized image, show the result view
  if (resizedImage) {
    return (
      <div className="space-y-8">
        {/* Result Section */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Resized Image</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={startNewResize}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resize Another Image
              </button>
              <button
                onClick={downloadImage}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Download
              </button>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <img
              src={resizedImage}
              alt="Resized"
              className="w-full h-auto rounded-lg border border-gray-600"
            />
            <p className="text-center text-gray-400 mt-4">
              {settings.width} × {settings.height} pixels • {settings.outputFormat.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Free Plan Info at Bottom */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-400 font-medium">Free Plan Features</span>
          </div>
          <p className="text-gray-400 text-sm">
            • {usage.maxImageResizes} resizes per day ({usage.imageResizes} used today)<br/>
            • All image formats supported<br/>
            • High-quality processing<br/>
            • No watermarks
          </p>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Upload and Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section - 50% width */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Upload Image</h2>
          
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Drop your image here</h3>
              <p className="text-gray-400 mb-3">or click to browse files</p>
              <p className="text-sm text-gray-500">Supports JPEG, PNG, WebP, BMP, HEIC (max 15MB)</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedFile.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {originalDimensions.width} × {originalDimensions.height} pixels
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
                <button
                  onClick={resetAll}
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
          )}
        </div>

        {/* Information Section - 50% width */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">What You Can Do</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Maximize className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Resize Images</h3>
                <p className="text-gray-400 text-sm">Scale images by percentage or set custom dimensions with precision</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileImage className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Convert Formats</h3>
                <p className="text-gray-400 text-sm">Convert between JPEG, PNG, WebP, and BMP formats seamlessly</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Maintain Aspect Ratio</h3>
                <p className="text-gray-400 text-sm">Keep original proportions or unlock for custom ratios</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Palette className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Background Colors</h3>
                <p className="text-gray-400 text-sm">Add custom background colors when changing aspect ratios</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">High Quality Output</h3>
                <p className="text-gray-400 text-sm">Advanced image smoothing for professional results</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Minimize className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Compress Images</h3>
                <p className="text-gray-400 text-sm">Reduce file size while maintaining visual quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resize Controls */}
      {selectedFile && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Resize Settings</h2>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-700/30 rounded-lg p-1 mb-8">
            <button
              onClick={() => setActiveTab('percentage')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'percentage'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Resize by Percentage
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'custom'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Custom Dimensions
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'percentage' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Resize by Percentage: {settings.percentage}%
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={settings.percentage}
                onChange={(e) => updateDimensions('percentage', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>200%</span>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                New size: {settings.width} × {settings.height} pixels
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-300">Custom Dimensions</label>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, lockAspectRatio: !prev.lockAspectRatio }))}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                    settings.lockAspectRatio 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                  }`}
                >
                  {settings.lockAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  <span className="text-sm">Lock Ratio</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={settings.width}
                    onChange={(e) => updateDimensions('width', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={settings.height}
                    onChange={(e) => updateDimensions('height', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Background Color - Only show when aspect ratio is unlocked */}
              {!settings.lockAspectRatio && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Background Color (for padding areas)
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-10 rounded-lg border border-gray-600 cursor-pointer"
                      />
                      <Palette className="absolute inset-0 w-6 h-6 text-gray-400 pointer-events-none m-auto" />
                    </div>
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={resizeImage}
              disabled={isProcessing || !canUseImageResize}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </div>
              ) : !canUseImageResize ? (
                `Daily Limit Reached (${usage.imageResizes}/${usage.maxImageResizes})`
              ) : (
                'Resize Image'
              )}
            </button>

            {/* Output Format */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-300 whitespace-nowrap">Export as:</label>
              <select
                value={settings.outputFormat}
                onChange={(e) => setSettings(prev => ({ ...prev, outputFormat: e.target.value }))}
                className="px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_FORMATS.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={resetAll}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Free Plan Info at Bottom */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-blue-400 font-medium">Free Plan Features</span>
        </div>
        <p className="text-gray-400 text-sm">
          • {usage.maxImageResizes} resizes per day ({usage.imageResizes} used today)<br/>
          • All image formats supported<br/>
          • High-quality processing<br/>
          • No watermarks
        </p>
      </div>

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