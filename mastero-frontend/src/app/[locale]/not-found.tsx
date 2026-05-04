'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Link } from "@/src/i18n/routing"
import { Hammer, ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('NotFound')
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-32 h-32 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-indigo-500/20"
        >
          <Hammer size={64} className="text-white" />
        </motion.div>

        {/* 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-100 dark:from-white/10 dark:to-transparent absolute left-1/2 -top-24 -translate-x-1/2 -z-10 select-none">
            404
          </h1>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            {t('lost')}
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-md mx-auto leading-relaxed"
        >
          {t('desc')}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/">
            <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Home className="mr-2 h-5 w-5" /> {t('go_home')}
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Search className="mr-2 h-5 w-5" /> {t('find_master')}
            </Button>
          </Link>
        </motion.div>

        {/* Back Link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => window.history.back()}
          className="mt-12 flex items-center gap-2 text-slate-400 hover:text-indigo-500 font-bold transition-colors mx-auto group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {t('go_back')}
        </motion.button>
      </div>
    </div>
  )
}