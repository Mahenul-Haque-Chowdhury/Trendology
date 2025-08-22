"use client"
import HomeHero from '@/components/HomeHero'
import HomeGrids from '@/components/HomeGrids'

export default function Page() {
  return (
    <div className="space-y-10">
      <HomeHero />
      <HomeGrids />
    </div>
  )
}
