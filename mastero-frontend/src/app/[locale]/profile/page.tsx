"use client"

import React, { useState, useRef } from 'react'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations } from 'next-intl'
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { ReviewModal } from '@/src/components/ui/review-modal'
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import {
  User as UserIcon,
  Settings,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  Briefcase,
  Hammer,
  LogOut,
  Camera,
  Plus,
  Trash2,
  UploadCloud,
  ChevronRight,
  Zap,
  Home,
  Laptop,
  Smartphone,
  Tablet,
  Paintbrush,
  Hammer as HammerIcon,
  Sofa,
  Layout,
  Wrench,
  Check,
  X,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Send
} from "lucide-react"
import { useGetMeQuery, useUpdateProfileMutation } from '@/src/store/api/authApi'
import {
  useUpdateWorkerProfileMutation,
  useAddWorkMutation,
  useDeleteWorkMutation,
  useUploadImageMutation
} from '@/src/store/api/workerApi'
import {
  useGetWorkerOrdersQuery,
  useGetClientOrdersQuery,
  useUpdateOrderStatusMutation,
  useRateOrderMutation
} from '@/src/store/api/orderApi'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
  { id: 'plumber', icon: Wrench, label: 'Сантехник' },
  { id: 'electrician', icon: Zap, label: 'Электрик' },
  { id: 'smart_home', icon: Home, label: 'Умный дом' },
  { id: 'repair_house', icon: HammerIcon, label: 'Ремонт дома' },
  { id: 'renovator', icon: Paintbrush, label: 'Ремонтник' },
  { id: 'phone_repair', icon: Smartphone, label: 'Ремонт телефонов' },
  { id: 'computer_repair', icon: Laptop, label: 'Компьютеры' },
  { id: 'tablet_repair', icon: Tablet, label: 'Планшеты' },
  { id: 'designer', icon: Layout, label: 'Дизайнер дома' },
  { id: 'furniture', icon: Sofa, label: 'Мебельный мастер' },
]

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

