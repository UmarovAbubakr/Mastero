"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useGetWorkerByIdQuery } from '@/src/store/api/workerApi'
import { useStartConversationMutation } from '@/src/store/api/chatApi'
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { 
  User, 
  MapPin, 
  Star, 
  Clock, 
  ShieldCheck, 
  Briefcase, 
  Hammer,
  MessageCircle,
  ChevronLeft,
  X,
  ChevronRight,
  CheckCircle,
  Calendar,
  ArrowRight,
  Heart,
  MessageSquare
} from "lucide-react"
import { Link, useRouter } from "@/src/i18n/routing"
import { toast } from "sonner"
import { Swiper, SwiperSlide } from 'swiper/react'
import { VerifiedBadge } from "@/src/components/ui/verified-badge"
import { Navigation, Pagination, Autoplay, EffectCreative } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-creative'
import { useFavorites } from '@/src/lib/useFavorites'


import { useCreateOrderMutation } from '@/src/store/api/orderApi'
import { BeforeAfterSlider } from '@/src/components/ui/before-after-slider'
import { BookingCalendar } from '@/src/components/ui/booking-calendar'
import { EndorseSkillBadge } from '@/src/components/ui/endorse-skill-badge'
import { useGetWorkerReviewsQuery } from '@/src/store/api/workerApi'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  },
};

