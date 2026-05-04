"use client";

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from "@/src/i18n/routing"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Badge } from "@/src/components/ui/badge"
import { Hammer, Briefcase, Banknote, FileText, CheckCircle, Sparkles, ArrowRight, Wrench, Zap, Home, Laptop, Smartphone, Tablet, Paintbrush, Sofa, Layout, MapPin, Star } from "lucide-react"
import { useRegisterWorkerMutation } from "@/src/store/api/workerApi"
import { useGetMeQuery } from "@/src/store/api/authApi"
import { toast } from "sonner"

export default function RegisterWorkerPage() {
  const t = useTranslations('WorkerReg')
  const tSearch = useTranslations('Search')
  const router = useRouter()
  const [registerWorker, { isLoading }] = useRegisterWorkerMutation()
  const { data: user } = useGetMeQuery({})

  useEffect(() => {
    if (user?.role === 'worker') {
      router.push('/')
    }
  }, [user, router])

  const [skills, setSkills] = useState<string[]>([])
  const [about, setAbout] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [customSkill, setCustomSkill] = useState('')
  const [certificateUrl, setCertificateUrl] = useState('')
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)
  const [completedOrders, setCompletedOrders] = useState('0')
  const [totalEarnings, setTotalEarnings] = useState('0')

  const CATEGORIES = [
    { id: 'plumber', icon: Wrench, label: tSearch('cat_plumber') },
    { id: 'electrician', icon: Zap, label: tSearch('cat_electrician') },
    { id: 'smart_home', icon: Home, label: tSearch('cat_smart_home') },
    { id: 'repair_house', icon: Hammer, label: tSearch('cat_repair_house') },
    { id: 'renovator', icon: Paintbrush, label: tSearch('cat_renovator') },
    { id: 'phone_repair', icon: Smartphone, label: tSearch('cat_phone_repair') },
    { id: 'computer_repair', icon: Laptop, label: tSearch('cat_computer_repair') },
    { id: 'tablet_repair', icon: Tablet, label: tSearch('cat_tablet_repair') },
    { id: 'designer', icon: Layout, label: tSearch('cat_designer') },
    { id: 'furniture', icon: Sofa, label: tSearch('cat_furniture') },
  ]

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const addCustomSkill = () => {
    if (customSkill && !skills.includes(customSkill)) {
      setSkills([...skills, customSkill])
      setCustomSkill('')
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        toast.success(t('location_success'))
      }, () => {
        toast.error(t('error_fill_fields'))
      })
    }
  }

  const handleSubmit = async () => {
    if (skills.length === 0 || !price || !category) {
      toast.error(t('error_fill_fields'))
      return
    }
    try {
      await registerWorker({ 
        skills: skills.join(', '), 
        about, 
        price, 
        category,
        certificateUrl,
        latitude: coords?.lat,
        longitude: coords?.lng,
        completedOrders: parseInt(completedOrders) || 0,
        totalEarnings: parseInt(totalEarnings) || 0
      }).unwrap()
      toast.success(t('success_created'))
      router.push('/')
    } catch (err: any) {
      toast.error(err.data?.error || t('error_create'))
    }
  }

  const selectedCategory = CATEGORIES.find(c => c.id === category)

  return (
    <div className="min-h-screen dark:bg-[#020617] text-slate-900 dark:text-slate-50 text-foreground pt-32 pb-20 px-6 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="flex-1 max-w-2xl">
            <Badge className="mb-6 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} className="mr-2 inline" />
              {t('steps')}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-xl font-medium max-w-lg leading-relaxed italic">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <div className="group relative">
              <div className="absolute -inset-4 bg-indigo-500/20 rounded-[2.5rem] blur-2xl group-hover:bg-indigo-500/30 transition-all" />
              <div className="relative w-32 h-32 bg-card border border-border rounded-[2.5rem] flex items-center justify-center text-indigo-400 rotate-6 group-hover:rotate-360 transition-all duration-600 shadow-2xl">
                <Hammer size={56} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card/40 backdrop-blur-3xl border border-border p-6 rounded-[3rem] shadow-2xl">
              
              <div className="space-y-10">
                <div className="space-y-6">
                  <label className="flex items-center gap-3 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] ml-2">
                    <Sparkles size={18} />
                    {t('cat_title')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`
                          flex flex-col items-center justify-center gap-2 p-3 rounded-3xl border rounded-[10px] transition-all duration-300
                          ${category === cat.id 
                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg scale-105' 
                            : 'bg-muted/50 border-border text-muted-foreground hover:border-indigo-500/50 hover:text-foreground hover:scale-105'
                          }
                        `}
                      >
                        <cat.icon size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-tight text-center leading-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] ml-2">
                    <Briefcase size={18} />
                    {t('skills_title')}
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-3 py-1.5 rounded-3xl flex items-center gap-2 hover:bg-indigo-500/30 transition-all">
                        {skill}
                        <button onClick={() => toggleSkill(skill)} className="hover:text-red-400 ml-1 text-xs">×</button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input 
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                      placeholder={t('skills_placeholder')}
                      className="h-12 rounded-[10px] bg-muted/50 border-border focus:border-indigo-500/50 focus:ring-0 px-4 transition-all flex-1"
                    />
                    <Button onClick={addCustomSkill} variant="outline" className="h-12 px-5 rounded-[10px] bg-muted/50 hover:bg-muted border-border sm:w-auto w-full">
                      {t('add')}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {[t('skill_repair'), t('skill_install'), t('skill_replace'), t('skill_consult'), t('skill_home_visit'), t('skill_urgent')].map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${skills.includes(s) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-border text-muted-foreground hover:border-muted-foreground/50'}`}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] ml-2">
                    <FileText size={18} />
                    {t('about_label')}
                  </label>
                  <Textarea 
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder={t('about_placeholder')}
                    className="min-h-[180px] rounded-[10px] bg-muted/50 border-border focus:border-indigo-500/50 focus:ring-0 px-5 py-4 resize-none transition-all"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="flex items-center gap-3 text-yellow-500 font-bold text-xs uppercase tracking-[0.2em] ml-2">
                    <CheckCircle size={18} />
                    {t('verification_title')}
                  </label>
                  <p className="text-muted-foreground text-xs ml-2">
                    {t('verification_desc')}
                  </p>
                  <Input 
                    value={certificateUrl}
                    onChange={(e) => setCertificateUrl(e.target.value)}
                    placeholder={t('verification_placeholder')}
                    className="h-12 rounded-[10px] bg-muted/50 border-border focus:border-yellow-500/50 focus:ring-0 px-4 transition-all"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="flex items-center gap-3 text-green-500 font-bold text-xs uppercase tracking-[0.2em] ml-2">
                    <CheckCircle size={18} />
                    {t('stats_title')}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-muted-foreground font-medium">{t('completed_orders')}</label>
                      <Input 
                        type="number"
                        min="0"
                        value={completedOrders}
                        onChange={(e) => setCompletedOrders(e.target.value)}
                        placeholder="0"
                        className="h-12 rounded-[10px] bg-muted/50 border-border focus:border-green-500/50 focus:ring-0 px-4 transition-all w-full"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-muted-foreground font-medium">{t('total_earnings')} (TJS)</label>
                      <Input 
                        type="number"
                        min="0"
                        value={totalEarnings}
                        onChange={(e) => setTotalEarnings(e.target.value)}
                        placeholder="0"
                        className="h-12 rounded-[10px] bg-muted/50 border-border focus:border-green-500/50 focus:ring-0 px-4 transition-all w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="flex items-center gap-3 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] ml-2">
                    <MapPin size={18} />
                    {t('location_title')}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <Button 
                      type="button"
                      onClick={handleGetLocation}
                      variant="outline"
                      className="h-12 px-6 rounded-[10px] border-border bg-muted/50 hover:bg-muted text-indigo-400 font-medium w-full sm:w-auto"
                    >
                      <MapPin size={16} className="mr-2" />
                      {t('get_location')}
                    </Button>
                    {coords && (
                      <div className="text-green-500 flex items-center gap-2 font-medium text-xs sm:ml-2 mt-2 sm:mt-0">
                        <CheckCircle size={14} /> {t('location_success')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            
            {/* Live Profile Preview */}
            <div className="bg-card/40 backdrop-blur-3xl border border-indigo-500/20 rounded-[2.5rem] p-6 relative overflow-hidden group/preview shadow-2xl transition-all hover:border-indigo-500/40">
              <div className="absolute top-0 right-0 p-5">
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 animate-pulse px-3 py-1 rounded-full text-[9px] uppercase tracking-tighter">
                  <Sparkles size={10} className="mr-1 inline" />
                  {t('live_preview')}
                </Badge>
              </div>
              
              <div className="flex items-center gap-5 mb-8 mt-4">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-600/30 rotate-3 group-hover/preview:rotate-0 transition-transform">
                  {user?.name?.[0] || 'M'}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{user?.name || 'Your Name'}</h3>
                  <div className="flex items-center gap-1.5 text-yellow-500 mt-1">
                    <Star size={16} className="fill-yellow-500" />
                    <span className="text-sm font-bold text-foreground">5.0</span>
                    <span className="text-[11px] text-muted-foreground ml-1 uppercase font-bold tracking-widest">(0 {t('reviews_count')})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pb-10">
                <div className="flex items-center gap-2">
                  {selectedCategory ? (
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex items-center gap-1.5 py-1.5 px-4 rounded-3xl">
                      <selectedCategory.icon size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{selectedCategory.label}</span>
                    </Badge>
                  ) : (
                    <div className="h-8 w-32 bg-muted/50 rounded-3xl animate-pulse flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{t('select_category')}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 italic min-h-[60px] leading-relaxed">
                  {about || t('bio_placeholder_preview')}
                </p>

                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    <>
                      {skills.slice(0, 3).map(s => (
                        <Badge key={s} className="bg-muted/80 text-[9px] text-muted-foreground border-none px-3 py-1 rounded-lg font-bold uppercase tracking-tighter">
                          {s}
                        </Badge>
                      ))}
                      {skills.length > 3 && <span className="text-[10px] text-muted-foreground font-bold flex items-center">+{skills.length - 3}</span>}
                    </>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <div className="h-6 w-16 bg-muted/30 rounded-lg" />
                      <div className="h-6 w-20 bg-muted/30 rounded-lg" />
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{t('starting_from')}</span>
                    <span className="text-2xl font-black text-indigo-500 tracking-tighter">
                      {price || '0'} 
                      <span className="text-xs ml-1 font-bold text-muted-foreground tracking-normal uppercase">TJS / {t('hour')}</span>
                    </span>
                  </div>
                  <Button size="sm" className="bg-indigo-600 h-12 rounded-2xl px-6 text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none opacity-50 shadow-lg shadow-indigo-600/20">
                    {t('order_btn')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-indigo-600/10 to-transparent border border-indigo-500/20 p-6 rounded-[2.5rem] backdrop-blur-md flex flex-col justify-between h-full shadow-xl">
              
              <div className="space-y-6">
                <label className="flex items-center gap-3 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em]">
                  <Banknote size={18} />
                  {t('price_label')}
                </label>
                
                <div className="relative">
                  <Input 
                    type="number" 
                    min={1} 
                    max={1000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="100"
                    className="h-16 rounded-[15px] bg-muted/50 border-border text-indigo-400 text-3xl font-black px-5 focus:border-indigo-500 transition-all pr-20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                    TJS
                  </span>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    {t('recommended_price')} <span className="text-indigo-400 font-bold">85 TJS</span>
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <ul className="space-y-3">
                  {[t('benefit_free'), t('benefit_notifications'), t('benefit_support')].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <div className="bg-indigo-500/20 p-0.5 rounded-full text-indigo-400">
                        <CheckCircle size={12} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-14 rounded-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isLoading ? t('loading') : t('submit')}</span>
                  <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>

        </div>

        <p className="text-center text-muted-foreground text-xs mt-10">
          {t('terms_note')} <span className="text-indigo-400 cursor-pointer hover:underline">{t('terms_link')}</span>
        </p>
      </div>
    </div>
  )
}