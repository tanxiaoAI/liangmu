import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, Plus, Check, MoreHorizontal, FileText, Image as ImageIcon, Type } from 'lucide-react'

interface Topic {
  id: string
  title: string
  category: string
  engagement_score: number
  is_selected?: boolean
}

const TopicGenerator: React.FC = () => {
  const navigate = useNavigate()
  const [keywords, setKeywords] = useState('')
  const [style, setStyle] = useState('modern')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load topics from local storage on initial render
  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem('liangmu_topics')
    return saved ? JSON.parse(saved) : []
  })

  // Save topics to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('liangmu_topics', JSON.stringify(topics))
  }, [topics])

  const handleGenerate = async () => {
    if (!keywords.trim()) return
    
    setLoading(true)
    setError('')
    setTopics([])

    try {
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ... inside component
      const response = await fetch(`${API_BASE_URL}/content/generate-topics`, {
        method: 'POST',
// ...
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywords.split(/[,， ]+/).filter(Boolean),
          style,
          count: 10,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate topics')
      }

      setTopics(data.topics)
    } catch (err: any) {
      console.error('Generate error:', err)
      setError(err.message || 'Failed to generate topics')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setTopics(topics.map(t => 
      t.id === id ? { ...t, is_selected: !t.is_selected } : t
    ))
  }

  const styles = [
    { id: 'modern', label: '现代简约' },
    { id: 'chinese', label: '新中式' },
    { id: 'nordic', label: '北欧风' },
    { id: 'luxury', label: '轻奢' },
    { id: 'wabisabi', label: '侘寂风' },
  ]

  const handleAction = (action: 'title' | 'cover' | 'script', topic: Topic) => {
    // Save current selection state first
    localStorage.setItem('liangmu_topics', JSON.stringify(topics))
    
    // Pass topic id via URL search params
    const params = new URLSearchParams()
    params.set('topic_id', topic.id)
    
    switch (action) {
      case 'title':
        navigate(`/content/title-generator?${params.toString()}`)
        break
      case 'cover':
        navigate(`/content/cover-generator?${params.toString()}`)
        break
      case 'script':
        navigate(`/content/script-generator?${params.toString()}`)
        break
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">批量选题生成</h2>
          <p className="text-gray-500 mt-1">输入关键词，AI自动生成符合家居行业热点的选题</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关键词</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="例如：小户型收纳、客厅改造、儿童房设计..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !keywords.trim()}
                className="bg-[#8B4513] text-white px-6 py-2 rounded-lg hover:bg-[#654321] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                开始生成
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">风格偏好</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${
                    style === s.id
                      ? 'bg-[#FAF8F5] text-[#8B4513] border-[#8B4513] font-medium'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {topics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">生成结果 ({topics.length})</h3>
            <button className="text-sm text-[#8B4513] hover:underline">
              保存选中 ({topics.filter(t => t.is_selected).length})
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => toggleSelection(topic.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  topic.is_selected
                    ? 'bg-[#FAF8F5] border-[#8B4513] shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    topic.is_selected ? 'bg-[#8B4513] border-[#8B4513] text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {topic.is_selected && <Check size={12} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{topic.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{topic.category}</span>
                      <span>热度预测: <span className="text-[#8B4513] font-medium">{topic.engagement_score}</span></span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction('title', topic); }}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <Type size={12} /> 生成标题
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction('script', topic); }}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <FileText size={12} /> 生成脚本
                      </button>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-[#8B4513]">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TopicGenerator