export default function WorkerProfilePage() {
  const params = useParams()
  const id = params.id as string
  const t = useTranslations('WorkerProfile')
  const router = useRouter()
  const { data: worker, isLoading, error } = useGetWorkerByIdQuery(id)
  const { data: reviews = [] } = useGetWorkerReviewsQuery(id)
  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation()
  const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation()
  const { isFavorite, toggleFavorite, mounted } = useFavorites()

  const ts = useTranslations('Server')

  const handleContact = async () => {
    if (!worker) return
    try {
      const result = await startConversation(worker.userId).unwrap()
      router.push(`/chat?id=${result.id}`)
    } catch (err: any) {
      console.error("Failed to start chat:", err)
      const errorKey = err.data?.error || 'error_server'
      toast.error(ts(errorKey))
    }
  }

  const handleOrder = async () => {
    if (!worker) return
    try {
      await createOrder({ workerId: worker.id }).unwrap()
      toast.success(t('order_success'))
      
      try {
        const chat = await startConversation(worker.userId).unwrap()
        router.push(`/chat?id=${chat.id}`)
      } catch (chatErr) {
        console.error("Failed to start chat after order:", chatErr)
      }
    } catch (err: any) {
      toast.error(err.data?.error || t('order_error'))
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center transition-colors duration-500">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" 
      />
    </div>
  )

  if (error || !worker) return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-2xl shadow-rose-500/20">
        <X size={40} />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Мастер не найден</h2>
        <p className="text-slate-500 font-bold max-w-sm mx-auto">Возможно, профиль был удален или ссылка неверна.</p>
      </div>
      <Button 
        onClick={() => router.push('/search')}
        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-10 h-14 font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
      >
        Вернуться к поиску
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[0%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" 
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto relative z-10"
      >
        
        <motion.div variants={itemVariants}>
          <Link href="/search" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors group text-sm font-bold uppercase tracking-widest">
            <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t('back_to_search')}
          </Link>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 mb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 flex-1">
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative w-32 h-32 md:w-44 md:h-44 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl">
                <span className="text-6xl font-black text-indigo-400 select-none">{worker.user?.name?.[0]}</span>
                {worker.user?.avatar && (
                  <img src={worker.user.avatar} className="absolute inset-0 w-full h-full object-cover" alt="" />
                )}
              </div>
            </motion.div>
            
            <div className="space-y-6 flex-1 min-w-0">
              <div className="space-y-3">
                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight break-words">{worker.user?.name}</h1>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('status_free') || "Свободен"}
                  </div>
                  {worker.verified && (
                    <VerifiedBadge />
                  )}
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-8 text-slate-400 font-bold text-sm uppercase tracking-widest">
                <div className="flex items-center gap-2.5 group cursor-help">
                  <Star size={18} className="text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-white text-lg">{worker.rating?.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={18} className="text-indigo-400" />
                  <span>{worker.city}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={18} className="text-indigo-400" />
                  <span>{t('on_service')} {t('since')} 2024</span>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 w-full lg:w-auto">
            <Button 
              onClick={handleOrder}
              disabled={isOrdering}
              className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-500 text-white h-16 px-10 rounded-2xl shadow-2xl shadow-indigo-600/30 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle size={20} className="mr-3" /> {t('order_master')}
            </Button>
            <div className="flex gap-4 flex-1 lg:flex-none">
              <Button 
                onClick={handleContact}
                disabled={isStartingChat}
                variant="outline"
                className="flex-1 h-16 px-8 rounded-2xl border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
              >
                <MessageCircle size={20} className="mr-3" /> {t('contact')}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!worker) return
                  const favorite = {
                    id: worker.id,
                    name: worker.user?.name || t('name_unknown'),
                    city: worker.city,
                    category: worker.skills?.split(',')?.[0],
                    price: worker.price ? `${worker.price} TJS` : undefined,
                  }
                  const favoriteAlready = isFavorite(worker.id)
                  toggleFavorite(favorite)
                  toast.success(favoriteAlready ? t('favorite_removed') : t('favorite_added'))
                }}
                variant={mounted && isFavorite(worker?.id ?? '') ? 'secondary' : 'outline'}
                className="flex-1 h-16 px-8 rounded-2xl border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 group"
              >
                <Heart size={20} className={cn(mounted && isFavorite(worker?.id ?? '') ? 'fill-rose-500 text-rose-500' : 'text-slate-400 group-hover:text-rose-500 transition-colors')} />
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
            <Card className="bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none rounded-[2.5rem] overflow-hidden transition-all">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1 text-center md:text-left">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{t('rate')}</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {worker.rating?.toFixed(1) || "5.0"}
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-3xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('verification')}</div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{worker.verified ? t('verified_ok') : t('verified_no')}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="pt-4">
              <BookingCalendar 
                workerId={worker.id}
                onBook={(slotId) => {
                  toast.success(t('booking_sent'))
                  handleOrder()
                }} 
                isBooking={isOrdering}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-12">
            <Card className="bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none rounded-[2.5rem] transition-all">
              <CardContent className="p-6 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.3em]">
                    <Briefcase size={18} />
                    {t('about')}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic">
                    "{worker.about || t('no_info')}"
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.3em]">
                    <Hammer size={18} />
                    {t('skills')}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {worker.skills?.split(',').map((skill: string) => (
                      <EndorseSkillBadge key={skill} skill={skill} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Briefcase className="text-indigo-400" />
                    {t('works')}
                  </h2>
                </div>

              {worker.works && worker.works.length > 0 ? (
                <div className="relative group/swiper max-w-[450px] mx-auto">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectCreative]}
                    effect={'creative'}
                    creativeEffect={{
                      prev: {
                        shadow: true,
                        translate: ['-20%', 0, -1],
                        opacity: 0,
                      },
                      next: {
                        translate: ['100%', 0, 0],
                      },
                    }}
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView={1}
                    loop={worker.works.length >= 2}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
                    navigation={{
                      nextEl: '.swiper-button-next-custom',
                      prevEl: '.swiper-button-prev-custom',
                    }}
                    className="portfolio-swiper !pb-16 w-full"
                  >
                    {worker.works.map((work: any) => (
                      <SwiperSlide key={work.id} className="w-full flex justify-center">
                        {work.isBeforeAfter ? (
                          <div className="w-full h-full flex flex-col gap-6">
                            <BeforeAfterSlider 
                              beforeImage={work.beforeImageUrl} 
                              afterImage={work.afterImageUrl} 
                            />
                            <h4 className="text-slate-900 dark:text-white font-black text-xl text-center px-4">{work.title}</h4>
                          </div>
                        ) : (
                          <Card className="group relative overflow-hidden bg-slate-900 border-slate-800 rounded-[2.5rem] aspect-[4/3] cursor-pointer shadow-2xl transition-all duration-500 hover:border-indigo-500/50 w-full">
                            <img 
                              src={work.imageUrl || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800"} 
                              alt={work.title}
                              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                            <div className="absolute bottom-0 left-0 p-6 w-full translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                              <div className="p-6">
                                <h3 className="font-bold text-lg mb-2 text-white">{work.title}</h3>
                                <button className="text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                                  {t('view_project')}
                                  <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                                </button>
                              </div>
                            </div>
                          </Card>
                        )}
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-20 swiper-button-prev-custom w-14 h-14 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 flex items-center justify-center text-white cursor-pointer hover:bg-indigo-600 hover:border-indigo-500 transition-all opacity-0 group-hover/swiper:opacity-100 scale-90 group-hover/swiper:scale-100 shadow-2xl">
                    <ChevronLeft size={28} />
                  </div>
                  <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-20 swiper-button-next-custom w-14 h-14 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 flex items-center justify-center text-white cursor-pointer hover:bg-indigo-600 hover:border-indigo-500 transition-all opacity-0 group-hover/swiper:opacity-100 scale-90 group-hover/swiper:scale-100 shadow-2xl">
                    <ChevronRight size={28} />
                  </div>
                  
                  <div className="swiper-pagination-custom flex justify-center gap-2 mt-4" />
                </div>
              ) : (
                <div className="p-16 rounded-[2.5rem] bg-white dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center gap-6 shadow-sm dark:shadow-none">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-700">
                    <Hammer size={32} />
                  </div>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">{t('no_works')}</p>
                </div>
              )}
            </div>

            {/* Reviews Section Preview */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('reviews')}</h2>
                <Link 
                  href={`/worker/${worker.id}/reviews`}
                  className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                >
                  Смотреть все
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <Link href={`/worker/${worker.id}/reviews`} className="block group">
                <div className="flex flex-col md:flex-row items-center gap-10 bg-white dark:bg-slate-900/40 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 group">
                  <div className="text-center px-8 md:border-r border-slate-100 dark:border-slate-800/50">
                    <div className="text-6xl font-black text-slate-900 dark:text-white leading-none mb-2">{worker.rating?.toFixed(1) || "5.0"}</div>
                    <div className="flex items-center gap-1 justify-center mb-3">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} className={s <= Math.round(worker.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-800'} />
                      ))}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {reviews.length} {t('reviews_count')}
                    </div>
                  </div>
                  
                  <div className="space-y-3 flex-1 w-full px-4">
                    {[5,4,3,2,1].map(star => {
                      const count = reviews.filter((r: any) => Math.round(r.rating) === star).length
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : star === 5 ? 100 : 0
                      return (
                        <div key={star} className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-400 w-4">{star}</span>
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.4)]" 
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 w-8 text-right">{Math.round(percentage)}%</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                    <MessageSquare size={24} className="mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">Читать отзывы</span>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  )
}
