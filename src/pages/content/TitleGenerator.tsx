import React, { useState } from 'react'
import { Type, Loader2, RefreshCw, Check, Image as ImageIcon } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'

interface Title {
  id: string
  content: string
  score: number
  is_selected?: boolean
}

const TitleGenerator: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTopicId = searchParams.get('topic_id')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load titles from local storage on initial render
  const [titles, setTitles] = useState<Title[]>(() => {
    const saved = localStorage.getItem('liangmu_titles')
    return saved ? JSON.parse(saved) : []
  })

  // Save titles to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('liangmu_titles', JSON.stringify(titles))
  }, [titles])

  const [selectedTopic, setSelectedTopic] = useState<any>(null)
  
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

  const handleGenerate = async () => {
    if (!selectedTopic) {
      setError('请先选择一个选题')
      return
    }

    setLoading(true)
    setError('')
    setTitles([])

    try {
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ...
      const response = await fetch(`${API_BASE_URL}/content/generate-titles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: selectedTopic.id,
          topic_title: selectedTopic.title,
          cover_id: 'mock_cover_id',
          count: 5,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate titles')
      }

      setTitles(data.titles)
    } catch (err: any) {
      console.error('Generate error:', err)
      setError(err.message || 'Failed to generate titles')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setTitles(titles.map(t => 
      t.id === id ? { ...t, is_selected: !t.is_selected } : t
    ))
  }

  const handleGenerateCover = (title: Title) => {
    // Save current state
    localStorage.setItem('liangmu_titles', JSON.stringify(titles))
    
    // Pass topic id and title id/content via URL search params
    const params = new URLSearchParams()
    if (selectedTopic) {
        params.set('topic_id', selectedTopic.id)
    }
    params.set('title_id', title.id)
    params.set('title_content', title.content)
    
    navigate(`/content/cover-generator?${params.toString()}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">标题生成</h2>
          <p className="text-gray-500 mt-1">基于选题和封面图，生成吸引人的标题</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">选择选题</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all bg-white"
                  onChange={(e) => {
                    const topic = savedTopics.find((t: any) => t.id === e.target.value)
                    setSelectedTopic(topic)
                  }}
                  value={selectedTopic?.id || ''}
                >
                  <option value="">-- 请选择一个已生成的选题 --</option>
                  {savedTopics.map((topic: any) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title} (热度: {topic.engagement_score})
                    </option>
                  ))}
                </select>
              </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedTopic}
            className="bg-[#8B4513] text-white px-6 py-2.5 rounded-lg hover:bg-[#654321] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            生成标题
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {titles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">生成结果 ({titles.length})</h3>
            <button className="text-sm text-[#8B4513] hover:underline">
              保存选中 ({titles.filter(t => t.is_selected).length})
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {titles.map((title) => (
              <div
                key={title.id}
                onClick={() => toggleSelection(title.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  title.is_selected
                    ? 'bg-[#FAF8F5] border-[#8B4513] shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    title.is_selected ? 'bg-[#8B4513] border-[#8B4513] text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {title.is_selected && <Check size={12} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-lg">{title.content}</h4>
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>推荐指数: <span className="text-[#8B4513] font-medium">{title.score}</span></span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleGenerateCover(title); }}
                            className="text-xs flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <ImageIcon size={12} /> 生成封面
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TitleGenerator
