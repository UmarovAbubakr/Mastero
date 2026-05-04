'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { MoveLeft } from 'lucide-react'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  beforeLabel = 'До', 
  afterLabel = 'После' 
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percent = (x / rect.width) * 100
    setSliderPosition(percent)
  }

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl overflow-hidden cursor-col-resize select-none border border-white/10 shadow-2xl group"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        <Image 
          src={afterImage} 
          alt="After" 
          fill 
          className="object-cover"
          draggable={false}
        />
        <div className="absolute bottom-6 right-6 px-4 py-2 bg-indigo-600/80 backdrop-blur-md rounded-3xl text-white text-xs font-black uppercase tracking-widest">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Foreground with Clip) */}
      <div 
        className="absolute inset-0 z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image 
          src={beforeImage} 
          alt="Before" 
          fill 
          className="object-cover"
          draggable={false}
        />
        <div className="absolute bottom-6 left-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-3xl text-white text-xs font-black uppercase tracking-widest">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-col-resize flex items-center justify-center transition-transform group-hover:scale-y-105"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center -ml-0.5 border-4 border-indigo-500/20 group-hover:scale-110 transition-transform">
          <MoveLeft className="w-5 h-5 text-indigo-600" />
        </div>
      </div>

      {/* Hint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="px-6 py-3 bg-black/40 backdrop-blur-xl rounded-2xl text-white/80 text-sm font-medium border border-white/10">
          Тяните ползунок для сравнения
        </div>
      </div>
    </div>
  )
}

