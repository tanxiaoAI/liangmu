import React, { useState, useEffect } from 'react'
import { Video, Loader2, Play, CheckCircle, Plus, X } from 'lucide-react'
import { MOCK_ASSETS, Asset } from '../../pages/assets/Library'

const VideoGenerator: React.FC = () => {
  const [style, setStyle] = useState('modern')
  const [resolution, setResolution] = useState('480p')
  const [duration, setDuration] = useState(5)
  const [loading, setLoading] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle')
  const [error, setError] = useState('')
  const [selectedScript, setSelectedScript] = useState<any>(null)
  
  // Asset selection state
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])
  const [showAssetSelector, setShowAssetSelector] = useState(false)
  const [libraryAssets, setLibraryAssets] = useState<Asset[]>([])

  // Load assets from local storage
  useEffect(() => {
      const saved = localStorage.getItem('liangmu_assets')
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              // Check if mock assets need update (e.g. still using old istock urls)
              const hasOldUrls = parsed.some((a: Asset) => a.url && a.url.includes('istockphoto'));
              
              if (hasOldUrls) {
                  // Keep user uploaded assets
                  const userAssets = parsed.filter((a: Asset) => a.id.startsWith('local_'));
                  const updated = [...userAssets, ...MOCK_ASSETS];
                  setLibraryAssets(updated);
                  localStorage.setItem('liangmu_assets', JSON.stringify(updated));
              } else {
                  setLibraryAssets(parsed);
              }
          } catch (e) {
              setLibraryAssets(MOCK_ASSETS);
          }
      } else {
          setLibraryAssets(MOCK_ASSETS);
          localStorage.setItem('liangmu_assets', JSON.stringify(MOCK_ASSETS));
      }
  }, [])

  const handleAssetToggle = (asset: Asset) => {
      if (selectedAssets.find(a => a.id === asset.id)) {
          setSelectedAssets(selectedAssets.filter(a => a.id !== asset.id))
      } else {
          setSelectedAssets([...selectedAssets, asset])
      }
  }

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAssets: Asset[] = []
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      newAssets.push({
        id: `temp_upload_${Date.now()}_${Math.random()}`,
        url: url,
        name: file.name,
        duration: 10, 
        type: file.type.startsWith('video') ? 'video' : 'image',
        thumbnail: file.type.startsWith('video') ? 'https://placehold.co/600x400?text=Video' : url,
        date: new Date().toISOString()
      })
    })
    
    // Add to selection directly
    setSelectedAssets([...selectedAssets, ...newAssets])
  }

  // Load scripts from local storage
  const savedScript = React.useMemo(() => {
    try {
      // In a real app, this would be an array of scripts. 
      // For this demo, we check the single saved script.
      const saved = localStorage.getItem('liangmu_script')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
    }
  }, [])

  // Auto-select the latest script if available
  useEffect(() => {
    if (savedScript) {
        setSelectedScript(savedScript)
    }
  }, [savedScript])

  // Load generated videos from local storage
  const [videos, setVideos] = useState<any[]>(() => {
    const saved = localStorage.getItem('liangmu_videos')
    return saved ? JSON.parse(saved) : []
  })

  // Save videos to local storage
  useEffect(() => {
    localStorage.setItem('liangmu_videos', JSON.stringify(videos))
  }, [videos])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (status === 'processing') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
             // Keep it at 95% until backend returns
             return 95
          }
          return prev + 2 // Slow progress
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [status])

  const handleGenerate = async () => {
    if (!selectedScript) {
        setError('请先选择一个脚本')
        return
    }
    if (selectedAssets.length === 0) {
        setError('请至少选择一个视频素材')
        return
    }

    setLoading(true)
    setError('')
    setVideoId(null)
    setProgress(0)
    setStatus('processing') // Start processing immediately

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${API_BASE_URL}/content/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script_id: selectedScript.id,
          script_content: selectedScript.content, 
          resolution,
          duration,
          assets: selectedAssets, // Pass selected assets
          style: 'modern',
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate video')
      }

      setVideoId(data.video_id)
      setStatus('completed')
      setProgress(100)
      
      // Add completed video to list
      const newVideo = {
          id: data.video_id,
          title: selectedScript?.title || '未命名视频',
          thumbnail: data.video_url || 'https://placehold.co/600x400?text=Video+Preview', // Use real URL as thumbnail/video
          date: new Date().toISOString(),
          scriptId: selectedScript?.id
      }
      setVideos(prevVideos => [newVideo, ...prevVideos])

    } catch (err: any) {
      console.error('Generate error:', err)
      setError(err.message || 'Failed to generate video')
      setStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const [previewVideo, setPreviewVideo] = useState<string | null>(null)

  // ... (previous useEffects)

  const handleVideoClick = (video: any) => {
      // If it's a real video URL (starts with http), show preview
      if (video.thumbnail && video.thumbnail.startsWith('http') && !video.thumbnail.includes('placehold.co')) {
          setPreviewVideo(video.thumbnail)
      }
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewVideo(null)}>
          <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <video 
                src={previewVideo} 
                controls 
                autoPlay 
                className="w-full h-auto max-h-[80vh]"
            />
            <button 
                onClick={() => setPreviewVideo(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <X size={24} />
            </button>
          </div>
        </div>
      )}
      
      {/* Asset Selector Modal */}
      {showAssetSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAssetSelector(false)}>
              <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">选择素材</h3>
                      <button onClick={() => setShowAssetSelector(false)}><X size={24} className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                      <div className="grid grid-cols-3 gap-4">
                          {libraryAssets.map(asset => (
                              <div 
                                key={asset.id} 
                                onClick={() => handleAssetToggle(asset)}
                                className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedAssets.find(a => a.id === asset.id) ? 'border-[#8B4513] ring-2 ring-[#8B4513] ring-opacity-20' : 'border-transparent hover:border-gray-200'}`}
                              >
                                  <div className="aspect-video bg-gray-100">
                                      <img src={asset.thumbnail} className="w-full h-full object-cover" alt={asset.name} />
                                  </div>
                                  <div className="p-2 text-xs truncate font-medium">{asset.name}</div>
                                  {selectedAssets.find(a => a.id === asset.id) && (
                                      <div className="absolute top-2 right-2 bg-[#8B4513] text-white rounded-full p-1">
                                          <CheckCircle size={14} />
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="p-6 border-t flex justify-end">
                      <button 
                        onClick={() => setShowAssetSelector(false)}
                        className="px-6 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#654321]"
                      >
                          确认选择 ({selectedAssets.length})
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">视频制作</h2>
          <p className="text-gray-500 mt-1">脚本驱动混剪，智能匹配素材与配音</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 text-left">1. 选择脚本</h3>
        
        <div className="mb-6 text-left">
            {savedScript ? (
                <div className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedScript?.id === savedScript.id ? 'border-[#8B4513] bg-[#FAF8F5]' : 'border-gray-200 hover:border-gray-300'}`}
                     onClick={() => setSelectedScript(savedScript)}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">{savedScript.title}</p>
                        </div>
                        {selectedScript?.id === savedScript.id && <CheckCircle size={18} className="text-[#8B4513]" />}
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500 text-sm">
                    暂无可用脚本，请先去<a href="/content/script-generator" className="text-[#8B4513] hover:underline">脚本生成</a>页面创建。
                </div>
            )}
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-4 text-left">2. 选择素材</h3>
        <div className="mb-8 text-left">
            <div className="flex gap-4 mb-4">
                <button 
                    onClick={() => setShowAssetSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                    <Plus size={16} /> 从素材库选择
                </button>
                <div className="relative">
                    <input 
                        type="file" 
                        multiple 
                        accept="video/*,image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleLocalUpload}
                    />
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                        <Video size={16} /> 上传本地素材
                    </button>
                </div>
            </div>
            
            {/* Selected Assets List */}
            {selectedAssets.length > 0 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedAssets.map((asset, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
                            <div className="aspect-square bg-gray-100">
                                <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                            </div>
                            <button 
                                onClick={() => setSelectedAssets(selectedAssets.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {selectedAssets.length === 0 && (
                <p className="text-sm text-gray-400 italic">请添加视频素材用于混剪</p>
            )}
        </div>

        {status === 'idle' && (
          <div className="py-8 border-t border-gray-100 mt-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              系统将根据选中的脚本，自动匹配素材和配乐进行剪辑。
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedScript || selectedAssets.length === 0}
              className="bg-[#8B4513] text-white px-8 py-3 rounded-lg hover:bg-[#654321] transition-colors font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
              开始智能混剪
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-12">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={40} className="text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">正在智能混剪...</h3>
            <p className="text-gray-500 mb-2">分析脚本分镜 | 提取高光片段 | 生成AI配音 | 自动对齐字幕</p>
            
            <div className="max-w-md mx-auto mt-6">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#8B4513] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-right text-sm text-gray-500 mt-2">{progress}%</p>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="py-12 border-t border-gray-100 mt-6">
             <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">混剪完成!</h3>
            <p className="text-gray-500 mb-8">您的视频已生成并保存到下方列表</p>
            
            <div className="flex justify-center gap-4">
               <button 
                onClick={() => setStatus('idle')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
               >
                再做一个
               </button>
            </div>
          </div>
        )}

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mt-6 text-sm">
              {error}
            </div>
        )}
      </div>

      {/* Video List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">历史视频</h3>
        {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div 
                            className="relative aspect-video bg-black group cursor-pointer"
                            onClick={() => handleVideoClick(video)}
                        >
                            {video.thumbnail.includes('placehold.co') ? (
                                <>
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="px-3 py-1 bg-red-500/80 text-white text-xs rounded-full backdrop-blur-sm">
                                            生成失败
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <video src={video.thumbnail} className="w-full h-full object-cover opacity-80" muted />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Play size={24} className="text-white ml-1" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-4">
                            <h4 className="font-medium text-gray-900 truncate">{video.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{new Date(video.date).toLocaleString()}</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button className="px-3 py-1.5 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
                                    下载
                                </button>
                                <button className="px-3 py-1.5 text-xs bg-[#8B4513] text-white rounded hover:bg-[#654321]">
                                    发布
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                <Video size={48} className="mx-auto mb-4 opacity-50" />
                <p>暂无生成的视频</p>
            </div>
        )}
      </div>
    </div>
  )
}

export default VideoGenerator