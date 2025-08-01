import React, { useState, useRef, useCallback } from 'react'
import { 
  Link as LinkIcon, 
  Download, 
  Heart,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  RefreshCw,
  Zap,
  Crown,
  Plus,
  Trash2,
  Copy,
  QrCode,
  FileImage,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode'
import JSZip from 'jszip'

interface QRCodeData {
  id?: string
  name: string
  url: string
  format: 'png' | 'jpeg' | 'svg'
  size: number
  qr_code_data: string // This will be the preview (200px)
  qr_code_full_size: string // This will be the full size for download
  created_at?: string
}

interface GeneratedQR {
  url: string
  name: string
  format: 'png' | 'jpeg' | 'svg'
  size: number
  dataUrl: string
  previewUrl: string // Add separate preview URL
  tempId: string
}

const QR_SIZES = [
  { value: 200, label: '200×200', premium: false },
  { value: 500, label: '500×500', premium: false },
  { value: 1000, label: '1000×1000', premium: true },
]

const QR_FORMATS = [
  { value: 'png', label: 'PNG', premium: false },
  { value: 'jpeg', label: 'JPEG', premium: false },
  { value: 'svg', label: 'SVG', premium: true },
]

const MAX_FREE_QR_CODES = 10
const MAX_PREMIUM_QR_CODES = 50
const MAX_FREE_SAVED = 3
const MAX_PREMIUM_SAVED = 100

export const QRCodeGenerator: React.FC = () => {
  const { user, userTier } = useAuth()
  const [singleUrl, setSingleUrl] = useState('')
  const [bulkUrls, setBulkUrls] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg' | 'svg'>('png')
  const [selectedSize, setSelectedSize] = useState(200)
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([])
  const [savedQRs, setSavedQRs] = useState<QRCodeData[]>([])
  const [dailyUsage, setDailyUsage] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'saved'>('single')
  
  const isPremium = userTier === 'premium'
  const maxDailyQRs = isPremium ? MAX_PREMIUM_QR_CODES : MAX_FREE_QR_CODES
  const maxSavedQRs = isPremium ? MAX_PREMIUM_SAVED : MAX_FREE_SAVED

  // Load saved QR codes, usage on component mount
  React.useEffect(() => {
    loadSavedQRs()
    loadDailyUsage()
  }, [])

  const loadSavedQRs = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedQRs(data || [])
    } catch (err) {
      console.error('Error loading saved QR codes:', err)
    }
  }

  const loadDailyUsage = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('get_usage', {
        p_user_id: user.id,
        p_feature_type: 'qr_code_generation'
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
        p_feature_type: 'qr_code_generation'
      })

      if (error) throw error
      setDailyUsage(data)
    } catch (err) {
      console.error('Error incrementing usage:', err)
    }
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const normalizeUrl = (url: string): string => {
    return url.startsWith('http') ? url : `https://${url}`
  }

  const generateQRCode = async (url: string, format: 'png' | 'jpeg' | 'svg', size: number): Promise<{ fullSize: string, preview: string }> => {
    const normalizedUrl = normalizeUrl(url)
    
    if (format === 'svg') {
      // Generate full size SVG
      const fullSizeSvg = await QRCode.toString(normalizedUrl, {
        type: 'svg',
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      // Generate preview size SVG (always 200px)
      const previewSvg = await QRCode.toString(normalizedUrl, {
        type: 'svg',
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      return { fullSize: fullSizeSvg, preview: previewSvg }
    } else {
      // Generate full size image
      const fullSizeDataUrl = await QRCode.toDataURL(normalizedUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      // Generate preview size image (always 200px)
      const previewDataUrl = await QRCode.toDataURL(normalizedUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      return { fullSize: fullSizeDataUrl, preview: previewDataUrl }
    }
  }

  const handleSingleGeneration = async () => {
    if (!singleUrl.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!validateUrl(singleUrl)) {
      setError('Please enter a valid URL')
      return
    }

    if (dailyUsage >= maxDailyQRs) {
      setError(`Daily limit reached (${maxDailyQRs} QR codes). ${isPremium ? 'Contact support for higher limits.' : 'Upgrade to Premium for more!'}`)
      return
    }

    // Check if format/size is premium
    const formatObj = QR_FORMATS.find(f => f.value === selectedFormat)
    const sizeObj = QR_SIZES.find(s => s.value === selectedSize)
    
    if (!isPremium && (formatObj?.premium || sizeObj?.premium)) {
      setError('This format/size is only available for Premium users')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const { fullSize, preview } = await generateQRCode(singleUrl, selectedFormat, selectedSize)
      
      const newQR: GeneratedQR = {
        url: singleUrl,
        name: `QR Code for ${singleUrl}`,
        format: selectedFormat,
        size: selectedSize,
        dataUrl: fullSize, // Full size for download
        previewUrl: preview, // Preview size for display
        tempId: Date.now().toString()
      }

      setGeneratedQRs([newQR])
      await incrementUsage()
      setSuccess('QR Code generated successfully!')
      setSingleUrl('')
    } catch (err) {
      setError('Failed to generate QR code. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkGeneration = async () => {
    if (!isPremium) {
      setError('Bulk generation is only available for Premium users')
      return
    }

    const urls = bulkUrls.split('\n').filter(url => url.trim()).slice(0, 15)
    
    if (urls.length === 0) {
      setError('Please enter at least one URL')
      return
    }

    const invalidUrls = urls.filter(url => !validateUrl(url.trim()))
    if (invalidUrls.length > 0) {
      setError(`Invalid URLs found: ${invalidUrls.join(', ')}`)
      return
    }

    if (dailyUsage + urls.length > maxDailyQRs) {
      setError(`This would exceed your daily limit. You can generate ${maxDailyQRs - dailyUsage} more QR codes today.`)
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const newQRs: GeneratedQR[] = []
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i].trim()
        const { fullSize, preview } = await generateQRCode(url, selectedFormat, selectedSize)
        
        newQRs.push({
          url,
          name: `QR Code ${i + 1}`,
          format: selectedFormat,
          size: selectedSize,
          dataUrl: fullSize, // Full size for download
          previewUrl: preview, // Preview size for display
          tempId: `${Date.now()}_${i}`
        })
      }

      setGeneratedQRs(newQRs)
      
      // Increment usage for each QR code generated
      for (let i = 0; i < urls.length; i++) {
        await incrementUsage()
      }
      
      setSuccess(`${urls.length} QR codes generated successfully!`)
      setBulkUrls('')
    } catch (err) {
      setError('Failed to generate QR codes. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const updateQRName = (tempId: string, newName: string) => {
    setGeneratedQRs(prev => 
      prev.map(qr => 
        qr.tempId === tempId ? { ...qr, name: newName } : qr
      )
    )
  }

  const saveQRCode = async (qr: GeneratedQR) => {
    if (!user) return

    if (savedQRs.length >= maxSavedQRs) {
      setError(`You can save up to ${maxSavedQRs} QR codes. ${isPremium ? 'Contact support for higher limits.' : 'Upgrade to Premium for more!'}`)
      return
    }

    try {
      const { error } = await supabase
        .from('qr_codes')
        .insert({
          user_id: user.id,
          name: qr.name,
          url: qr.url,
          format: qr.format,
          size: qr.size,
          qr_code_data: qr.previewUrl, // Save preview (200px) for display
          qr_code_full_size: qr.dataUrl // Save full size for download
        })

      if (error) throw error

      setSuccess('QR Code saved successfully!')
      loadSavedQRs()
    } catch (err) {
      setError('Failed to save QR code')
    }
  }

  const deleteQRCode = async (qrId: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return

    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrId)

      if (error) throw error

      setSuccess('QR Code deleted successfully!')
      loadSavedQRs()
    } catch (err) {
      setError('Failed to delete QR code')
    }
  }

  const downloadQR = (qr: GeneratedQR | QRCodeData) => {
    // For saved QR codes, use qr_code_full_size if available, otherwise fallback to qr_code_data
    const dataUrl = 'qr_code_full_size' in qr && qr.qr_code_full_size 
      ? qr.qr_code_full_size 
      : ('qr_code_data' in qr ? qr.qr_code_data : qr.dataUrl)
    
    const fileName = `${qr.name.replace(/\s+/g, '_')}.${qr.format}`
    
    if (qr.format === 'svg') {
      const blob = new Blob([dataUrl], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    } else {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = fileName
      link.click()
    }
  }

  const downloadAllAsZip = async () => {
    if (generatedQRs.length === 0) return

    try {
      const zip = new JSZip()

      for (const qr of generatedQRs) {
        const fileName = `${qr.name.replace(/\s+/g, '_')}.${qr.format}`
        
        if (qr.format === 'svg') {
          zip.file(fileName, qr.dataUrl) // Use full size for download
        } else {
          const base64Data = qr.dataUrl.split(',')[1] // Use full size for download
          zip.file(fileName, base64Data, { base64: true })
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = `qr_codes_${Date.now()}.zip`
      link.click()
      URL.revokeObjectURL(link.href)
      
      setSuccess('QR codes ZIP downloaded successfully!')
    } catch (err) {
      setError('Failed to create ZIP file')
    }
  }

  const clearGenerated = () => {
    setGeneratedQRs([])
    setError('')
    setSuccess('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('URL copied to clipboard!')
  }

  return (
    <div className="space-y-8">
      {/* Messages - Moved to top */}
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

      {/* Header with Clear Button */}
      {generatedQRs.length > 0 && (
        <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Generated QR Codes</h3>
            <p className="text-gray-400 text-sm">
              {generatedQRs.length} QR code{generatedQRs.length !== 1 ? 's' : ''} ready
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {generatedQRs.length > 1 && (
              <button
                onClick={downloadAllAsZip}
                className="flex items-center px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 border border-green-500/30 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All as ZIP
              </button>
            )}
            <button
              onClick={clearGenerated}
              className="flex items-center px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New QR Codes
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-700/30 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'single'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Single QR Code
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
            activeTab === 'bulk'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Bulk Generation
          {!isPremium && <Crown className="w-3 h-3 inline ml-1 text-yellow-500" />}
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Saved QR Codes ({savedQRs.length}/{maxSavedQRs})
        </button>
      </div>

      {/* Usage Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <QrCode className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-400 font-medium">
              {isPremium ? 'Premium Plan' : 'Free Plan'} - Daily Usage: {dailyUsage}/{maxDailyQRs}
            </span>
          </div>
          {!isPremium && (
            <Crown className="w-5 h-5 text-yellow-500" />
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1">
          {isPremium 
            ? '• All formats & sizes • Bulk generation • Advanced features'
            : '• PNG/JPEG only • 200×200 & 500×500 sizes • Upgrade for SVG, larger sizes & bulk generation'
          }
        </p>
      </div>

      {/* Single QR Code Tab */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Generate QR Code</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Enter URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Format
                  </label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as 'png' | 'jpeg' | 'svg')}
                    className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {QR_FORMATS.map(format => (
                      <option 
                        key={format.value} 
                        value={format.value}
                        disabled={!isPremium && format.premium}
                      >
                        {format.label} {!isPremium && format.premium ? '(Premium)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(parseInt(e.target.value))}
                    className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {QR_SIZES.map(size => (
                      <option 
                        key={size.value} 
                        value={size.value}
                        disabled={!isPremium && size.premium}
                      >
                        {size.label} {!isPremium && size.premium ? '(Premium)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSingleGeneration}
                disabled={isProcessing || dailyUsage >= maxDailyQRs}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating...
                  </div>
                ) : dailyUsage >= maxDailyQRs ? (
                  `Daily Limit Reached (${dailyUsage}/${maxDailyQRs})`
                ) : (
                  'Generate QR Code'
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Preview</h2>
            
            {generatedQRs.length > 0 ? (
              <div className="space-y-4">
                {generatedQRs.map((qr) => (
                  <div key={qr.tempId} className="bg-gray-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={qr.name}
                        onChange={(e) => updateQRName(qr.tempId, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mr-3"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveQRCode(qr)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Save QR code"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadQR(qr)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                          title="Download QR code"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center bg-white rounded-lg p-4 mb-4">
                      {qr.format === 'svg' ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: qr.previewUrl }} 
                          style={{ width: '200px', height: '200px' }}
                        />
                      ) : (
                        <img
                          src={qr.previewUrl}
                          alt={qr.name}
                          style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{qr.format.toUpperCase()} • {qr.size}×{qr.size}</span>
                      <button
                        onClick={() => copyToClipboard(qr.url)}
                        className="flex items-center hover:text-gray-300 transition-colors"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter a URL to generate QR code</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Generation Tab */}
      {activeTab === 'bulk' && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          {!isPremium ? (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Premium Feature</h3>
              <p className="text-gray-400 mb-6">
                Bulk QR code generation is available for Premium users only.
                Generate up to 15 QR codes at once!
              </p>
              <button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
                Upgrade to Premium
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Bulk QR Code Generation</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Enter URLs (one per line, max 15)
                    </label>
                    <textarea
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bulkUrls.split('\n').filter(url => url.trim()).length}/15 URLs
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Format
                      </label>
                      <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as 'png' | 'jpeg' | 'svg')}
                        className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {QR_FORMATS.map(format => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Size
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(parseInt(e.target.value))}
                        className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {QR_SIZES.map(size => (
                          <option key={size.value} value={size.value}>
                            {size.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleBulkGeneration}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Generating QR Codes...
                      </div>
                    ) : (
                      'Generate All QR Codes'
                    )}
                  </button>
                </div>

                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bulk Generation Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-green-400">
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="text-sm">Generate up to 15 QR codes at once</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <Settings className="w-4 h-4 mr-2" />
                      <span className="text-sm">Custom naming for each QR code</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <Download className="w-4 h-4 mr-2" />
                      <span className="text-sm">Download all as ZIP file</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <Heart className="w-4 h-4 mr-2" />
                      <span className="text-sm">Save favorites to your collection</span>
                    </div>
                  </div>
                </div>
              </div>

              {generatedQRs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  {generatedQRs.map((qr) => (
                    <div key={qr.tempId} className="bg-gray-700/30 rounded-xl p-4">
                      <input
                        type="text"
                        value={qr.name}
                        onChange={(e) => updateQRName(qr.tempId, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      />
                      
                      <div className="flex items-center justify-center bg-white rounded-lg p-3 mb-3">
                        {qr.format === 'svg' ? (
                          <div 
                            dangerouslySetInnerHTML={{ __html: qr.previewUrl }} 
                            style={{ width: '96px', height: '96px' }}
                          />
                        ) : (
                          <img
                            src={qr.previewUrl}
                            alt={qr.name}
                            style={{ width: '96px', height: '96px', objectFit: 'contain' }}
                          />
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <button
                          onClick={() => saveQRCode(qr)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Save QR code"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadQR(qr)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                          title="Download QR code"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Saved QR Codes Tab */}
      {activeTab === 'saved' && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Saved QR Codes</h2>
            <div className="text-sm text-gray-400">
              {savedQRs.length}/{maxSavedQRs} saved
            </div>
          </div>
          
          {savedQRs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedQRs.map((qr) => (
                <div key={qr.id} className="bg-gray-700/30 rounded-xl p-4">
                  {/* Header with title and delete button */}
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-medium text-sm leading-tight flex-1 pr-2">{qr.name}</h4>
                    <button
                      onClick={() => deleteQRCode(qr.id!)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
                      title="Delete QR code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Square QR Code Container with minimal padding */}
                  <div className="aspect-square bg-white rounded-lg p-1 mb-3 flex items-center justify-center">
                    {qr.format === 'svg' ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: qr.qr_code_data }} 
                        className="w-full h-full flex items-center justify-center"
                        style={{ maxWidth: '180px', maxHeight: '180px' }}
                      />
                    ) : (
                      <img
                        src={qr.qr_code_data}
                        alt={qr.name}
                        className="max-w-full max-h-full object-contain"
                        style={{ width: '180px', height: '180px' }}
                      />
                    )}
                  </div>
                  
                  {/* Info Section */}
                  <div className="space-y-2">
                    {/* Format and Size Info */}
                    <div className="text-center">
                      <div className="text-xs text-gray-400 font-medium">
                        {qr.format.toUpperCase()} • {qr.size}×{qr.size}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(qr.created_at!).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-600/30">
                      <button
                        onClick={() => copyToClipboard(qr.url)}
                        className="flex items-center text-xs text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy URL
                      </button>
                      <button
                        onClick={() => downloadQR(qr)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                        title="Download QR code"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No saved QR codes yet</p>
              <p className="text-sm">Generate and save QR codes from other tabs</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}