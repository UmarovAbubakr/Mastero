'use client'

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/src/store/store'
import { useGetWorkersByIdsQuery } from '@/src/store/api/workerApi'
import { removeFromCompare, clearCompare } from '@/src/store/slices/compareSlice'
import { Link } from '@/src/i18n/routing'
import { Button } from '@/src/components/ui/button'
import { VerifiedBadge } from '@/src/components/ui/verified-badge'
import {
  X,
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  Banknote,
  Hammer,
  ChevronRight,
  User,
  Sparkles
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function ComparePage() {
  const t = useTranslations('Compare')
  const workerIds = useSelector((state: RootState) => state.compare.workerIds)
  const dispatch = useDispatch()
  const { data: workers = [], isLoading } = useGetWorkersByIdsQuery(workerIds, {
    skip: workerIds.length === 0
  })

  const bestWorker = React.useMemo(() => {
    if (!workers || workers.length <= 1) return null

    return [...workers].sort((a, b) => {
      const scoreA = (a.rating || 0) * 10 + (a.completedOrders || 0) * 2 - (a.price || 0) / 10 + (a.verified ? 5 : 0)
      const scoreB = (b.rating || 0) * 10 + (b.completedOrders || 0) * 2 - (b.price || 0) / 10 + (b.verified ? 5 : 0)
      return scoreB - scoreA
    })[0]
  }, [workers])

  if (workerIds.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-700 mb-8 border border-slate-800">
          <Hammer size={48} />
        </div>
        <h1 className="text-3xl font-black mb-4">{t('empty_title')}</h1>
        <p className="text-slate-500 mb-8 max-w-xs">{t('empty_desc')}</p>
        <Link href="/search">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-8 h-14 font-bold">
            {t('go_to_search')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-50 pt-32 pb-20 px-6 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <Link href="/search" className="inline-flex items-center text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-2">
              <ArrowLeft className="mr-2 w-4 h-4" /> {t('back_to_search')}
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{t('title')}</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => dispatch(clearCompare())}
            className="rounded-2xl border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white h-12 px-6"
          >
            <X size={18} className="mr-2" /> {t('clear_all')}
          </Button>
        </div>

        {/* AI Recommendation */}
        {!isLoading && bestWorker && (
          <div className="mb-12 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 border border-indigo-500/20 p-6 shadow-xl dark:shadow-none">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 relative">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full border-4 border-indigo-500 flex items-center justify-center text-3xl font-black text-indigo-500 relative z-10 shadow-lg">
                  {bestWorker.user?.name?.[0]}
                </div>
                {bestWorker.verified && (
                  <div className="absolute -bottom-2 -right-2 z-20">
                    <VerifiedBadge showText={false} className="p-1 scale-125 shadow-lg" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-3">
                  <Sparkles size={12} className="animate-pulse" />
                  AI Рекомендация
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  Мы рекомендуем <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">{bestWorker.user?.name}</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
                  Искусственный интеллект проанализировал рейтинг, цену, опыт работы и наличие верификации. Учитывая все факторы, <strong>{bestWorker.user?.name}</strong> является лучшим выбором среди кандидатов для вашей задачи.
                </p>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
                <Link href={`/worker/${bestWorker.id}`}>
                  <Button className="w-full md:w-auto h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest px-8 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                    Заказать мастера
                    <ChevronRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="relative overflow-x-auto pb-8 scrollbar-hide">
            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all">
              <Table className="min-w-[800px] border-collapse">
                <TableHeader>
                  <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[200px]"></TableHead>
                    {workers.map((worker: any) => (
                      <TableHead key={worker.id} className="text-center align-top p-6">
                        <div className="relative inline-block mb-4">
                          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-indigo-500/20 flex items-center justify-center text-3xl font-black text-indigo-400 mx-auto shadow-inner">
                            {worker.user?.name?.[0]}
                          </div>
                          {worker.verified && (
                            <div className="absolute -bottom-2 -right-2">
                              <VerifiedBadge showText={false} className="p-1 scale-125" />
                            </div>
                          )}
                          <button
                            onClick={() => dispatch(removeFromCompare(worker.id))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-500 transition-all z-20"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-1">{worker.user?.name}</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">{worker.category}</p>
                        <Link href={`/worker/${worker.id}`}>
                          <Button size="sm" className="w-full rounded-3xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white border border-indigo-600/20 text-[10px] font-black uppercase tracking-widest transition-all">
                            {t('go_to_search')}
                          </Button>
                        </Link>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Price */}
                  <TableRow className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <TableCell className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-500 py-6 align-middle">
                      <div className="flex items-center gap-2"><Banknote size={16} className="text-indigo-500" /> {t('price')}</div>
                    </TableCell>
                    {workers.map((worker: any) => (
                      <TableCell key={worker.id} className="text-center py-6 align-middle">
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{worker.price} <span className="text-sm text-slate-500 font-medium">TJS/ч</span></div>
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Rating */}
                  <TableRow className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <TableCell className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-500 py-6 align-middle">
                      <div className="flex items-center gap-2"><Star size={16} className="text-yellow-500" /> {t('rating')}</div>
                    </TableCell>
                    {workers.map((worker: any) => (
                      <TableCell key={worker.id} className="text-center py-6 align-middle">
                        <div className="flex items-center justify-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
                          <Star size={24} className="text-yellow-500 fill-yellow-500" />
                          {worker.rating?.toFixed(1) || "5.0"}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Category */}
                  <TableRow className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <TableCell className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-500 py-6 align-middle">
                      <div className="flex items-center gap-2"><Briefcase size={16} className="text-cyan-500" /> {t('category')}</div>
                    </TableCell>
                    {workers.map((worker: any) => (
                      <TableCell key={worker.id} className="text-center py-6 align-middle">
                        <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{worker.category}</span>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Skills */}
                  <TableRow className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <TableCell className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-500 py-6 align-middle">
                      <div className="flex items-center gap-2"><Hammer size={16} className="text-pink-500" /> {t('skills')}</div>
                    </TableCell>
                    {workers.map((worker: any) => (
                      <TableCell key={worker.id} className="text-center py-6 align-middle">
                        <div className="flex flex-wrap justify-center gap-2">
                          {worker.skills.split(',').slice(0, 3).map((skill: string) => (
                            <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* City */}
                  <TableRow className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <TableCell className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-500 py-6 align-middle">
                      <div className="flex items-center gap-2"><MapPin size={16} className="text-green-500" /> {t('city')}</div>
                    </TableCell>
                    {workers.map((worker: any) => (
                      <TableCell key={worker.id} className="text-center py-6 align-middle">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{worker.city}</span>
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Action */}
                  <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <TableCell className="py-8"></TableCell>
                    {workers.map((worker: any) => (
                      <TableCell key={worker.id} className="text-center py-8 align-middle">
                        <Link href={`/worker/${worker.id}`}>
                          <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                            {t('order')}
                            <ChevronRight size={16} className="ml-2" />
                          </Button>
                        </Link>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
