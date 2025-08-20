// src/components/home/BeautifulURLsShowcase.tsx
'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface URLExample {
  title: string
  oldUrl: string
  newUrl: string
  description: string
  system: string
  city: string
}

const urlExamples: URLExample[] = [
  {
    title: "Драконы и Подземелья",
    oldUrl: "games/cmejl78hf00067mbreateybwg",
    newUrl: "games/drakony-i-podzemelya-dnd5e-almaty-a1b2c3",
    description: "Классическая кампания D&D 5e для новичков в Алматы",
    system: "D&D 5e",
    city: "Алматы"
  },
  {
    title: "Зов Ктулху",
    oldUrl: "games/dk39msl02k40fj20sdkf93msd",
    newUrl: "games/zov-ktulhu-tayny-arkhema-cthulhu-astana-d4e5f6",
    description: "Мистический хоррор в Астане",
    system: "Call of Cthulhu",
    city: "Астана"
  },
  {
    title: "Cyberpunk 2077",
    oldUrl: "games/f03jdk40sk39dk40sk30dkf0s",
    newUrl: "games/cyberpunk-2077-night-city-cyberpunk-almaty-j0k1l2",
    description: "Киберпанк будущего в Алматы",
    system: "Cyberpunk",
    city: "Алматы"
  }
]

export function BeautifulURLsShowcase() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(`https://kazrpg.kz/${url}`)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }
  
  return (
    <section className="py-16 bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Красивые и понятные URL
          </h2>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Мы сделали ссылки на игры красивыми и информативными. 
            Теперь по URL сразу понятно, что это за игра, какая система и где она проходит.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:gap-12">
            {urlExamples.map((example, index) => (
              <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {example.title}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {example.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                      {example.system}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                      {example.city}
                    </span>
                  </div>
                </div>
                
                {/* Old URL */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-red-400 mb-1">
                    ❌ Раньше (сложно и непонятно):
                  </label>
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    <code className="text-red-300 text-sm break-all font-mono">
                      kazrpg.kz/{example.oldUrl}
                    </code>
                  </div>
                </div>
                
                {/* New URL */}
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-1">
                    ✅ Теперь (красиво и информативно):
                  </label>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <code className="text-green-300 text-sm break-all font-mono flex-1">
                        kazrpg.kz/{example.newUrl}
                      </code>
                      <div className="flex gap-2 ml-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(example.newUrl, index)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <a 
                          href={`/${example.newUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Benefits */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center text-slate-400">
                    <span className="text-green-400 mr-2">📖</span>
                    Читаемо
                  </div>
                  <div className="flex items-center text-slate-400">
                    <span className="text-blue-400 mr-2">🔍</span>
                    SEO-оптимизировано
                  </div>
                  <div className="flex items-center text-slate-400">
                    <span className="text-purple-400 mr-2">🚀</span>
                    Удобно делиться
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-3">
                Структура нового URL
              </h3>
              <div className="text-slate-300 text-sm">
                <code className="bg-slate-700/50 px-2 py-1 rounded text-purple-300">
                  название-игры
                </code>
                <span className="mx-2">-</span>
                <code className="bg-slate-700/50 px-2 py-1 rounded text-blue-300">
                  система
                </code>
                <span className="mx-2">-</span>
                <code className="bg-slate-700/50 px-2 py-1 rounded text-green-300">
                  город
                </code>
                <span className="mx-2">-</span>
                <code className="bg-slate-700/50 px-2 py-1 rounded text-yellow-300">
                  id
                </code>
              </div>
              <p className="text-slate-400 text-xs mt-3">
                Поддерживается транслитерация русского и казахского языков
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
