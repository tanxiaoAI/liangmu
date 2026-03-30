import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, FileText, Image as ImageIcon, Clapperboard, Video, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: 'text' | 'topic-result' | 'cover-result' | 'script-result' | 'video-result'
  data?: any
}

type ChatState = 'idle' | 'awaiting_topic_keywords' | 'awaiting_cover_title' | 'awaiting_script_title' | 'awaiting_video_script'

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的良木家居AI助手。我可以帮你生成选题、封面、脚本，甚至制作视频。请点击下方功能按钮开始。',
      type: 'text'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatState, setChatState] = useState<ChatState>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      type: 'text'
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      await processUserMessage(input, chatState)
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，处理您的请求时出现了错误，请稍后再试。',
        type: 'text'
      }])
    } finally {
      setLoading(false)
    }
  }

  const processUserMessage = async (text: string, state: ChatState) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

    if (state === 'awaiting_topic_keywords') {
      // Call Topic API
      const response = await fetch(`${API_BASE_URL}/content/generate-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: text.split(/[,，\s]+/), count: 3 })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `为您生成了以下关于“${text}”的选题：`,
        type: 'topic-result',
        data: data.topics
      }])
      setChatState('idle')

    } else if (state === 'awaiting_cover_title') {
      // Call Cover API
      const response = await fetch(`${API_BASE_URL}/content/generate-covers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_title: text, count: 2, style: 'modern' })
      })
      const data = await response.json()

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `为您生成的“${text}”封面图如下：`,
        type: 'cover-result',
        data: data.covers
      }])
      setChatState('idle')

    } else if (state === 'awaiting_script_title') {
      // Call Script API
      const response = await fetch(`${API_BASE_URL}/content/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title_content: text })
      })
      const data = await response.json()

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `为您生成的“${text}”视频脚本：`,
        type: 'script-result',
        data: data.script
      }])
      setChatState('idle')

    } else if (state === 'awaiting_video_script') {
      // Call Video API
      const response = await fetch(`${API_BASE_URL}/content/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_content: text, resolution: '480p', duration: 5 })
      })
      const data = await response.json()

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '视频制作完成！',
        type: 'video-result',
        data: { url: data.video_url, title: 'AI生成视频' }
      }])
      setChatState('idle')

    } else {
      // Default / Idle
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '我不确定您的意思。请点击下方按钮选择您需要的功能：选题、封面、脚本或视频制作。',
        type: 'text'
      }])
    }
  }

  const handleToolClick = (tool: 'topic' | 'cover' | 'script' | 'video') => {
    let msg = ''
    if (tool === 'topic') {
        setChatState('awaiting_topic_keywords')
        msg = '请告诉我您想生成的选题关键词？（例如：客厅, 极简）'
    } else if (tool === 'cover') {
        setChatState('awaiting_cover_title')
        msg = '请输入您想要生成封面的标题或描述：'
    } else if (tool === 'script') {
        setChatState('awaiting_script_title')
        msg = '请输入视频脚本的标题：'
    } else if (tool === 'video') {
        setChatState('awaiting_video_script')
        msg = '请输入视频的脚本内容或场景描述：'
    }

    setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: msg,
        type: 'text'
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <Bot className="text-[#8B4513]" />
        <h2 className="font-semibold text-gray-900">AI 智能助手</h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#8B4513] text-white' : 'bg-white border border-gray-200 text-[#8B4513]'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[80%] space-y-2`}>
                <div className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[#8B4513] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'}`}>
                    {msg.content}
                </div>

                {/* Result Renderers */}
                {msg.type === 'topic-result' && msg.data && (
                    <div className="grid gap-2">
                        {msg.data.map((topic: any) => (
                            <div key={topic.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm">
                                <div className="font-bold text-gray-900">{topic.title}</div>
                                <div className="text-gray-500 text-xs mt-1">分类: {topic.category} | 推荐指数: {topic.engagement_score}</div>
                            </div>
                        ))}
                    </div>
                )}

                {msg.type === 'cover-result' && msg.data && (
                    <div className="grid grid-cols-2 gap-2">
                        {msg.data.map((cover: any) => (
                            <div key={cover.id} className="rounded-lg overflow-hidden border border-gray-200">
                                <img src={cover.url} alt={cover.alt_text} className="w-full h-32 object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                {msg.type === 'script-result' && msg.data && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                        <h4 className="font-bold mb-2">{msg.data.title}</h4>
                        {msg.data.content}
                    </div>
                )}

                {msg.type === 'video-result' && msg.data && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                        <video src={msg.data.url} controls className="w-full h-auto max-h-60" />
                    </div>
                )}
            </div>
          </div>
        ))}
        {loading && (
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-[#8B4513] flex items-center justify-center">
                    <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-xl rounded-tl-none shadow-sm flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    正在思考...
                </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Function Box (Toolbar) */}
      <div className="p-3 bg-white border-t border-gray-100 grid grid-cols-4 gap-2">
        <button onClick={() => handleToolClick('topic')} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-[#8B4513] transition-colors gap-1">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#8B4513]">
                <FileText size={16} />
            </div>
            <span className="text-xs">批量选题</span>
        </button>
        <button onClick={() => handleToolClick('cover')} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-[#8B4513] transition-colors gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <ImageIcon size={16} />
            </div>
            <span className="text-xs">生成封面</span>
        </button>
        <button onClick={() => handleToolClick('script')} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-[#8B4513] transition-colors gap-1">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <Clapperboard size={16} />
            </div>
            <span className="text-xs">生成脚本</span>
        </button>
        <button onClick={() => handleToolClick('video')} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-[#8B4513] transition-colors gap-1">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <Video size={16} />
            </div>
            <span className="text-xs">制作视频</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            chatState === 'awaiting_topic_keywords' ? "请输入选题关键词..." :
            chatState === 'awaiting_cover_title' ? "请输入封面标题..." :
            chatState === 'awaiting_script_title' ? "请输入脚本标题..." :
            chatState === 'awaiting_video_script' ? "请输入视频描述..." :
            "输入消息..."
          }
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || loading}
          className="bg-[#8B4513] text-white p-2 rounded-lg hover:bg-[#654321] transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}

export default ChatAssistant
