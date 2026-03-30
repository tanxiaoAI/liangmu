import React, { useState } from 'react'
import { Clapperboard, Loader2, Copy, FileText, Video } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'

interface Script {
  id: string
  title: string
  content: string
  segments: { type: string; duration: number; text: string }[]
  estimated_duration: number
  date: string
}

const ScriptGenerator: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTopicId = searchParams.get('topic_id')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  // Load scripts from local storage (list)
  const [scripts, setScripts] = useState<Script[]>(() => {
    const saved = localStorage.getItem('liangmu_scripts_list')
    return saved ? JSON.parse(saved) : []
  })

  // Current active script (default to latest or null)
  const [activeScript, setActiveScript] = useState<Script | null>(scripts.length > 0 ? scripts[0] : null)

  // Save scripts list to local storage
  React.useEffect(() => {
    localStorage.setItem('liangmu_scripts_list', JSON.stringify(scripts))
    // Also update the single legacy key for compatibility with other pages
    if (scripts.length > 0) {
        localStorage.setItem('liangmu_script', JSON.stringify(scripts[0]))
    }
  }, [scripts])

  const handleGenerate = async () => {
    if (!selectedTopic) {
      setError('请先选择一个选题')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ...
      const response = await fetch(`${API_BASE_URL}/content/generate-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: selectedTopic.id,
          title_id: 'mock_title_id',
          title_content: selectedTopic.title, // Use topic title as context
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate script')
      }

      const newScript = {
          ...data.script,
          date: new Date().toISOString()
      }

      setScripts(prev => [newScript, ...prev])
      setActiveScript(newScript)
    } catch (err: any) {
      console.error('Generate error:', err)
      setError(err.message || 'Failed to generate script')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVideo = (script: Script) => {
      // Save as the "selected" script for video generator
      localStorage.setItem('liangmu_script', JSON.stringify(script))
      navigate('/content/video-generator')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">脚本生成</h2>
          <p className="text-gray-500 mt-1">根据选题自动编写分镜脚本，包含口播文案</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">选题信息</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">当前选题</p>
                {selectedTopic ? (
                  <p className="font-medium text-gray-900">{selectedTopic.title}</p>
                ) : (
                  <p className="text-gray-400 italic">未选择选题</p>
                )}
              </div>
              
              {!selectedTopic && (
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
                      <option value="">-- 请选择 --</option>
                      {savedTopics.map((topic: any) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={loading || !selectedTopic}
                className="w-full bg-[#8B4513] text-white py-2.5 rounded-lg hover:bg-[#654321] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Clapperboard size={18} />}
                生成脚本
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

          {activeScript ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="font-semibold text-gray-900">{activeScript.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">预计时长: {activeScript.estimated_duration}秒</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleCreateVideo(activeScript)}
                        className="text-xs flex items-center gap-1 px-3 py-1.5 bg-[#8B4513] text-white rounded hover:bg-[#654321] transition-colors"
                    >
                        <Video size={14} /> 生成视频
                    </button>
                    <button className="text-gray-500 hover:text-[#8B4513] p-2">
                        <Copy size={18} />
                    </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {activeScript.segments.map((segment, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-24 flex-shrink-0">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500 block mb-1">
                        {segment.type} ({segment.duration}s)
                      </span>
                      <div className="h-full w-0.5 bg-gray-100 mx-auto relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-300"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-[#FAF8F5] p-4 rounded-lg border border-[#E5E5E5]">
                      <p className="text-gray-800 leading-relaxed">{segment.text}</p>
                    </div>
                  </div>
                ))}
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">完整脚本预览</h4>
                  <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans bg-gray-50 p-4 rounded-lg">
                    {activeScript.content}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <FileText size={48} className="mb-4 opacity-50" />
              <p>点击左侧按钮生成视频脚本</p>
            </div>
          )}
        </div>
        
        {/* History Sidebar */}
        <div className="lg:col-span-1 border-l border-gray-100 pl-8 hidden lg:block">
            <h3 className="font-semibold text-gray-900 mb-4">历史脚本</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {scripts.map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => setActiveScript(item)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${activeScript?.id === item.id ? 'border-[#8B4513] bg-[#FAF8F5]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                        <h4 className="text-sm font-medium text-gray-900 truncate mb-1">{item.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                            <span>{item.estimated_duration}s</span>
                        </div>
                    </div>
                ))}
                {scripts.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">暂无历史记录</p>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

export default ScriptGenerator
