"use client"

import React, { useState, useEffect } from 'react'
import { Star, X, MessageSquare, Send, CheckCircle2, Sparkles, Award, Heart } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/lib/utils'
import { useRateOrderMutation } from '@/src/store/api/orderApi'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface ReviewModalProps {
  orderId: string
  workerName: string
  onClose: () => void
  onSuccess: () => void
}

const starVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.3, rotate: 15 },
  tap: { scale: 0.9 },
  selected: { 
    scale: [1, 1.5, 1],
    rotate: [0, 20, -20, 0],
    transition: { duration: 0.4 }
  }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    transition: { duration: 0.2 } 
  }
}

export function ReviewModal({ orderId, workerName, onClose, onSuccess }: ReviewModalProps) {
  const t = useTranslations('ReviewModal')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [rateOrder, { isLoading }] = useRateOrderMutation()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t('error_rate'))
      return
    }
    try {
      await rateOrder({ id: orderId, rating, comment }).unwrap()
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2500)
    } catch (err: any) {
      toast.error(err?.data?.error || t('error_send'))
    }
  }

  const labels: Record<number, string> = {
    1: t('bad'),
    2: t('so_so'),
    3: t('normal'),
    4: t('good'),
    5: t('excellent')
  }

  const quotes: Record<number, string> = {
    1: t('quote_1'),
    2: t('quote_2'),
    3: t('quote_3'),
    4: t('quote_4'),
    5: t('quote_5')
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-10"
          >
            {/* Decoration */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl flex items-center justify-center text-white rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Award size={48} />
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500 transition-all"
            >
              <X size={16} />
            </button>

            <div className="text-center mt-12 mb-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('title')}</h2>
              <p className="text-indigo-500 font-bold mt-2 flex items-center justify-center gap-2">
                <Sparkles size={16} />
                {workerName}
              </p>
            </div>

            {/* Stars Container */}
            <div className="relative mb-10">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    variants={starVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    animate={rating === star ? "selected" : "initial"}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="relative"
                  >
                    <Star
                      size={44}
                      className={cn(
                        "transition-colors duration-300",
                        (hovered || rating) >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-200 dark:text-slate-700"
                      )}
                    />
                    {(hovered || rating) >= star && (
                      <motion.div
                        layoutId="star-glow"
                        className="absolute inset-0 blur-xl bg-yellow-400/30 -z-10"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={hovered || rating}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-center mt-6 h-12"
                >
                  <div className="text-lg font-black uppercase tracking-widest text-yellow-500">
                    {labels[hovered || rating] || ' '}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    {quotes[hovered || rating] || ' '}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Comment */}
            <div className="space-y-3 mb-8">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                <MessageSquare size={14} className="text-indigo-500" />
                {t('comment_label')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={t('comment_placeholder')}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || rating === 0}
              className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all group overflow-hidden relative"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  {t('submit')}
                </div>
              )}
              <motion.div 
                className="absolute inset-0 bg-white/10 translate-x-[-100%]"
                whileHover={{ translateX: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 text-center shadow-2xl z-10 overflow-hidden"
          >
            {/* Animated Background Circles */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full -z-10"
            />
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-green-500/20"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-slate-900 dark:text-white mb-4"
            >
              {t('success_title')}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 dark:text-slate-400 font-medium mb-8"
            >
              {t('success_subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-2"
            >
              {[1,2,3].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -10, 0],
                    transition: { repeat: Infinity, duration: 1.5, delay: i * 0.2 }
                  }}
                >
                  <Heart size={20} className="text-rose-500 fill-rose-500" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


