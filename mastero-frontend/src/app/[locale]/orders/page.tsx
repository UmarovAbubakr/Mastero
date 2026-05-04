'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/src/i18n/routing'
import { useGetMeQuery } from '@/src/store/api/authApi'
import { useGetWorkerOrdersQuery, useGetClientOrdersQuery, useUpdateOrderStatusMutation } from '@/src/store/api/orderApi'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { ReviewModal } from '@/src/components/ui/review-modal'
import { Clock, MessageCircle, Star, Calendar, User, CheckCircle2, XCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0
  }
}

export default function OrdersPage() {
  const t = useTranslations('OrdersPage')
  const router = useRouter()
  const { data: user, isLoading: isUserLoading } = useGetMeQuery(undefined)
  const [reviewOrder, setReviewOrder] = useState<{ id: string; workerName: string } | null>(null)

  const { data: workerOrders, isLoading: isWorkerLoading } = useGetWorkerOrdersQuery(undefined, {
    skip: user?.role !== 'worker',
  })

  const { data: clientOrders, isLoading: isClientLoading, refetch } = useGetClientOrdersQuery(undefined, {
    skip: user?.role === 'worker',
  })

  const [updateStatus] = useUpdateOrderStatusMutation()

  const orders = user?.role === 'worker' ? workerOrders : clientOrders
  const isLoading = isUserLoading || (user?.role === 'worker' ? isWorkerLoading : isClientLoading)

  const statusLabel = useMemo(
    () => (status: string) => {
      switch (status) {
        case 'pending': return t('status_pending')
        case 'accepted': return t('status_accepted')
        case 'completed': return t('status_completed')
        case 'declined': return t('status_declined')
        default: return status
      }
    },
    [t]
  )

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'accepted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'declined': return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      default: return 'bg-slate-500/10 text-slate-500'
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-50 pt-32 pb-20 px-6 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-indigo-500 font-black uppercase text-[10px] tracking-[0.2em]"
            >
              <Clock size={14} /> {t('title')}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tight"
            >
              {t('title')}
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-4 p-1.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm"
          >
            <div className="px-6 py-2.5 text-center">
              <div className="text-xl font-black">{orders?.length || 0}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Всего</div>
            </div>
            <div className="w-px bg-slate-100 dark:bg-white/5 my-1" />
            <div className="px-6 py-2.5 text-center">
              <div className="text-xl font-black text-indigo-500">{orders?.filter((o:any) => o.status === 'pending').length || 0}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Новых</div>
            </div>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 rounded-3xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 animate-pulse" />
            ))}
          </div>
        ) : orders?.length ? (
          <div className="relative overflow-x-auto rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Статус</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Дата</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{user?.role === 'worker' ? 'Клиент' : 'Мастер'}</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Отзыв</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Действия</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {orders.map((order: any) => {
                  const targetName = user?.role === 'worker' ? order.client?.name : order.worker?.user?.name
                  const chatUserId = user?.role === 'worker' ? order.clientId : order.worker?.userId
                  const canReview = user?.role === 'client' && order.status === 'completed' && !order.rating
                  
                  return (
                    <motion.tr 
                      key={order.id} 
                      variants={rowVariants}
                      className="group border-b border-slate-100 dark:border-white/5 hover:bg-indigo-500/[0.02] transition-colors"
                    >
                      {/* Status */}
                      <td className="px-8 py-6">
                        <Badge className={cn(
                          'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shadow-sm',
                          getStatusStyles(order.status)
                        )}>
                          {statusLabel(order.status)}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-sm border border-indigo-500/10">
                            {targetName?.[0]}
                          </div>
                          <div className="font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                            {targetName || t('unknown_customer')}
                          </div>
                        </div>
                      </td>

                      {/* Feedback/Rating */}
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          {order.rating ? (
                            <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1.5 rounded-xl border border-yellow-400/20">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-black text-yellow-600">{order.rating?.toFixed(1)}</span>
                            </div>
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          {user?.role === 'worker' ? (
                            <div className="flex gap-2">
                              {order.status === 'pending' && (
                                <>
                                  <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest h-9 px-4" onClick={() => handleStatusUpdate(order.id, 'accepted')}>
                                    OK
                                  </Button>
                                  <Button variant="ghost" className="rounded-xl text-rose-500 hover:bg-rose-500/10 font-black text-[10px] uppercase tracking-widest h-9 px-4" onClick={() => handleStatusUpdate(order.id, 'declined')}>
                                    NO
                                  </Button>
                                </>
                              )}
                              {order.status === 'accepted' && (
                                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest h-9 px-4" onClick={() => handleStatusUpdate(order.id, 'completed')}>
                                  {t('complete')}
                                </Button>
                              )}
                            </div>
                          ) : canReview ? (
                            <Button
                              onClick={() => setReviewOrder({ id: order.id, workerName: targetName || 'Мастер' })}
                              className="rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black text-[10px] uppercase tracking-widest h-9 px-4 shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
                            >
                              Оценить
                            </Button>
                          ) : null}
                          
                          <Button 
                            variant="ghost"
                            className="w-9 h-9 p-0 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 transition-all" 
                            onClick={() => router.push(`/chat?userId=${chatUserId}`)}
                          >
                            <MessageCircle size={16} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/5 p-20 text-center"
          >
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mx-auto mb-8">
              <Clock size={40} />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">{t('no_orders')}</h2>
            <p className="max-w-md mx-auto text-slate-500 dark:text-slate-400 font-medium">
              {t('orders_description')}
            </p>
          </motion.div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewOrder && (
          <ReviewModal
            orderId={reviewOrder.id}
            workerName={reviewOrder.workerName}
            onClose={() => setReviewOrder(null)}
            onSuccess={() => {
              refetch()
              setReviewOrder(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


