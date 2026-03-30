import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Type,
  Clapperboard,
  Video,
  LogOut,
  Settings,
  Users,
  MessageSquare,
  Bot
} from 'lucide-react'

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { icon: Bot, label: 'AI 助手', path: '/chat/assistant' },
    { icon: FileText, label: '批量选题', path: '/content/topic-generator' },
    { icon: ImageIcon, label: '封面生成', path: '/content/cover-generator' },
    { icon: Type, label: '标题生成', path: '/content/title-generator' },
    { icon: Clapperboard, label: '脚本生成', path: '/content/script-generator' },
    { icon: Video, label: '视频制作', path: '/content/video-generator' },
    { icon: Users, label: '素材管理', path: '/assets/library' },
    { icon: MessageSquare, label: '客户互动', path: '/customer/leads' },
    { icon: Settings, label: '系统设置', path: '/settings' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-[#8B4513]">良木家居</h1>
          <p className="text-xs text-gray-500 mt-1">AI全案整装生活馆</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-[#FAF8F5] text-[#8B4513] font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#8B4513]'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#8B4513] flex items-center justify-center text-white text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
