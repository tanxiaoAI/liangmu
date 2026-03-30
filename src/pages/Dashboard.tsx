import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, Image as ImageIcon, Clapperboard, Video, ArrowRight } from 'lucide-react'

const Dashboard: React.FC = () => {
  const features = [
    {
      title: '批量选题生成',
      description: '输入关键词，AI自动生成符合家居行业热点的选题列表',
      icon: FileText,
      path: '/content/topic-generator',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: '封面图生成',
      description: '上传参考图，批量生成高质量家居场景封面',
      icon: ImageIcon,
      path: '/content/cover-generator',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: '脚本生成',
      description: '根据选题自动编写分镜脚本，包含口播文案',
      icon: Clapperboard,
      path: '/content/script-generator',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: '视频制作',
      description: '一键合成短视频，自动匹配素材和配乐',
      icon: Video,
      path: '/content/video-generator',
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">工作台</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.path}
              to={feature.path}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{feature.description}</p>
              <div className="flex items-center text-[#8B4513] text-sm font-medium group-hover:gap-2 transition-all">
                <span>开始创作</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">行业模板推荐</h3>
            <Link to="#" className="text-sm text-[#8B4513] hover:underline">查看全部</Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden">
                   <img src={`https://placehold.co/300x200?text=Template+${i}`} alt="Template" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">现代简约客厅改造案例</h4>
                  <p className="text-xs text-gray-500 mt-1">使用人数: 1.2k+</p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50">
                  使用模板
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最近任务</h3>
            <Link to="#" className="text-sm text-[#8B4513] hover:underline">任务看板</Link>
          </div>
          <div className="space-y-4">
             <div className="text-center py-8 text-gray-400">
                暂无进行中的任务
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
