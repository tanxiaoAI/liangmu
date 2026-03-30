import React, { useState } from 'react'
import { Upload, Film, Trash2, Plus, Play, CheckCircle } from 'lucide-react'

export interface Asset {
  id: string
  url: string
  name: string
  duration: number
  type: 'video' | 'image'
  thumbnail: string
  date: string
}

// Pre-filled mock assets for demo
export const MOCK_ASSETS: Asset[] = [
  {
    id: 'asset_1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 
    name: '现代客厅全景.mp4',
    duration: 15,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600&auto=format&fit=crop',
    date: '2024-03-15'
  },
  {
    id: 'asset_2',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    name: '别墅庭院外景.mp4',
    duration: 15,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600&auto=format&fit=crop',
    date: '2024-03-14'
  },
  {
    id: 'asset_3',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    name: '儿童房动画演示.mp4',
    duration: 60,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=600&auto=format&fit=crop',
    date: '2024-03-12'
  },
  {
    id: 'asset_4',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    name: '智能家居展示.mp4',
    duration: 15,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=600&auto=format&fit=crop',
    date: '2024-03-10'
  }
]

const AssetsLibrary: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('liangmu_assets')
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Check if mock assets need update (e.g. still using old istock urls or missing new ones)
            const hasOldUrls = parsed.some((a: Asset) => a.url && a.url.includes('istockphoto'));
            
            if (hasOldUrls) {
                // Keep user uploaded assets (id starting with local_)
                const userAssets = parsed.filter((a: Asset) => a.id.startsWith('local_'));
                // Replace mocks with new MOCK_ASSETS
                return [...userAssets, ...MOCK_ASSETS];
            }
            return parsed;
        } catch (e) {
            return MOCK_ASSETS;
        }
    }
    return MOCK_ASSETS
  })

  // Sync back to localStorage if updated
  React.useEffect(() => {
      localStorage.setItem('liangmu_assets', JSON.stringify(assets))
  }, [assets])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAssets: Asset[] = []
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      newAssets.push({
        id: `local_${Date.now()}_${Math.random()}`,
        url: url,
        name: file.name,
        duration: 10, // Mock duration
        type: file.type.startsWith('video') ? 'video' : 'image',
        thumbnail: file.type.startsWith('video') ? 'https://placehold.co/600x400?text=Video' : url,
        date: new Date().toISOString()
      })
    })

    const updatedAssets = [...newAssets, ...assets]
    setAssets(updatedAssets)
    localStorage.setItem('liangmu_assets', JSON.stringify(updatedAssets))
  }

  const handleDelete = (id: string) => {
    const updated = assets.filter(a => a.id !== id)
    setAssets(updated)
    localStorage.setItem('liangmu_assets', JSON.stringify(updated))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">素材管理库</h2>
          <p className="text-gray-500 mt-1">管理您的视频和图片素材，用于混剪制作</p>
        </div>
        <div className="relative">
            <input 
                type="file" 
                multiple 
                accept="video/*,image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#654321] transition-colors">
                <Upload size={18} />
                <span>上传素材</span>
            </button>
        </div>
      </div>

      {assets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {assets.map((asset) => (
                <div key={asset.id} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="aspect-video bg-gray-100 relative">
                        <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                        {asset.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                <Play className="text-white opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-all" size={32} />
                            </div>
                        )}
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {asset.duration}s
                        </span>
                        <button 
                            onClick={() => handleDelete(asset.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 truncate" title={asset.name}>{asset.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{new Date(asset.date).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Film size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无素材，请上传</p>
        </div>
      )}
    </div>
  )
}

export default AssetsLibrary