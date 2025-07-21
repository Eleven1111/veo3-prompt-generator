'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Type, Image, Sparkles, RefreshCw, Copy, Check } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'

interface FormData {
  text: string
  type: 'text' | 'text-image' | 'image'
}

interface GeneratedPrompt {
  short: string
  long: string
  id: string
}

export default function HomePage() {
  const [selectedType, setSelectedType] = useState<'text' | 'text-image' | 'image'>('text')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()

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
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const generatePrompt = async (data: FormData) => {
    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('text', data.text || '')
      formData.append('type', selectedType)
      if (uploadedImage) {
        formData.append('image', uploadedImage)
      }

      const response = await axios.post('/api/generate-prompt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setGeneratedPrompts(response.data)
      toast.success('Prompt 生成成功！')
    } catch (error) {
      toast.error('生成失败，请重试')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const regeneratePrompt = async () => {
    if (!generatedPrompts) return
    
    setIsGenerating(true)
    try {
      const response = await axios.post('/api/regenerate-prompt', {
        promptId: generatedPrompts.id
      })
      
      setGeneratedPrompts(response.data)
      toast.success('Prompt 重新生成成功！')
    } catch (error) {
      toast.error('重新生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'short' | 'long') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPrompt(type)
      toast.success('已复制到剪贴板')
      setTimeout(() => setCopiedPrompt(''), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const inputTypes = [
    { id: 'text', label: '纯文本', icon: Type, description: '输入您的创意描述' },
    { id: 'text-image', label: '文本+图片', icon: Upload, description: '文字描述配合参考图片' },
    { id: 'image', label: '纯图片', icon: Image, description: '仅上传参考图片' },
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Veo3 Prompt Generator</h1>
                <p className="text-sm text-gray-600">AI 视频创意转换平台</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">功能特性</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">使用方法</a>
              <a href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">管理后台</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            将创意转换为
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Veo3 Prompt
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            智能分析您的创意内容，自动生成优化的 Veo3 视频生成 Prompt，支持长短两个版本输出
          </p>
        </motion.div>

        {/* Input Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">选择输入方式</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inputTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as any)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <type.icon className={`w-8 h-8 mx-auto mb-2 ${
                  selectedType === type.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <h4 className="font-medium text-gray-900">{type.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card mb-8"
        >
          <form onSubmit={handleSubmit(generatePrompt)} className="space-y-6">
            {/* Text Input */}
            {(selectedType === 'text' || selectedType === 'text-image') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  创意描述 {selectedType === 'text' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  {...register('text', { 
                    required: selectedType === 'text' ? '请输入创意描述' : false 
                  })}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="描述您想要创建的视频内容，例如：一只可爱的小猫在花园里玩耍，阳光明媚的下午..."
                />
                {errors.text && (
                  <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
                )}
              </div>
            )}

            {/* Image Upload */}
            {(selectedType === 'text-image' || selectedType === 'image') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参考图片 {selectedType === 'image' && <span className="text-red-500">*</span>}
                </label>
                <div
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? 'active' : ''}`}
                >
                  <input {...getInputProps()} />
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-gray-600">点击或拖拽新图片替换</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">
                        {isDragActive ? '释放文件到这里' : '点击或拖拽图片到这里'}
                      </p>
                      <p className="text-sm text-gray-500">支持 JPG, PNG, WebP 格式，最大 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>生成 Veo3 Prompt</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Generated Prompts */}
        {generatedPrompts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">生成的 Prompt</h3>
              <button
                onClick={regeneratePrompt}
                disabled={isGenerating}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>重新生成</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Short Version */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">简洁版本</h4>
                  <button
                    onClick={() => copyToClipboard(generatedPrompts.short, 'short')}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {copiedPrompt === 'short' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-gray-700 leading-relaxed">{generatedPrompts.short}</p>
              </div>

              {/* Long Version */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">详细版本</h4>
                  <button
                    onClick={() => copyToClipboard(generatedPrompts.long, 'long')}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {copiedPrompt === 'long' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-gray-700 leading-relaxed">{generatedPrompts.long}</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Veo3 Prompt Generator. 专业的 AI 视频创意转换平台.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}