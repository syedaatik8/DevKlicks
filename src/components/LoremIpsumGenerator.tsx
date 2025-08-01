import React, { useState } from 'react'
import { 
  Copy, 
  RefreshCw, 
  Download, 
  Type,
  AlertCircle,
  CheckCircle,
  Settings,
  FileText,
  Hash,
  List
} from 'lucide-react'

interface GenerationOptions {
  type: 'paragraphs' | 'words' | 'sentences'
  count: number
  startWithLorem: boolean
}

export const LoremIpsumGenerator: React.FC = () => {
  const [options, setOptions] = useState<GenerationOptions>({
    type: 'paragraphs',
    count: 3,
    startWithLorem: true
  })
  const [generatedText, setGeneratedText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
    'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
    'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo',
    'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
    'sed', 'quia', 'consequuntur', 'magni', 'dolores', 'ratione', 'sequi',
    'nesciunt', 'neque', 'porro', 'quisquam', 'est', 'qui', 'dolorem', 'adipisci',
    'numquam', 'eius', 'modi', 'tempora', 'incidunt', 'magnam', 'quaerat',
    'voluptatem', 'fuga', 'harum', 'quidem', 'rerum', 'facilis', 'expedita',
    'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis', 'eligendi',
    'optio', 'cumque', 'nihil', 'impedit', 'quo', 'minus', 'maxime', 'placeat',
    'facere', 'possimus', 'omnis', 'assumenda', 'repellendus', 'temporibus',
    'autem', 'quibusdam', 'officiis', 'debitis', 'necessitatibus', 'saepe',
    'eveniet', 'voluptates', 'repudiandae', 'recusandae', 'itaque', 'earum',
    'hic', 'tenetur', 'sapiente', 'delectus', 'reiciendis', 'maiores', 'alias',
    'perferendis', 'doloribus', 'asperiores', 'repellat'
  ]

  const getRandomWords = (count: number): string[] => {
    const words: string[] = []
    for (let i = 0; i < count; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
    }
    return words
  }

  const generateSentence = (wordCount: number = Math.floor(Math.random() * 10) + 8): string => {
    const words = getRandomWords(wordCount)
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    return words.join(' ') + '.'
  }

  const generateParagraph = (sentenceCount: number = Math.floor(Math.random() * 4) + 4): string => {
    const sentences: string[] = []
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence())
    }
    return sentences.join(' ')
  }

  const generateText = () => {
    setError('')
    setSuccess('')

    if (options.count < 1 || options.count > 100) {
      setError('Count must be between 1 and 100')
      return
    }

    let result = ''

    try {
      switch (options.type) {
        case 'words':
          const words = getRandomWords(options.count)
          if (options.startWithLorem && words.length > 0) {
            words[0] = 'Lorem'
            if (words.length > 1) words[1] = 'ipsum'
          }
          result = words.join(' ')
          break

        case 'sentences':
          const sentences: string[] = []
          for (let i = 0; i < options.count; i++) {
            sentences.push(generateSentence())
          }
          if (options.startWithLorem && sentences.length > 0) {
            sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
          }
          result = sentences.join(' ')
          break

        case 'paragraphs':
          const paragraphs: string[] = []
          for (let i = 0; i < options.count; i++) {
            paragraphs.push(generateParagraph())
          }
          if (options.startWithLorem && paragraphs.length > 0) {
            paragraphs[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' + paragraphs[0].split('. ').slice(1).join('. ')
          }
          result = paragraphs.join('\n\n')
          break
      }

      setGeneratedText(result)
      setSuccess('Lorem ipsum text generated successfully!')
    } catch (err) {
      setError('Failed to generate text. Please try again.')
    }
  }

  const copyToClipboard = () => {
    if (!generatedText) {
      setError('No text to copy')
      return
    }

    navigator.clipboard.writeText(generatedText)
    setSuccess('Text copied to clipboard!')
  }

  const downloadText = () => {
    if (!generatedText) {
      setError('No text to download')
      return
    }

    const blob = new Blob([generatedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lorem-ipsum-${options.type}-${options.count}.txt`
    link.click()
    URL.revokeObjectURL(url)
    setSuccess('Text file downloaded!')
  }

  const clearText = () => {
    setGeneratedText('')
    setError('')
    setSuccess('')
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

      {/* Generator Controls */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Lorem Ipsum Generator</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Generate
            </label>
            <div className="space-y-2">
              {[
                { value: 'paragraphs', label: 'Paragraphs', icon: FileText },
                { value: 'sentences', label: 'Sentences', icon: List },
                { value: 'words', label: 'Words', icon: Hash }
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={options.type === value}
                    onChange={(e) => setOptions(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <Icon className="w-4 h-4 text-gray-400 ml-3 mr-2" />
                  <span className="text-gray-300 text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Count Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Count
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={options.count}
              onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">1-100 {options.type}</p>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Options
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={options.startWithLorem}
                onChange={(e) => setOptions(prev => ({ ...prev, startWithLorem: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-gray-300 text-sm ml-3">Start with "Lorem ipsum"</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={generateText}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Generate Text
          </button>

          {generatedText && (
            <>
              <button
                onClick={copyToClipboard}
                className="flex items-center px-6 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 border border-green-500/30 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copy Text
              </button>

              <button
                onClick={downloadText}
                className="flex items-center px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download
              </button>

              <button
                onClick={clearText}
                className="flex items-center px-6 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 hover:text-gray-300 border border-gray-500/30 rounded-lg transition-colors"
              >
                <Type className="w-5 h-5 mr-2" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Generated Text Display */}
      {generatedText && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Generated Text</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{options.count} {options.type}</span>
              <span>•</span>
              <span>{generatedText.length} characters</span>
              <span>•</span>
              <span>{generatedText.split(/\s+/).length} words</span>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-xl p-6 max-h-96 overflow-y-auto">
            <pre className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
              {generatedText}
            </pre>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">About Lorem Ipsum</h4>
        <p className="text-gray-400 text-sm leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's 
          standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled 
          it to make a type specimen book. It's perfect for creating placeholder content during design and 
          development phases.
        </p>
      </div>
    </div>
  )
}