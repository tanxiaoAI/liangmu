import React, { useState } from 'react'
import { MessageSquare, Search, Filter, MessageCircle, Heart, Share2, Send, Bot, CheckCircle, Clock, MoreHorizontal, Loader2 } from 'lucide-react'

interface Lead {
  id: string
  source: 'douyin' | 'xiaohongshu'
  username: string
  avatar: string
  content: string
  time: string
  status: 'pending' | 'replied' | 'ignored'
  ai_reply?: string
  intention_score: number
  tags: string[]
}

const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    source: 'xiaohongshu',
    username: '桃子爱生活',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: '请问那个极简卧室的床头柜有链接吗？真的很喜欢这种风格！',
    time: '10分钟前',
    status: 'pending',
    intention_score: 95,
    tags: ['询价', '极简风']
  },
  {
    id: '2',
    source: 'douyin',
    username: '装修小白',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    content: '全屋定制大概多少钱一平？有没有包含软装？',
    time: '32分钟前',
    status: 'pending',
    intention_score: 88,
    tags: ['预算咨询', '全屋定制']
  },
  {
    id: '3',
    source: 'xiaohongshu',
    username: 'CoCo',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: '新中式风格适合小户型吗？担心会显得压抑。',
    time: '1小时前',
    status: 'replied',
    ai_reply: '亲，新中式其实非常适合小户型哦！我们推荐“轻中式”设计，通过留白和简约线条来通过空间感，完全不会压抑，反而很有格调呢~ 稍后私信您几个小户型新中式案例参考一下！',
    intention_score: 75,
    tags: ['设计咨询', '新中式']
  },
  {
    id: '4',
    source: 'douyin',
    username: '大山',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    content: '视频里的沙发看起来很软，是真皮的吗？',
    time: '2小时前',
    status: 'ignored',
    intention_score: 60,
    tags: ['产品细节']
  },
  {
    id: '5',
    source: 'xiaohongshu',
    username: 'Momo',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    content: '蹲一个全案报价清单！',
    time: '3小时前',
    status: 'pending',
    intention_score: 92,
    tags: ['强意向', '报价']
  }
]

const CustomerLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all')
  const [replyingId, setReplyingId] = useState<string | null>(null)

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true
    return lead.status === filter
  })

  const handleAiReply = (id: string) => {
    setReplyingId(id)
    // Mock AI generation delay
    setTimeout(() => {
      setLeads(prev => prev.map(lead => {
        if (lead.id === id) {
          return {
            ...lead,
            status: 'replied',
            ai_reply: generateMockReply(lead.content)
          }
        }
        return lead
      }))
      setReplyingId(null)
    }, 1500)
  }

  const generateMockReply = (content: string) => {
    if (content.includes('链接') || content.includes('多少钱')) {
      return '亲，感谢喜爱！具体产品信息和优惠方案已整理好，稍后私信发您详细清单哦~ 🎁'
    }
    if (content.includes('风格') || content.includes('设计')) {
      return '您的眼光真好！这个风格目前非常流行，而且我们有专门针对此类户型的设计方案，可以点击主页预约免费设计咨询哦！✨'
    }
    return '收到您的留言啦！良木家居顾问稍后会联系您，为您提供一对一专属服务~ 🏠'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">客户互动</h2>
          <p className="text-gray-500 mt-1">集中管理来自抖音/小红书的客户咨询，AI 智能辅助回复</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索客户或内容..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none text-sm w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Filter size={18} />
            <span>筛选</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${filter === 'all' ? 'text-[#8B4513]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          全部消息
          {filter === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B4513]"></div>}
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${filter === 'pending' ? 'text-[#8B4513]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          待回复 <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">3</span>
          {filter === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B4513]"></div>}
        </button>
        <button 
          onClick={() => setFilter('replied')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${filter === 'replied' ? 'text-[#8B4513]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          已回复
          {filter === 'replied' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B4513]"></div>}
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <img src={lead.avatar} alt={lead.username} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  {lead.source === 'xiaohongshu' ? (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">书</div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-bold">抖</div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-semibold text-gray-900 mr-2">{lead.username}</span>
                    <span className="text-xs text-gray-400">{lead.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`text-xs px-2 py-0.5 rounded border ${
                        lead.intention_score >= 90 ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        lead.intention_score >= 70 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                     }`}>
                        意向分: {lead.intention_score}
                     </span>
                     <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                     </button>
                  </div>
                </div>
                
                <p className="text-gray-800 mb-3">{lead.content}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  {lead.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>

                {/* AI Reply Section */}
                {lead.status === 'replied' ? (
                  <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#F0EAE0]">
                    <div className="flex items-center gap-2 mb-2 text-[#8B4513] text-xs font-medium">
                      <Bot size={14} />
                      <span>AI 自动回复已发送</span>
                      <CheckCircle size={14} className="ml-auto text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600">{lead.ai_reply}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleAiReply(lead.id)}
                        disabled={replyingId === lead.id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8B4513] text-white text-sm rounded-lg hover:bg-[#654321] transition-colors disabled:opacity-70"
                    >
                        {replyingId === lead.id ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                AI 生成回复中...
                            </>
                        ) : (
                            <>
                                <Bot size={16} />
                                AI 智能回复
                            </>
                        )}
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        人工回复
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        忽略
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomerLeads