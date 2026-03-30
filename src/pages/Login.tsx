import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 优先尝试后端登录
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setAuth(data.token, data.user)
        navigate('/chat/assistant', { replace: true })
        return
      }
      
      throw new Error(data.error || 'Login failed')
    } catch (err: any) {
      console.error('Login error:', err)
      // 降级策略：如果后端不可用或登录失败，且账号匹配演示账号，则允许进入
      if (email === 'admin@liangmu.com' && password === '123456') {
         setAuth('demo-token', {
           id: 'demo-user',
           email: 'admin@liangmu.com',
           name: '良木管理员',
           role: 'marketing_manager',
           permissions: ['all']
         })
         navigate('/chat/assistant', { replace: true })
         return
      }
      setError(err.message || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('admin@liangmu.com')
    setPassword('123456')
  }

  const handleRegister = async () => {
      // Quick register for demo
      setLoading(true)
      setError('')
      try {
        const response = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name: email.split('@')[0] }),
          })
    
          const data = await response.json()
    
          if (!data.success) {
            throw new Error(data.error || 'Register failed')
          }
          
          alert('Registration successful! Please login.')
      } catch (err: any) {
        console.error('Register error:', err)
        setError(err.message || 'Failed to register')
      } finally {
        setLoading(false)
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#E5E5E5]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8B4513] mb-2">良木家居</h1>
          <p className="text-gray-500">AI全案整装生活馆内容平台</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium mb-2">演示账号：</p>
          <div className="flex justify-between items-center text-sm text-blue-600 mb-1">
            <span>邮箱：admin@liangmu.com</span>
          </div>
          <div className="flex justify-between items-center text-sm text-blue-600">
            <span>密码：123456</span>
          </div>
          <button 
            type="button"
            onClick={handleDemoLogin}
            className="mt-3 w-full text-xs bg-blue-100 text-blue-700 py-1.5 rounded hover:bg-blue-200 transition-colors"
          >
            一键填入演示账号
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">企业邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B4513] text-white py-2.5 rounded-lg hover:bg-[#654321] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '登录'}
          </button>

           <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-white text-[#8B4513] border border-[#8B4513] py-2.5 rounded-lg hover:bg-[#FAF8F5] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            注册 (Demo)
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
