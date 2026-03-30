import React, { useState } from 'react'
import { Image as ImageIcon, Loader2, Upload, Download } from 'lucide-react'

import { useSearchParams } from 'react-router-dom'

interface Cover {
  id: string
  url: string
  alt_text: string
  score: number
  aspectRatio?: string
  style?: string
}

const CoverGenerator: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialTopicId = searchParams.get('topic_id')
  const initialTitleContent = searchParams.get('title_content')

  const [style, setStyle] = useState('modern')
  const [aspectRatio, setAspectRatio] = useState('3:4')
  const [loading, setLoading] = useState(false)
  
  // Load covers from local storage on initial render
  const [covers, setCovers] = useState<Cover[]>(() => {
    const saved = localStorage.getItem('liangmu_covers')
    return saved ? JSON.parse(saved) : []
  })

  // Save covers to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('liangmu_covers', JSON.stringify(covers))
  }, [covers])
  
  const [error, setError] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<any>(null)
  
  // Use title content if passed, otherwise use topic title
  const contextTitle = initialTitleContent || selectedTopic?.title || ''
  
  // File upload state
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Load topics from local storage
  const savedTopics = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('liangmu_topics')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  }, [])

  // Auto-select topic from URL params
  React.useEffect(() => {
    if (initialTopicId && savedTopics.length > 0) {
      const topic = savedTopics.find((t: any) => t.id === initialTopicId)
      if (topic) {
        setSelectedTopic(topic)
      }
    }
  }, [initialTopicId, savedTopics])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleReferenceSelect = (url: string) => {
    setSelectedImage(url)
    // Clear file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const REFERENCE_IMAGES = React.useMemo(() => [
    { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600&auto=format&fit=crop", label: "现代客厅" },
    { url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=600&auto=format&fit=crop", label: "极简卧室" },
    { url: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=600&auto=format&fit=crop", label: "北欧餐厅" },
    { url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=600&auto=format&fit=crop", label: "复古书房" }
  ], [])

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      setError('下载失败，请尝试右键保存图片');
    }
  };

  const handleGenerate = async () => {
    if (!contextTitle) {
      setError('请先选择一个标题或选题')
      return
    }
    
    setLoading(true)
    setError('')
    setCovers([])

    try {
      // If selectedImage is a public URL (from presets), we can pass it to backend
      // If it is a blob URL (local upload), we skip it for now
      const referenceImage = selectedImage && selectedImage.startsWith('http') && !selectedImage.startsWith('blob:') 
          ? selectedImage 
          : undefined;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ...
      const response = await fetch(`${API_BASE_URL}/content/generate-covers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: selectedTopic?.id || 'manual_input', // 如果没有 topic_id，传一个占位符
          topic_title: contextTitle, // 传递标题内容给后端，后端可以使用它来优化 prompt
          style,
          aspectRatio,
          count: 4,
          reference_image: referenceImage
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate covers')
      }

      setCovers(data.covers)
    } catch (err: any) {
      console.error('Generate error:', err)
      setError(err.message || 'Failed to generate covers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">封面图生成</h2>
          <p className="text-gray-500 mt-1">上传参考图或选择风格，批量生成高质量家居场景封面</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">生成配置</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">当前标题</p>
                {contextTitle ? (
                  <p className="font-medium text-gray-900">{contextTitle}</p>
                ) : (
                  <p className="text-gray-400 italic">未选择标题</p>
                )}
              </div>

              {!selectedTopic && !initialTitleContent && (
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">选择选题（作为备选）</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all bg-white"
                      onChange={(e) => {
                        const topic = savedTopics.find((t: any) => t.id === e.target.value)
                        setSelectedTopic(topic)
                      }}
                      value={selectedTopic?.id || ''}
                    >
                      <option value="">-- 请选择 --</option>
                      {savedTopics.map((topic: any) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">参考图 (可选)</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {selectedImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={selectedImage} alt="Reference" className="w-full h-40 object-cover" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs py-1 px-2 truncate">
                      已选择参考图
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={triggerFileUpload}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-[#8B4513] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Upload size={24} className="mb-2" />
                    <span className="text-xs">点击上传图片</span>
                  </div>
                )}
              </div>

              {/* Preset References */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">或选择预设参考图</label>
                <div className="grid grid-cols-4 gap-2">
                  {REFERENCE_IMAGES.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleReferenceSelect(img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === img.url ? 'border-[#8B4513] ring-2 ring-[#8B4513] ring-opacity-20' : 'border-transparent hover:border-gray-300'}`}
                      title={img.label}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">视觉风格</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none bg-white"
                >
                  <option value="modern">现代简约</option>
                  <option value="chinese">新中式</option>
                  <option value="nordic">北欧风</option>
                  <option value="luxury">轻奢</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">画面比例</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '1:1', label: '1:1 方形' },
                    { value: '3:4', label: '3:4 小红书' },
                    { value: '16:9', label: '16:9 横屏' },
                    { value: '9:16', label: '9:16 竖屏' },
                    { value: '4:3', label: '4:3 横屏' },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`px-2 py-2 text-sm rounded-lg border transition-all ${
                        aspectRatio === ratio.value
                          ? 'bg-[#8B4513] text-white border-[#8B4513]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !selectedTopic}
                className="w-full bg-[#8B4513] text-white py-2.5 rounded-lg hover:bg-[#654321] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
                开始生成
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {covers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {covers.map((cover) => (
                <div key={cover.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative bg-gray-100" style={{ aspectRatio: cover.aspectRatio ? cover.aspectRatio.replace(':', '/') : '16/9' }}>
                    <img src={cover.url} alt={cover.alt_text} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(cover.url, `cover_${cover.id}.png`);
                        }}
                        className="p-2 bg-white rounded-full text-gray-900 hover:text-[#8B4513] transition-colors"
                        title="下载图片"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-900 font-medium truncate">{cover.alt_text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">AI评分: {cover.score}</span>
                      <span className="text-xs text-gray-400">{cover.style} · {cover.aspectRatio}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <button className="text-xs text-[#8B4513] hover:underline">使用此图</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <ImageIcon size={48} className="mb-4 opacity-50" />
              <p>暂无生成结果，请在左侧配置并开始生成</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoverGenerator
