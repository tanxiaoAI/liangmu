import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TopicGenerator from './pages/content/TopicGenerator'
import CoverGenerator from './pages/content/CoverGenerator'
import TitleGenerator from './pages/content/TitleGenerator'
import ScriptGenerator from './pages/content/ScriptGenerator'
import VideoGenerator from './pages/content/VideoGenerator'
import AssetsLibrary from './pages/assets/Library'
import CustomerLeads from './pages/customer/CustomerLeads'
import ChatAssistant from './pages/ChatAssistant'
import { useAuthStore } from './store/auth'

// Placeholders for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-500">该功能正在开发中...</p>
  </div>
)

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/" />
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="content/topic-generator" element={<TopicGenerator />} />
          <Route path="content/cover-generator" element={<CoverGenerator />} />
          <Route path="content/title-generator" element={<TitleGenerator />} />
          <Route path="content/script-generator" element={<ScriptGenerator />} />
          <Route path="content/video-generator" element={<VideoGenerator />} />
          <Route path="assets/library" element={<AssetsLibrary />} />
          <Route path="customer/leads" element={<CustomerLeads />} />
          <Route path="chat/assistant" element={<ChatAssistant />} />
          <Route path="settings" element={<Placeholder title="系统设置" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
