// ===== src/app/page.tsx =====
import { Suspense } from 'react'
import { Hero } from '@/components/home/Hero'
import { FeaturedGames } from '@/components/home/FeaturedGames'
import { Features } from '@/components/home/Features' 
import { Stats } from '@/components/home/Stats'
import { CTA } from '@/components/home/CTA'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <FeaturedGames />
      </Suspense>
      
      <Features />
      <Stats />
      <CTA />
    </div>
  )
}