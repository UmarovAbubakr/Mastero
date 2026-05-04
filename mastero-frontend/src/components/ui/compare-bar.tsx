'use client'

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/src/store/store'
import { clearCompare } from '@/src/store/slices/compareSlice'
import { Link } from '@/src/i18n/routing'
import { Button } from './button'
import { X, GitCompare, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function CompareBar() {
  const t = useTranslations('Compare')
  const workerIds = useSelector((state: RootState) => state.compare.workerIds)
  const dispatch = useDispatch()

  if (workerIds.length === 0) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] w-[90%] max-w-2xl animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-indigo-500/30 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(79,70,229,0.2)] flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 ml-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <GitCompare size={24} />
          </div>
          <div>
            <div className="text-white font-black text-sm uppercase tracking-widest leading-none mb-1">
              {t('compare_bar_title')}
            </div>
            <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              {t('compare_bar_selected', { count: workerIds.length })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => dispatch(clearCompare())}
            className="text-slate-500 hover:text-white hover:bg-white/5 rounded-3xl px-4"
          >
            <X size={18} className="mr-2" />
            {t('clear_all')}
          </Button>
          
          <Link href="/compare">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl px-6 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 group">
              {t('compare_bar_btn')}
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

