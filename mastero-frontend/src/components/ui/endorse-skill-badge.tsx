"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/lib/utils"

interface Particle {
  id: number
  x: number
  y: number
}

export function EndorseSkillBadge({ skill }: { skill: string }) {
  const [endorsed, setEndorsed] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [count, setCount] = useState(() => Math.floor(Math.random() * 50) + 5) // random initial endorsements

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!endorsed) {
      setEndorsed(true)
      setCount(prev => prev + 1)
      
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newParticles = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        x,
        y
      }))
      
      setParticles(prev => [...prev, ...newParticles])
    }
  }

  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([])
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [particles])

  return (
    <div className="relative group/badge" onClick={handleClick}>
      <Badge 
        className={cn(
          "px-4 py-2.5 rounded-3xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none",
          endorsed 
            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
            : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border-slate-700 hover:border-slate-600"
        )}
      >
        <span>{skill.trim()}</span>
        <span className={cn(
          "px-1.5 py-0.5 rounded-2xl text-[10px]",
          endorsed ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-400 group-hover/badge:bg-slate-600"
        )}>
          {count}
        </span>
      </Badge>

      {/* Floating tooltip indicating action */}
      {!endorsed && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Endorse Skill
        </div>
      )}

      {/* Particles */}
      {particles.map(p => (
        <span 
          key={p.id}
          className="absolute pointer-events-none animate-float-up text-indigo-400 font-black text-sm"
          style={{
            left: p.x,
            top: p.y,
            animationDuration: `${0.6 + Math.random() * 0.4}s`,
            transform: `rotate(${Math.random() * 60 - 30}deg)`
          }}
        >
          +1
        </span>
      ))}
    </div>
  )
}

