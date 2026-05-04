'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from "@/lib/utils"

interface DoubleRangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  className?: string
  label?: string
  unit?: string
}

export function DoubleRangeSlider({ 
  min, 
  max, 
  step = 1,
  value: [minValue, maxValue], 
  onChange,
  className,
  label = "Price Range",
  unit = "TJS"
}: DoubleRangeSliderProps) {
  const [isDraggingMin, setIsDraggingMin] = useState(false)
  const [isDraggingMax, setIsDraggingMax] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number, isMin: boolean) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percent = (x / rect.width) * 100
    const newValue = Math.round((percent / 100) * (max - min) + min)
    
    if (isMin) {
      const newMin = Math.min(newValue, maxValue - step)
      onChange([Math.max(min, newMin), maxValue])
    } else {
      const newMax = Math.max(newValue, minValue + step)
      onChange([minValue, Math.min(max, newMax)])
    }
  }

  const handleMouseDownMin = () => setIsDraggingMin(true)
  const handleMouseDownMax = () => setIsDraggingMax(true)
  const handleMouseUp = () => {
    setIsDraggingMin(false)
    setIsDraggingMax(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingMin) handleMove(e.clientX, true)
    if (isDraggingMax) handleMove(e.clientX, false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingMin) handleMove(e.touches[0].clientX, true)
    if (isDraggingMax) handleMove(e.touches[0].clientX, false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp()
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  const minPercent = ((minValue - min) / (max - min)) * 100
  const maxPercent = ((maxValue - min) / (max - min)) * 100

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm font-bold text-indigo-400">
            {minValue} - {maxValue} {unit}
          </span>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="relative h-12 w-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-muted rounded-full -translate-y-1/2" />
        
        {/* Selected Range */}
        <div 
          className="absolute top-1/2 h-2 bg-indigo-500 rounded-full -translate-y-1/2"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        
        {/* Min Thumb */}
        <div 
          className="absolute top-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
          style={{ left: `${minPercent}%` }}
          onMouseDown={handleMouseDownMin}
          onTouchStart={handleMouseDownMin}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold bg-indigo-500 text-white px-2 py-1 rounded">
            {minValue} {unit}
          </div>
        </div>
        
        {/* Max Thumb */}
        <div 
          className="absolute top-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
          style={{ left: `${maxPercent}%` }}
          onMouseDown={handleMouseDownMax}
          onTouchStart={handleMouseDownMax}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold bg-indigo-500 text-white px-2 py-1 rounded">
            {maxValue} {unit}
          </div>
        </div>
        
        {/* Min/Max Labels */}
        <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
          {min} {unit}
        </div>
        <div className="absolute -bottom-6 right-0 text-xs text-muted-foreground">
          {max} {unit}
        </div>
      </div>
    </div>
  )
}