export default function ProfilePage() {
  const t = useTranslations('Profile')
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [currentTab, setCurrentTab] = useState<'profile' | 'orders'>('profile')

  // Queries & Mutations
  const { data: user, isLoading: isUserLoading } = useGetMeQuery(undefined)
  const [updateProfile] = useUpdateProfileMutation()
  const [updateWorker] = useUpdateWorkerProfileMutation()
  const [addWork] = useAddWorkMutation()
  const [deleteWork] = useDeleteWorkMutation()
  const [uploadImage] = useUploadImageMutation()
  const [isUploading, setIsUploading] = useState(false)

  const { data: workerOrders } = useGetWorkerOrdersQuery(undefined, {
    skip: user?.role !== 'worker'
  })
  const { data: clientOrders } = useGetClientOrdersQuery(undefined, {
    skip: user?.role === 'worker'
  })

  const [updateStatus] = useUpdateOrderStatusMutation()
  const [rateOrder] = useRateOrderMutation()

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    avatar: ''
  })

  const [workerData, setWorkerData] = useState({
    skills: [] as string[],
    category: '',
    about: '',
    price: '',
    city: ''
  })

  const [customSkill, setCustomSkill] = useState('')
  const [newWork, setNewWork] = useState({ title: '', imageUrl: '' })
  const [showAddWork, setShowAddWork] = useState(false)
  const [ratingData, setRatingData] = useState<{ id: string, rating: number, comment: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'accepted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'declined': return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      default: return 'bg-slate-500/10 text-slate-500'
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const result = await uploadImage(file).unwrap()
      setNewWork({ ...newWork, imageUrl: result.imageUrl })
      toast.success("Фото загружено")
    } catch (err) {
      toast.error("Ошибка при загрузке")
    } finally {
      setIsUploading(false)
    }
  }

  const startEditing = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    })
    if (user?.worker) {
      setWorkerData({
        skills: user.worker.skills ? user.worker.skills.split(',').map((s: string) => s.trim()) : [],
        category: user.worker.category || 'other',
        about: user.worker.about || '',
        price: user.worker.price?.toString() || '',
        city: user.worker.city || ''
      })
    }
    setIsEditing(true)
  }

  const toggleSkill = (skill: string) => {
    if (workerData.skills.includes(skill)) {
      setWorkerData({ ...workerData, skills: workerData.skills.filter(s => s !== skill) })
    } else {
      setWorkerData({ ...workerData, skills: [...workerData.skills, skill] })
    }
  }

  const addCustomSkill = () => {
    if (customSkill && !workerData.skills.includes(customSkill)) {
      setWorkerData({ ...workerData, skills: [...workerData.skills, customSkill] })
      setCustomSkill('')
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData).unwrap()
      if (user?.role === 'worker') {
        await updateWorker({
          ...workerData,
          skills: workerData.skills.join(', ')
        }).unwrap()
      }
      setIsEditing(false)
      toast.success("Профиль обновлен")
    } catch (err) {
      toast.error("Ошибка при сохранении")
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap()
      toast.success(`Статус заказа: ${status}`)
    } catch (err) {
      toast.error("Ошибка при обновлении статуса")
    }
  }

  const handleRateOrder = async () => {
    if (!ratingData) return
    try {
      await rateOrder(ratingData).unwrap()
      setRatingData(null)
      toast.success("Спасибо за оценку!")
    } catch (err) {
      toast.error("Ошибка при отправке оценки")
    }
  }

  const handleAddWork = async () => {
    if (!newWork.title || !newWork.imageUrl) return
    try {
      await addWork(newWork).unwrap()
      setNewWork({ title: '', imageUrl: '' })
      setShowAddWork(false)
      toast.success("Работа добавлена")
    } catch (err) {
      toast.error("Ошибка при добавлении")
    }
  }

  const handleDeleteWork = async (id: string) => {
    try {
      await deleteWork(id).unwrap()
      toast.success("Работа удалена")
    } catch (err) {
      toast.error("Ошибка при удалении")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  if (isUserLoading) return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center transition-colors duration-500">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const orders = user?.role === 'worker' ? workerOrders : clientOrders

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-50 pt-32 pb-20 px-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[3rem] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative w-32 h-32 md:w-44 md:h-44 bg-slate-900 border border-slate-800 rounded-[3rem] flex items-center justify-center overflow-hidden">
              {(isEditing ? formData.avatar : user?.avatar) ? (
                <img src={isEditing ? formData.avatar : user?.avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <UserIcon size={64} className="text-slate-700" />
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap items-center gap-6">
              {isEditing ? (
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="text-4xl font-black bg-white/5 border-white/10 h-16 w-full md:w-[400px] rounded-2xl" />
              ) : (
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">{user?.name}</h1>
              )}
              {user?.role === 'worker' && <Badge className="bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">PRO Мастер</Badge>}
            </div>
            {user?.role === 'worker' && (
              <div className="flex flex-wrap gap-6 text-slate-400 font-bold text-sm">
                <div className="flex items-center gap-2.5"><MapPin size={20} className="text-indigo-500" /> {user?.worker?.city || "Душанбе"}</div>
                <div className="flex items-center gap-2.5"><Star size={20} className="text-yellow-500 fill-yellow-500" /> {user?.worker?.rating ? user.worker.rating.toFixed(1) : "5.0"}</div>
                <div className="flex items-center gap-2.5"><ShieldCheck size={20} className="text-green-500" /> Верифицирован</div>
              </div>
            )}
          </div>

          <div className="flex gap-6 w-full md:w-auto">
            {isEditing ? (
              <>
                <Button onClick={handleSaveProfile} className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black"><Check className="mr-2" /> Сохранить</Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5"><X /></Button>
              </>
            ) : (
              <>
                <Button onClick={startEditing} variant="outline" className="flex-1 md:flex-none border-white/10 bg-white/5 hover:bg-white/10 h-14 px-8 rounded-2xl font-bold"><Settings size={20} className="mr-2" /> Редактировать</Button>
                <Button variant="destructive" size="icon" onClick={handleLogout} className="h-14 w-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"><LogOut size={20} /></Button>
              </>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-12 bg-white dark:bg-white/5 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
          <button onClick={() => setCurrentTab('profile')} className={cn("px-8 py-3 rounded-3xl text-xs font-black uppercase tracking-widest transition-all", currentTab === 'profile' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300")}>Профиль</button>
          <button onClick={() => setCurrentTab('orders')} className={cn("px-8 py-3 rounded-3xl text-xs font-black uppercase tracking-widest transition-all relative", currentTab === 'orders' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300")}>
            Заказы
            {orders?.some((o: any) => o.status === 'pending') && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#020617]" />}
          </button>
        </div>

        {currentTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-1 space-y-8">
              <Card className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none rounded-[3rem] overflow-hidden backdrop-blur-xl transition-all">
                <CardContent className="p-6 space-y-8">
                  <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest">Информация</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Телефон</label>
                      {isEditing ? <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-white/10 border-none rounded-3xl" /> : <p className="font-bold text-white">{user?.phone || "Не указан"}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">E-mail</label>
                      <p className="font-bold text-white">{user?.email}</p>
                    </div>
                    {user?.role === 'worker' && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Стоимость</label>
                        {isEditing ? <Input type="number" value={workerData.price} onChange={e => setWorkerData({ ...workerData, price: e.target.value })} className="bg-white/10 border-none rounded-3xl" /> : <p className="font-bold text-white"><span className='text-[25px]'>{user?.worker?.price} </span>TJS/час</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none rounded-[3rem] overflow-hidden backdrop-blur-xl transition-all">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-xs font-black text-[#229ED9] uppercase tracking-widest flex items-center gap-2">
                    <Send size={14} /> Telegram
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">Уведомления в Telegram</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Подключите бота, чтобы мгновенно получать уведомления о новых заказах и сообщениях.
                        </p>
                      </div>
                      {user?.telegramId ? (
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-2xl w-fit text-xs font-bold border border-emerald-500/10">
                          <CheckCircle2 size={14} /> Подключено
                        </div>
                      ) : (
                        <Button 
                          onClick={() => window.open(`https://t.me/mastero_tj_bot?start=${user?.id}`, '_blank')}
                          className="w-full bg-[#229ED9] hover:bg-[#229ED9]/90 text-white rounded-2xl h-12 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Подключить Telegram
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-2xl rounded-[3rem] backdrop-blur-xl transition-all">
                <CardContent className="p-6 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]"><Briefcase size={18} /> О себе</div>
                    {isEditing ? (
                      <Textarea value={user?.role === 'worker' ? workerData.about : formData.bio} onChange={e => user?.role === 'worker' ? setWorkerData({ ...workerData, about: e.target.value }) : setFormData({ ...formData, bio: e.target.value })} className="bg-slate-50 dark:bg-white/10 border-none rounded-[1.5rem] p-6 text-slate-900 dark:text-white min-h-[150px]" />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-200 text-xl leading-relaxed font-medium">{user?.role === 'worker' ? user?.worker?.about : user?.bio || "Расскажите о себе..."}</p>
                    )}
                  </div>
                  {user?.role === 'worker' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]"><Hammer size={18} /> Навыки</div>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {workerData.skills.map(s => <Badge key={s} className="bg-indigo-500 text-white px-3 py-1 rounded-lg flex items-center gap-2">{s} <button onClick={() => toggleSkill(s)}>×</button></Badge>)}
                          </div>
                          <div className="flex gap-2">
                            <Input value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomSkill()} placeholder="Добавить навык..." className="bg-white/10 border-none rounded-3xl" />
                            <Button onClick={addCustomSkill} variant="secondary">OK</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {user?.worker?.skills.split(',').map((skill: string) => <Badge key={skill} className="bg-white/5 hover:bg-indigo-500/20 text-slate-300 border-white/5 px-6 py-3 rounded-2xl text-sm transition-all font-bold">{skill.trim()}</Badge>)}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {user?.role === 'worker' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center px-4">
                    <h2 className="text-3xl font-black tracking-tight">Портфолио</h2>
                    <Button onClick={() => setShowAddWork(!showAddWork)} className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-2xl h-12 px-6"><Plus className="mr-2" /> Добавить работу</Button>
                  </div>
                  {showAddWork && (
                    <Card className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-6 space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-2">{t('work_title_placeholder')}</label>
                        <Input placeholder={t('work_title_placeholder')} value={newWork.title} onChange={e => setNewWork({ ...newWork, title: e.target.value })} className="bg-white/10 border-none h-14 rounded-3xl" />
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-2">{t('portfolio')}</label>
                        <div className="flex flex-col sm:flex-row gap-6">
                          <Input placeholder={t('work_url_placeholder')} value={newWork.imageUrl} onChange={e => setNewWork({ ...newWork, imageUrl: e.target.value })} className="bg-white/10 border-none h-14 rounded-3xl flex-1" />
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs font-bold px-2">{t('or')}</span>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleFileUpload} 
                              accept="image/*" 
                              className="hidden" 
                            />
                            <Button 
                              type="button"
                              disabled={isUploading}
                              onClick={() => fileInputRef.current?.click()}
                              className="h-14 px-6 rounded-3xl bg-slate-800 hover:bg-slate-700 text-white font-bold whitespace-nowrap"
                            >
                              {isUploading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              ) : (
                                <><UploadCloud className="mr-2 h-5 w-5" /> {t('upload_from_pc')}</>
                              )}
                            </Button>
                          </div>
                        </div>
                        {newWork.imageUrl && (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 mt-2">
                            <img src={newWork.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleAddWork} disabled={!newWork.title || !newWork.imageUrl || isUploading} className="bg-indigo-600 hover:bg-indigo-500 text-white h-14 rounded-3xl flex-1 font-bold text-sm uppercase tracking-widest">
                          {t('publish')}
                        </Button>
                        <Button onClick={() => setShowAddWork(false)} variant="ghost" className="h-14 rounded-3xl font-bold">
                          {t('cancel')}
                        </Button>
                      </div>
                    </Card>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user?.worker?.works?.map((work: any) => (
                      <Card key={work.id} className="group relative overflow-hidden bg-slate-900 border-slate-800 rounded-[2rem] aspect-[4/3]">
                        <img src={work.imageUrl} alt={work.title} className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex justify-between items-end">
                          <h4 className="text-white font-bold">{work.title}</h4>
                          <Button onClick={() => handleDeleteWork(work.id)} size="icon" variant="destructive" className="rounded-3xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {orders?.length === 0 ? (
              <div className="py-20 bg-white/5 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-500 gap-6">
                <Clock size={48} className="opacity-20" />
                <p className="font-bold">У вас пока нет заказов</p>
              </div>
            ) : (
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
                              {order.status === 'pending' ? 'Ожидает' : order.status === 'accepted' ? 'В работе' : order.status === 'completed' ? 'Завершен' : 'Отклонен'}
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
                                {targetName || "Неизвестно"}
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
                                      Завершить
                                    </Button>
                                  )}
                                </div>
                              ) : canReview ? (
                                <Button
                                  onClick={() => setRatingData({ id: order.id, rating: 5, comment: targetName || 'Мастер' })}
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
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {ratingData && (
          <ReviewModal
            orderId={ratingData.id}
            workerName={ratingData.comment}
            onClose={() => setRatingData(null)}
            onSuccess={() => {
              setRatingData(null)
              window.location.reload()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}