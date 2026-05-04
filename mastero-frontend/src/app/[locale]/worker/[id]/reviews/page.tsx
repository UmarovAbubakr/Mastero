"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useGetWorkerByIdQuery, useGetWorkerReviewsQuery } from '@/src/store/api/workerApi'
import { Link } from "@/src/i18n/routing"
import { ChevronLeft, Star, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"

export default function WorkerReviewsPage() {
  const params = useParams()
  const id = params.id as string
  const t = useTranslations('WorkerProfile')
  const { data: worker } = useGetWorkerByIdQuery(id)
  const { data: reviews = [] } = useGetWorkerReviewsQuery(id)

  if (!worker) return null

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative pt-16 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
            <div className="space-y-4">
              <Link 
                href={`/worker/${id}`} 
                className="inline-flex items-center text-slate-400 hover:text-indigo-500 transition-all group px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5"
              >
                <ChevronLeft className="mr-1.5 h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('back_to_search')}</span>
              </Link>
              
              <div className="space-y-1">
                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter"
                >
                  {t('reviews')}
                </motion.h1>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-px w-6 bg-indigo-500/50" />
                  <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">
                    {worker.user?.name}
                  </p>
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full lg:w-auto"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative flex items-center gap-6 bg-white dark:bg-slate-900/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-xl">
                  <div className="text-center px-4 border-r border-slate-100 dark:border-white/10">
                    <div className="text-4xl font-black text-slate-900 dark:text-white leading-none mb-1.5">{worker.rating?.toFixed(1)}</div>
                    <div className="flex items-center gap-1 justify-center mb-1.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={10} className={s <= Math.round(worker.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-800'} />
                      ))}
                    </div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{reviews.length} {t('reviews_count')}</div>
                  </div>
                  <div className="space-y-2 flex-1 min-w-[180px]">
                    {[5,4,3,2,1].map(star => {
                      const count = reviews.filter((r: any) => Math.round(r.rating) === star).length
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-slate-400 w-2.5">{star}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1.2, ease: "circOut" }}
                              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" 
                            />
                          </div>
                          <span className="text-[9px] font-black text-slate-500 w-7 text-right">{Math.round(percentage)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Table Section */}
          {reviews.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/70 dark:bg-slate-900/40 border border-slate-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl backdrop-blur-3xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.03]">
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('client_col')}</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('rating_col')}</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('date_col')}</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('feedback_col')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review: any, idx: number) => (
                        <motion.tr 
                          key={review.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + idx * 0.04 }}
                          className="group border-b border-slate-100 last:border-0 dark:border-white/5 hover:bg-indigo-500/[0.02] transition-all duration-300"
                        >
                          {/* Client Info */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="relative group/avatar">
                                <div className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-indigo-500 font-black text-base border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                                  {review.client?.avatar ? (
                                    <img src={review.client.avatar} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <span>{review.client?.name?.[0]}</span>
                                  )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg" />
                              </div>
                              <div className="font-black text-slate-900 dark:text-white text-sm tracking-tight group-hover:text-indigo-500 transition-colors">
                                {review.client?.name}
                              </div>
                            </div>
                          </td>

                          {/* Rating */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-xl border border-yellow-400/20 w-fit">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-black text-yellow-600 dark:text-yellow-400">{review.rating?.toFixed(1)}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-8 py-5">
                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-80">
                              {new Date(review.updatedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>

                          {/* Comment */}
                          <td className="px-8 py-5 max-w-md">
                            <p className="text-slate-600 dark:text-slate-300 text-[13px] leading-relaxed italic group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                              "{review.comment}"
                            </p>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="p-24 rounded-[4rem] bg-white dark:bg-slate-900/20 border-2 border-dashed border-slate-100 dark:border-white/5 text-center flex flex-col items-center gap-8 shadow-inner">
              <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-2xl">
                <MessageSquare size={48} className="text-slate-200 dark:text-slate-800" />
              </div>
              <div className="space-y-3">
                <p className="text-slate-900 dark:text-white font-black text-2xl">{t('no_reviews')}</p>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs opacity-60">Будьте первым, кто оставит отзыв!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
