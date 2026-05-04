'use client'

import React, { useState } from 'react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface VerifiedBadgeProps {
  className?: string
  showText?: boolean
}

export function VerifiedBadge({ className, showText = true }: VerifiedBadgeProps) {
  const t = useTranslations('WorkerProfile')
  return (
    <div className={cn(
      "relative flex items-center gap-2 px-3 py-1.5 rounded-full overflow-hidden group",
      "bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20",
      "border border-yellow-500/30 backdrop-blur-md shadow-lg shadow-yellow-500/10",
      className
    )}>
      {/* Animated Shine Effect */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
      
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />

      <div className="relative flex items-center justify-center">
        <ShieldCheck className="w-4 h-4 text-yellow-400 fill-yellow-400/10 z-10" />
        <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5 text-white animate-bounce" />
      </div>

      {showText && (
        <span className="relative text-[10px] font-black uppercase tracking-widest text-yellow-200 z-10">
          {t('top_rated')}
        </span>
      )}

      {/* Hover Info Tooltip (Visual only for now) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg whitespace-nowrap text-[8px] font-bold text-slate-400 shadow-2xl">
          {t('documents_verified')}
        </div>
      </div>
    </div>
  )
}

