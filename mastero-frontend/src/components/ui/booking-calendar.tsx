'use client'

import React, { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

interface Slot {
  id: string
  time: string
  available: boolean
}

interface BookingCalendarProps {
  onBook: (slotId: string) => void
  isBooking?: boolean
}

export function BookingCalendar({ onBook, isBooking, workerId }: BookingCalendarProps & { workerId?: string }) {
  const t = useTranslations('WorkerProfile')
  const [selectedDate, setSelectedDate] = useState<number>(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  // Generate next 7 days dynamically
  const days = useMemo(() => {
    const d = []
    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() + i)
      d.push({
        label: i === 0 ? t('today') : i === 1 ? t('tomorrow') : new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date),
        date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date),
        fullDate: date.toISOString().split('T')[0]
      })
    }
    return d
  }, [t])

  // Mock availability logic based on workerId and date
  const getSlotsForDate = (dateStr: string) => {
    const baseSlots = [
      { id: '1', time: '09:00' },
      { id: '2', time: '11:00' },
      { id: '3', time: '13:00' },
      { id: '4', time: '15:00' },
      { id: '5', time: '17:00' },
      { id: '6', time: '19:00' },
    ]

    return baseSlots.map(slot => {
      // Logic: workerId + dateStr + slot.id determines availability
      // This is a deterministic mock: same worker + same day = same busy slots
      const seed = (workerId || '') + dateStr + slot.id
      let hash = 0
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i)
        hash |= 0
      }
      const isAvailable = Math.abs(hash % 3) !== 0 // ~66% available
      return { ...slot, available: isAvailable }
    })
  }

  const currentSlots = useMemo(() => getSlotsForDate(days[selectedDate].fullDate), [selectedDate, days, workerId])

  const nextFreeSlot = currentSlots.find(s => s.available)
  const isMasterBusyNow = !currentSlots[0].available // Simple logic: if 9:00 is busy, he's "busy" for now

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 p-4 rounded-[1.5rem] text-indigo-500 shadow-inner">
            <CalendarIcon size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight truncate">{t('booking_title')}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                isMasterBusyNow 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              )}>
                <div className={cn("w-1 h-1 rounded-full animate-pulse", isMasterBusyNow ? "bg-rose-500" : "bg-emerald-500")} />
                {isMasterBusyNow ? t('status_busy') : t('status_free')}
              </div>
              {isMasterBusyNow && nextFreeSlot && (
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                   • {t('free_at')} {nextFreeSlot.time}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedDate(idx)
              setSelectedSlot(null)
            }}
            className={cn(
              "flex-shrink-0 flex flex-col items-center min-w-[100px] p-6 rounded-[2rem] border transition-all duration-500 group",
              selectedDate === idx
                ? "bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-600/30 scale-105"
                : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/30 text-slate-400"
            )}
          >
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-2 transition-colors", 
              selectedDate === idx ? "text-indigo-200" : "text-slate-500 group-hover:text-indigo-400"
            )}>
              {day.label}
            </span>
            <span className={cn("text-lg font-black transition-colors", selectedDate === idx ? "text-white" : "text-slate-900 dark:text-slate-200")}>
              {day.date}
            </span>
          </button>
        ))}
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {currentSlots.map((slot) => (
          <button
            key={slot.id}
            disabled={!slot.available}
            onClick={() => setSelectedSlot(slot.id)}
            className={cn(
              "relative flex items-center justify-center gap-3 py-5 rounded-2xl border font-black text-sm transition-all duration-500 overflow-hidden",
              !slot.available 
                ? "bg-slate-100/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                : selectedSlot === slot.id
                  ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-inner"
                  : "bg-white dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/50 text-slate-600 dark:text-slate-300 hover:scale-[1.02]"
            )}
          >
            <Clock size={16} className={cn("transition-transform duration-500", selectedSlot === slot.id && "rotate-12")} />
            {slot.time}
            
            {!slot.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/5 backdrop-blur-[1px]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] -rotate-12 text-slate-400/30">{t('status_busy')}</span>
              </div>
            )}

            {selectedSlot === slot.id && (
              <motion.div 
                layoutId="slot-check"
                className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"
              >
                <Check size={10} className="text-white" />
              </motion.div>
            )}
          </button>
        ))}
      </div>

      {/* Confirm Button */}
      <Button
        disabled={!selectedSlot || isBooking}
        onClick={() => selectedSlot && onBook(selectedSlot)}
        className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-600/30 group transition-all active:scale-95 disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {t('confirm_booking')}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Button>

      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black opacity-60">
        <Check className="w-3 h-3 text-emerald-500" />
        {t('cancel_policy')}
      </div>
    </div>
  )
}

