// ===== src/components/layout/Header.tsx =====
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dice6, Menu, X, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Dice6 className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-2xl font-bold gradient-text">KazRPG</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/games" className="text-gray-300 hover:text-white transition-colors">
              Игры
            </Link>
            <Link href="/gms" className="text-gray-300 hover:text-white transition-colors">
              Мастера
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              О нас
            </Link>
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Поиск
            </Button>
            <Button variant="ghost" size="sm">
              <Link href="/auth/signin">Войти</Link>
            </Button>
            <Button size="sm">
              <Link href="/auth/signup">Регистрация</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/games" className="text-gray-300 hover:text-white">
                Игры
              </Link>
              <Link href="/gms" className="text-gray-300 hover:text-white">
                Мастера
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white">
                О нас
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
                <Button variant="ghost" className="justify-start">
                  <Link href="/auth/signin">Войти</Link>
                </Button>
                <Button className="justify-start">
                  <Link href="/auth/signup">Регистрация</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}