'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Upload, Type, Image, Sparkles, RefreshCw, Copy, Check, ChevronRight, Zap, Brain, Eye, Target } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'

interface FormData {
  text: string
  type: 'text' | 'text-image' | 'image'
  style?: string
  quality?: string
  aspectRatio?: string
}

interface GeneratedPrompt {
  prompt: string
  visualElements: string[]
  cameraMovements: string[]
  lighting: string
  colorPalette: string[]
}

export default function HomePage() {
  const [selectedType, setSelectedType] = useState<'text' | 'text-image' | 'image'>('text')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedSection, setCopiedSection] = useState<string>('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeCard, setActiveCard] = useState<string>('')
  
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  })

  const generatePrompt = async (data: FormData) => {
    setIsGenerating(true)
    try {
      const payload = {
        input: data.text || 'Create cinematic video content',
        type: selectedType,
        style: data.style || 'cinematic',
        quality: data.quality || 'high',
        aspectRatio: data.aspectRatio || '16:9'
      }

      const response = await axios.post('/api/generate-prompt', payload)
      setGeneratedPrompt(response.data)
      toast.success('🎬 Prompt generated successfully!', {
        icon: '🚀',
        style: {
          borderRadius: '10px',
          background: '#1e1b4b',
          color: '#fff',
        },
      })
    } catch (error) {
      toast.error('Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      toast.success('Copied!', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#065f46',
          color: '#fff',
        },
      })
      setTimeout(() => setCopiedSection(''), 2000)
    } catch (error) {
      toast.error('Copy failed')
    }
  }

  const inputTypes = [
    { id: 'text', label: 'Text Input', icon: Type, desc: 'Describe your vision in words', color: 'from-cyan-500 to-blue-500' },
    { id: 'text-image', label: 'Text + Image', icon: Image, desc: 'Enhance with reference images', color: 'from-purple-500 to-pink-500' },
    { id: 'image', label: 'Pure Image', icon: Eye, desc: 'Let AI interpret your visuals', color: 'from-orange-500 to-red-500' },
  ]

  const styles = [
    { value: 'cinematic', label: 'Cinematic', icon: '🎬' },
    { value: 'artistic', label: 'Artistic', icon: '🎨' },
    { value: 'commercial', label: 'Commercial', icon: '📺' },
    { value: 'documentary', label: 'Documentary', icon: '📷' },
  ]

  const qualities = [
    { value: 'ultra', label: 'Ultra HD', icon: '4K' },
    { value: 'high', label: 'High', icon: 'HD' },
    { value: 'medium', label: 'Medium', icon: 'SD' },
  ]

  const aspectRatios = [
    { value: '16:9', label: '16:9', icon: '⬛' },
    { value: '9:16', label: '9:16', icon: '⬜' },
    { value: '1:1', label: '1:1', icon: '⬜' },
    { value: '4:3', label: '4:3', icon: '⬛' },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Cursor Glow Effect */}
      <motion.div
        className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl pointer-events-none z-10"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Navigation */}
      <nav className="relative z-20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-xl opacity-50" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Veo3 AI
                </h1>
                <p className="text-sm text-gray-400">Prompt Generator</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-6">
              <motion.a 
                href="#features" 
                className="text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                Features
              </motion.a>
              <motion.a 
                href="#generator" 
                className="text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                Generator
              </motion.a>
              <motion.a 
                href="/admin" 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-white font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Transform Ideas
                </span>
                <br />
                <span className="text-white">Into Reality</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
                AI-powered Veo3 prompt generator that transforms your creative vision into stunning video prompts with cinematic precision
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-pink-400" />
                <span>Cinematic Quality</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section id="generator" className="relative z-20 py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">Creative Studio</h2>
              <p className="text-gray-400 text-lg">Choose your input method and let AI craft your vision</p>
            </div>

            {/* Input Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {inputTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setSelectedType(type.id as any)}
                  className={`relative group p-6 rounded-2xl border transition-all duration-300 ${
                    selectedType === type.id
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                  <type.icon className={`w-8 h-8 mb-3 mx-auto ${
                    selectedType === type.id ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <h3 className="text-lg font-semibold mb-2 text-white">{type.label}</h3>
                  <p className="text-sm text-gray-400">{type.desc}</p>
                </motion.button>
              ))}
            </div>

            {/* Generator Form */}
            <form onSubmit={handleSubmit(generatePrompt)} className="space-y-8">
              {/* Text Input */}
              {(selectedType === 'text' || selectedType === 'text-image') && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-2"
                >
                  <label className="text-lg font-medium text-white">Creative Description</label>
                  <textarea
                    {...register('text', { required: selectedType === 'text' })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Describe your cinematic vision... e.g., 'A cyberpunk city at night with neon lights reflecting on wet streets'"
                  />
                </motion.div>
              )}

              {/* Image Upload */}
              {(selectedType === 'text-image' || selectedType === 'image') && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-2"
                >
                  <label className="text-lg font-medium text-white">Reference Image</label>
                  <div
                    {...getRootProps()}
                    className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 ${
                      isDragActive
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="p-8 text-center">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img src={imagePreview} alt="Preview" className="max-w-xs mx-auto rounded-xl" />
                          <p className="text-gray-400">Click to replace image</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 mx-auto text-gray-400" />
                          <div>
                            <p className="text-white font-medium">
                              {isDragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG, WebP up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Advanced Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Style</label>
                  <select
                    {...register('style')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {styles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.icon} {style.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Quality</label>
                  <select
                    {...register('quality')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {qualities.map(quality => (
                      <option key={quality.value} value={quality.value}>
                        {quality.icon} {quality.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Aspect Ratio</label>
                  <select
                    {...register('aspectRatio')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {aspectRatios.map(ratio => (
                      <option key={ratio.value} value={ratio.value}>
                        {ratio.icon} {ratio.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isGenerating}
                className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  animate={isGenerating ? { x: '100%' } : { x: '-100%' }}
                  transition={{ duration: 1.5, repeat: isGenerating ? Infinity : 0 }}
                />
                <div className="relative flex items-center justify-center space-x-2">
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-6 h-6" />
                      </motion.div>
                      <span>Generating AI Magic...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>Generate Cinematic Prompt</span>
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            {/* Results */}
            <AnimatePresence>
              {generatedPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Prompt */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Generated Prompt</h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(generatedPrompt.prompt, 'prompt')}
                          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        >
                          {copiedSection === 'prompt' ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-300" />
                          )}
                        </motion.button>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{generatedPrompt.prompt}</p>
                    </div>

                    {/* Visual Elements */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-purple-400" />
                        Visual Elements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedPrompt.visualElements.map((element, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-200"
                          >
                            {element}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Camera Movements */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-cyan-400" />
                        Camera Movements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedPrompt.cameraMovements.map((movement, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm text-cyan-200"
                          >
                            {movement}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Lighting */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Lighting</h4>
                      <p className="text-gray-300">{generatedPrompt.lighting}</p>
                    </div>

                    {/* Color Palette */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Color Palette</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedPrompt.colorPalette.map((color, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 rounded-full text-sm text-pink-200"
                          >
                            {color}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400">
              Built with <span className="text-purple-400">Next.js</span> and <span className="text-cyan-400">AI Magic</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              © 2024 Veo3 AI Prompt Generator. Transforming creativity with artificial intelligence.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </div>
  )
}