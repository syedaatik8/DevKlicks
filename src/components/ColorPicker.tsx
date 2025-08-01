import React, { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  Save, 
  Palette,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  RefreshCw,
  Shuffle,
  Heart,
  Copy,
  Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface ColorPalette {
  id?: string
  name: string
  colors: string[]
  source_type: 'manual' | 'logo' | 'random'
  source_data?: string
  created_at?: string
}

interface RandomPaletteType {
  name: string
  description: string
  baseColors: string[]
}

const RANDOM_PALETTE_TYPES: RandomPaletteType[] = [
  {
    name: 'Cool Colors',
    description: 'Blues, greens, and purples',
    baseColors: ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#059669', '#7C3AED']
  },
  {
    name: 'Warm Colors',
    description: 'Reds, oranges, and yellows',
    baseColors: ['#EF4444', '#F97316', '#F59E0B', '#DC2626', '#EA580C', '#D97706']
  },
  {
    name: 'Dark Colors',
    description: 'Deep and rich tones',
    baseColors: ['#1F2937', '#374151', '#4B5563', '#111827', '#1E293B', '#0F172A']
  },
  {
    name: 'Light Colors',
    description: 'Soft and pastel tones',
    baseColors: ['#F3F4F6', '#E5E7EB', '#D1D5DB', '#F9FAFB', '#F1F5F9', '#FAFAFA']
  },
  {
    name: 'Vibrant Colors',
    description: 'Bold and energetic',
    baseColors: ['#FF0080', '#00FF80', '#8000FF', '#FF8000', '#0080FF', '#80FF00']
  },
  {
    name: 'Earth Tones',
    description: 'Natural and organic',
    baseColors: ['#92400E', '#78350F', '#451A03', '#A16207', '#B45309', '#D97706']
  }
]

const MAX_FREE_PALETTES = 5

export const ColorPicker: React.FC = () => {
  const { user } = useAuth()
  const [selectedColor, setSelectedColor] = useState('#3B82F6')
  const [generatedPalettes, setGeneratedPalettes] = useState<string[][]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null)
  const [logoPalette, setLogoPalette] = useState<string[]>([])
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'manual' | 'logo' | 'saved'>('manual')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load saved palettes on component mount
  React.useEffect(() => {
    loadSavedPalettes()
  }, [])

  const loadSavedPalettes = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('color_palettes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedPalettes(data || [])
    } catch (err) {
      console.error('Error loading saved palettes:', err)
    }
  }

  const generatePalettesFromColor = useCallback((baseColor: string) => {
    const palettes: string[][] = []
    
    // Convert hex to HSL
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0, s = 0, l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      return [h * 360, s * 100, l * 100]
    }

    // Convert HSL to hex
    const hslToHex = (h: number, s: number, l: number) => {
      h /= 360; s /= 100; l /= 100
      const a = s * Math.min(l, 1 - l)
      const f = (n: number) => {
        const k = (n + h * 12) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color).toString(16).padStart(2, '0')
      }
      return `#${f(0)}${f(8)}${f(4)}`
    }

    const [h, s, l] = hexToHsl(baseColor)

    // Palette 1: Monochromatic (different lightness)
    const mono = [
      hslToHex(h, s, Math.max(10, l - 30)),
      hslToHex(h, s, Math.max(20, l - 15)),
      baseColor,
      hslToHex(h, s, Math.min(90, l + 15)),
      hslToHex(h, s, Math.min(95, l + 30))
    ]
    palettes.push(mono)

    // Palette 2: Analogous (similar hues)
    const analogous = [
      hslToHex((h - 30 + 360) % 360, s, l),
      hslToHex((h - 15 + 360) % 360, s, l),
      baseColor,
      hslToHex((h + 15) % 360, s, l),
      hslToHex((h + 30) % 360, s, l)
    ]
    palettes.push(analogous)

    // Palette 3: Complementary (opposite hues)
    const complementary = [
      hslToHex(h, s, Math.max(20, l - 20)),
      hslToHex(h, s, l),
      baseColor,
      hslToHex((h + 180) % 360, s, l),
      hslToHex((h + 180) % 360, s, Math.min(80, l + 20))
    ]
    palettes.push(complementary)

    return palettes
  }, [])

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    const palettes = generatePalettesFromColor(color)
    setGeneratedPalettes(palettes)
  }

  const handleLogoUpload = useCallback((file: File) => {
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

    setLogoFile(file)
    
    const img = document.createElement('img')
    img.onload = () => {
      setLogoImage(img)
      extractColorsFromLogo(img)
    }
    
    img.src = URL.createObjectURL(file)
  }, [])

  const extractColorsFromLogo = async (img: HTMLImageElement) => {
    if (!canvasRef.current) return

    setIsProcessing(true)
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Resize image for processing
      const maxSize = 200
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Extract colors using k-means clustering approach
      const pixels: number[][] = []
      
      // Sample pixels (every 4th pixel to reduce processing)
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]
        
        // Skip transparent or very light/dark pixels
        if (a < 128 || (r + g + b) < 50 || (r + g + b) > 700) continue
        
        pixels.push([r, g, b])
      }

      if (pixels.length < 10) {
        throw new Error('Not enough color data in image')
      }

      // Simple k-means clustering to find 3 dominant colors
      const dominantColors = findDominantColors(pixels, 3)
      
      // Convert to hex
      const hexColors = dominantColors.map(([r, g, b]) => 
        `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
      )

      // Generate 2 shades from the most dominant color
      const shades = generateShadesFromColors(hexColors)
      
      const palette = [
        ...hexColors,
        ...shades
      ]
      
      setLogoPalette(palette)
    } catch (err) {
      setError('Failed to extract colors from logo')
    } finally {
      setIsProcessing(false)
    }
  }

  const findDominantColors = (pixels: number[][], k: number): number[][] => {
    if (pixels.length === 0) return []
    
    // Initialize centroids randomly
    let centroids: number[][] = []
    for (let i = 0; i < k; i++) {
      const randomPixel = pixels[Math.floor(Math.random() * pixels.length)]
      centroids.push([...randomPixel])
    }

    // K-means iterations
    for (let iter = 0; iter < 10; iter++) {
      const clusters: number[][][] = Array(k).fill(null).map(() => [])
      
      // Assign pixels to nearest centroid
      pixels.forEach(pixel => {
        let minDistance = Infinity
        let closestCentroid = 0
        
        centroids.forEach((centroid, index) => {
          const distance = Math.sqrt(
            Math.pow(pixel[0] - centroid[0], 2) +
            Math.pow(pixel[1] - centroid[1], 2) +
            Math.pow(pixel[2] - centroid[2], 2)
          )
          
          if (distance < minDistance) {
            minDistance = distance
            closestCentroid = index
          }
        })
        
        clusters[closestCentroid].push(pixel)
      })
      
      // Update centroids
      const newCentroids: number[][] = []
      clusters.forEach(cluster => {
        if (cluster.length > 0) {
          const avgR = cluster.reduce((sum, p) => sum + p[0], 0) / cluster.length
          const avgG = cluster.reduce((sum, p) => sum + p[1], 0) / cluster.length
          const avgB = cluster.reduce((sum, p) => sum + p[2], 0) / cluster.length
          newCentroids.push([avgR, avgG, avgB])
        } else {
          // Keep old centroid if cluster is empty
          newCentroids.push(centroids[newCentroids.length])
        }
      })
      
      centroids = newCentroids
    }

    // Sort by cluster size (most dominant first)
    const clustersWithSizes = centroids.map((centroid, index) => {
      const clusterSize = pixels.filter(pixel => {
        const distances = centroids.map(c => 
          Math.sqrt(
            Math.pow(pixel[0] - c[0], 2) +
            Math.pow(pixel[1] - c[1], 2) +
            Math.pow(pixel[2] - c[2], 2)
          )
        )
        const minIndex = distances.indexOf(Math.min(...distances))
        return minIndex === index
      }).length
      
      return { centroid, size: clusterSize }
    })

    return clustersWithSizes
      .sort((a, b) => b.size - a.size)
      .map(item => item.centroid)
      .slice(0, k)
  }

  const generateShadesFromColors = (colors: string[]): string[] => {
    if (colors.length === 0) return []
    
    // Use the most dominant color (first one) to generate shades
    const dominantColor = colors[0]
    
    // Convert hex to HSL for shade generation
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0, s = 0, l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      return [h * 360, s * 100, l * 100]
    }

    const hslToHex = (h: number, s: number, l: number) => {
      h /= 360; s /= 100; l /= 100
      const a = s * Math.min(l, 1 - l)
      const f = (n: number) => {
        const k = (n + h * 12) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color).toString(16).padStart(2, '0')
      }
      return `#${f(0)}${f(8)}${f(4)}`
    }

    const [h, s, l] = hexToHsl(dominantColor)
    
    // Generate 2 shades that are similar to the dominant color
    return [
      hslToHex(h, Math.max(20, s - 15), Math.max(15, l - 20)), // Darker shade
      hslToHex(h, Math.min(80, s + 10), Math.min(85, l + 15))  // Lighter shade
    ]
  }

  const generateRandomPalette = (type: RandomPaletteType) => {
    const baseColors = type.baseColors
    const randomBase = baseColors[Math.floor(Math.random() * baseColors.length)]
    const palettes = generatePalettesFromColor(randomBase)
    
    // Only show one random palette
    const randomPalette = palettes[Math.floor(Math.random() * palettes.length)]
    setGeneratedPalettes([randomPalette])
  }

  const savePalette = async (colors: string[], sourceType: 'manual' | 'logo' | 'random', sourceName?: string) => {
    if (!user) return

    // Check if user has reached the free limit
    if (savedPalettes.length >= MAX_FREE_PALETTES) {
      setError(`Free users can save up to ${MAX_FREE_PALETTES} palettes. Upgrade for unlimited storage!`)
      return
    }

    const paletteName = prompt('Enter a name for this palette:')
    if (!paletteName) return

    try {
      const { error } = await supabase
        .from('color_palettes')
        .insert({
          user_id: user.id,
          name: paletteName,
          colors,
          source_type: sourceType,
          source_data: sourceName
        })

      if (error) throw error

      setSuccess('Palette saved successfully!')
      loadSavedPalettes()
    } catch (err) {
      setError('Failed to save palette')
    }
  }

  const deletePalette = async (paletteId: string) => {
    if (!confirm('Are you sure you want to delete this palette?')) return

    try {
      const { error } = await supabase
        .from('color_palettes')
        .delete()
        .eq('id', paletteId)

      if (error) throw error

      setSuccess('Palette deleted successfully!')
      loadSavedPalettes()
    } catch (err) {
      setError('Failed to delete palette')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
  }

  const retryLogoExtraction = () => {
    if (logoImage) {
      extractColorsFromLogo(logoImage)
    }
  }

  const PaletteDisplay: React.FC<{ 
    colors: string[], 
    title: string, 
    onSave?: () => void, 
    showRetry?: boolean,
    onRetry?: () => void 
  }> = ({ colors, title, onSave, showRetry, onRetry }) => (
    <div className="bg-gray-700/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">{title}</h4>
        <div className="flex space-x-2">
          {onSave && (
            <button
              onClick={onSave}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
              title="Save palette"
            >
              <Heart className="w-4 h-4" />
            </button>
          )}
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
              title="Try again"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex space-x-2 mb-3">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex-1 h-16 rounded-lg border border-gray-600 cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => copyToClipboard(color)}
            title={`Click to copy ${color}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => copyToClipboard(color)}
            className="text-xs text-gray-400 hover:text-white bg-gray-800/50 px-2 py-1 rounded transition-colors"
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  )

  // Initialize with default color palettes
  React.useEffect(() => {
    handleColorChange(selectedColor)
  }, [])

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-700/30 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'manual'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Color Picker
        </button>
        <button
          onClick={() => setActiveTab('logo')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'logo'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Logo Extractor
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Saved Palettes ({savedPalettes.length}/{MAX_FREE_PALETTES})
        </button>
      </div>

      {/* Manual Color Picker Tab */}
      {activeTab === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Color Picker Section */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Pick a Color</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Base Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-16 rounded-lg border border-gray-600 cursor-pointer"
                  />
                  <div>
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#3B82F6"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter hex color code</p>
                  </div>
                </div>
              </div>

              {/* Random Palette Generators */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Generate Random Palette
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RANDOM_PALETTE_TYPES.map((type) => (
                    <button
                      key={type.name}
                      onClick={() => generateRandomPalette(type)}
                      className="flex items-center justify-center p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-colors text-left"
                    >
                      <div>
                        <div className="flex items-center mb-1">
                          <Shuffle className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-white text-sm font-medium">{type.name}</span>
                        </div>
                        <p className="text-xs text-gray-400">{type.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Palettes */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Generated Palettes</h2>
            
            {generatedPalettes.length > 0 ? (
              <div className="space-y-4">
                {generatedPalettes.map((palette, index) => (
                  <PaletteDisplay
                    key={index}
                    colors={palette}
                    title={`Palette ${index + 1}`}
                    onSave={() => savePalette(palette, 'manual')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a color to generate palettes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logo Extractor Tab */}
      {activeTab === 'logo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logo Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Upload Logo</h2>
            
            {!logoFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Drop your logo here</h3>
                <p className="text-gray-400 mb-3">or click to browse files</p>
                <p className="text-sm text-gray-500">Supports JPEG, PNG, WebP (max 10MB)</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{logoFile.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {(logoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setLogoFile(null)
                      setLogoImage(null)
                      setLogoPalette([])
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {logoImage && (
                  <div className="max-w-xs mx-auto">
                    <img
                      src={logoImage.src}
                      alt="Logo"
                      className="w-full h-auto rounded-lg border border-gray-600"
                    />
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-400">Extracting colors...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Extracted Palette */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Extracted Palette</h2>
            
            {logoPalette.length > 0 ? (
              <div className="space-y-4">
                <PaletteDisplay
                  colors={logoPalette}
                  title="Logo Colors"
                  onSave={() => savePalette(logoPalette, 'logo', logoFile?.name)}
                  showRetry={true}
                  onRetry={retryLogoExtraction}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload a logo to extract color palette</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Palettes Tab */}
      {activeTab === 'saved' && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Saved Color Palettes</h2>
            <div className="text-sm text-gray-400">
              {savedPalettes.length}/{MAX_FREE_PALETTES} palettes used
            </div>
          </div>
          
          {savedPalettes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedPalettes.map((palette) => (
                <div key={palette.id} className="bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium">{palette.name}</h4>
                      <p className="text-xs text-gray-400 capitalize">
                        {palette.source_type} • {new Date(palette.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePalette(palette.id!)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete palette"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex space-x-2 mb-3">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 h-12 rounded-lg border border-gray-600 cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => copyToClipboard(color)}
                        title={`Click to copy ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {palette.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => copyToClipboard(color)}
                        className="text-xs text-gray-400 hover:text-white bg-gray-800/50 px-2 py-1 rounded transition-colors"
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No saved palettes yet</p>
              <p className="text-sm">Create and save palettes from the other tabs</p>
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

      {/* Hidden Canvas for color extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}