"use client"

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Star, Search as SearchIcon, MapPin, ShieldCheck, ArrowUpRight, Wrench, Zap, Home, Laptop, Smartphone, Tablet, Paintbrush, Hammer, Sofa, Layout, Heart, Check, SlidersHorizontal, Crown } from "lucide-react"
import { useGetWorkersQuery } from "@/src/store/api/workerApi"
import { Link, useRouter } from "@/src/i18n/routing"
import dynamic from 'next/dynamic'
import { cn } from "@/lib/utils"
import { VerifiedBadge } from "@/src/components/ui/verified-badge"
import { useDispatch, useSelector } from 'react-redux'
import { toggleCompare } from '@/src/store/slices/compareSlice'
import { RootState } from '@/src/store/store'
import { GitCompare } from 'lucide-react'
import { useFavorites } from '@/src/lib/useFavorites'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'

const MasterMap = dynamic(() => import('@/src/components/ui/master-map'), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-slate-900 animate-pulse rounded-[3rem]" />
})

const CATEGORIES = [
  { id: 'all', icon: SearchIcon, labelKey: 'category_all' },
  { id: 'plumber', icon: Wrench, labelKey: 'cat_plumber' },
  { id: 'electrician', icon: Zap, labelKey: 'cat_electrician' },
  { id: 'smart_home', icon: Home, labelKey: 'cat_smart_home' },
  { id: 'repair_house', icon: Hammer, labelKey: 'cat_repair_house' },
  { id: 'renovator', icon: Paintbrush, labelKey: 'cat_renovator' },
  { id: 'phone_repair', icon: Smartphone, labelKey: 'cat_phone_repair' },
  { id: 'computer_repair', icon: Laptop, labelKey: 'cat_computer_repair' },
  { id: 'tablet_repair', icon: Tablet, labelKey: 'cat_tablet_repair' },
  { id: 'designer', icon: Layout, labelKey: 'cat_designer' },
  { id: 'furniture', icon: Sofa, labelKey: 'cat_furniture' },
]

export function SearchClient() {
  const t = useTranslations('Search')
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const comparedIds = useSelector((state: RootState) => state.compare.workerIds)
  const { isFavorite, toggleFavorite } = useFavorites()
  
  const initialSearch = searchParams.get('query') || ''
  const initialCategory = searchParams.get('category') || 'all'

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // New Sidebar Filters State
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [location, setLocation] = useState('')
  const [minRating, setMinRating] = useState('0')
  const [minReviews, setMinReviews] = useState('0')
  const [hasWorks, setHasWorks] = useState(false)

  useEffect(() => {
    const query = searchParams.get('query') || ''
    const cat = searchParams.get('category') || 'all'
    setSearchTerm(query)
    setDebouncedSearch(query)
    setSelectedCategory(cat)
  }, [searchParams])

  const updateUrl = (search: string, cat: string) => {
    const params = new URLSearchParams()
    if (search) params.set('query', search)
    if (cat !== 'all') params.set('category', cat)
    const queryString = params.toString()
    router.replace(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm)
        updateUrl(searchTerm, selectedCategory)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    updateUrl(searchTerm, cat)
  }

  const handleReset = () => {
    setSearchTerm('')
    setDebouncedSearch('')
    setSelectedCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setLocation('')
    setMinRating('0')
    setMinReviews('0')
    setHasWorks(false)
    router.replace('/search', { scroll: false })
  }

  const { data: workers = [], isLoading } = useGetWorkersQuery({ 
    search: debouncedSearch, 
    category: selectedCategory 
  })

  const filteredWorkers = workers.filter((w: any) => {
    if (minPrice && (w.price == null || w.price < Number(minPrice))) return false;
    if (maxPrice && (w.price == null || w.price > Number(maxPrice))) return false;
    if (location && (!w.city || !w.city.toLowerCase().includes(location.toLowerCase()))) return false;
    if (minRating !== '0' && (w.rating || 0) < Number(minRating)) return false;
    const revs = w.reviewsCount || w.reviews?.length || 0;
    if (minReviews !== '0' && revs < Number(minReviews)) return false;
    const works = w.portfolio?.length || w.portfolioCount || 0;
    if (hasWorks && works === 0) return false;
    return true;
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-50 pt-32 pb-20 px-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[20%] h-[20%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">{t('title')}</h1>
            <p className="text-slate-400 text-lg font-medium">{t('subtitle') || 'Проверенные специалисты в вашем городе'}</p>
          </div>
          <div className="relative w-full md:w-[400px] group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-4 h-5 w-5 text-indigo-400" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-14 rounded-2xl bg-slate-900/50 border-slate-800 backdrop-blur-xl text-lg focus-visible:ring-indigo-500/50" placeholder={t('filter')} />
            </div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto">
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">{t('category_label') || 'Категория'}:</p>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[280px] h-14 rounded-2xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-200 focus:ring-indigo-500/50 transition-all font-bold">
                <SelectValue placeholder={t('category_placeholder') || 'Выберите категорию'} />
              </SelectTrigger>
              <SelectContent className="bg-[#070A24] border-slate-800 text-slate-200 rounded-2xl shadow-2xl p-6">
                {CATEGORIES.map((cat) => (
                  <SelectItem 
                    key={cat.id} 
                    value={cat.id}
                    className="rounded-3xl focus:bg-indigo-500/10 focus:text-indigo-400 transition-colors cursor-pointer py-3"
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon size={18} className="text-indigo-400" />
                      <span className="font-bold">{t(cat.labelKey)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory !== 'all' && (
              <Button 
                variant="ghost" 
                onClick={() => handleCategoryChange('all')}
                className="text-slate-500 hover:text-white transition-colors h-14 px-6 rounded-2xl font-bold"
              >
                {t('reset')}
              </Button>
            )}
          </div>

          <div className="flex bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-end md:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-6 py-2.5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                viewMode === 'list' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Layout size={16} />
              {t('list_view')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "px-6 py-2.5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                viewMode === 'map' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <MapPin size={16} />
              {t('map_view')}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-400 py-20"><div className="inline-block w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" /><p className="font-bold uppercase tracking-widest text-xs">{t('loading')}</p></div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* List */}
            <div className="flex-1 w-full flex flex-col gap-6">
              {filteredWorkers.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border border-slate-800/50"><p className="text-slate-400 text-xl font-medium">{t('not_found')}</p><Button variant="link" className="mt-4 text-indigo-400 font-bold" onClick={handleReset}>{t('reset_filters')}</Button></div>
              ) : (
                filteredWorkers.map((worker: any) => (
                  <div key={worker.id} className="group relative bg-white dark:bg-slate-900/40 rounded-2xl p-6 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300">
                    {/* Avatar / Initials */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-500/20 dark:to-cyan-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-3xl font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-500">
                        {worker.user?.name?.[0] || '?'}
                      </div>
                      {worker.user?.subscriptionTier === 'PRO' && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                          <Zap size={12} fill="currentColor" />
                        </div>
                      )}
                      {worker.user?.subscriptionTier === 'ULTRA' && (
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                          <Crown size={12} fill="currentColor" />
                        </div>
                      )}
                      {worker.verified && (
                        <div className="absolute -bottom-2 -right-2">
                          <VerifiedBadge showText={false} className="p-1" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {worker.user?.name || t('name_unknown')}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                            {worker.skills}
                          </p>
                        </div>
                        
                        {/* Price and Actions Mobile: Top-Right, Desktop: Right */}
                        <div className="flex items-center md:items-start gap-3">
                          <Badge className="rounded-lg px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20 font-bold whitespace-nowrap text-sm">
                            {worker.price} TJS / ч
                          </Badge>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                dispatch(toggleCompare(worker.id))
                              }}
                              className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all border shrink-0",
                                comparedIds.includes(worker.id)
                                  ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                                  : "bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-slate-700"
                              )}
                            >
                              <GitCompare size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                toggleFavorite({
                                  id: worker.id,
                                  name: worker.user?.name || t('name_unknown'),
                                  city: worker.city,
                                  category: worker.skills?.split(',')?.[0],
                                  price: worker.price ? `${worker.price} TJS` : undefined,
                                })
                              }}
                              className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all border shrink-0",
                                isFavorite(worker.id)
                                  ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
                                  : "bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-slate-700"
                              )}
                            >
                              <Heart size={16} className={cn("transition-transform", isFavorite(worker.id) ? "text-rose-500 fill-rose-500" : "text-slate-400 hover:text-rose-500")} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-sm font-medium mt-3">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Star size={16} className="text-amber-400 fill-amber-400" />
                          <span>{worker.rating?.toFixed(1) || "5.0"}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <MapPin size={16} />
                          <span>{worker.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <div className="w-full md:w-auto md:ml-2 shrink-0 mt-2 md:mt-0">
                      <Link href={`/worker/${worker.id}`} className="block w-full">
                        <button className="w-full md:w-auto px-6 h-12 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white font-bold transition-all hover:bg-indigo-600 dark:hover:bg-indigo-600 flex items-center justify-center gap-2">
                          <span className="text-sm">{t('view_profile')}</span>
                          <ArrowUpRight size={16} />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Filters */}
            <div className="w-full lg:w-[320px] shrink-0 bg-white dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-32 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={20} className="text-indigo-500" />
                <h3 className="text-lg font-bold">{t('filters')}</h3>
              </div>
              
              {/* Price Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('filter_price')}</label>
                <div className="flex items-center gap-3">
                  <Input placeholder={t('filter_price_from')} value={minPrice} onChange={e => setMinPrice(e.target.value)} type="number" className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-3xl" />
                  <span className="text-slate-400">-</span>
                  <Input placeholder={t('filter_price_to')} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} type="number" className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-3xl" />
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('filter_location')}</label>
                <Input placeholder={t('filter_location_placeholder')} value={location} onChange={e => setLocation(e.target.value)} className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-3xl" />
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('filter_rating')}</label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-3xl font-medium">
                    <SelectValue placeholder={t('filter_rating_any')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                    <SelectItem value="0" className="py-2.5">{t('filter_rating_any')}</SelectItem>
                    <SelectItem value="4" className="py-2.5">{t('filter_rating_4')}</SelectItem>
                    <SelectItem value="4.5" className="py-2.5">{t('filter_rating_4_5')}</SelectItem>
                    <SelectItem value="4.8" className="py-2.5">{t('filter_rating_4_8')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reviews Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('filter_reviews')}</label>
                <Select value={minReviews} onValueChange={setMinReviews}>
                  <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-3xl font-medium">
                    <SelectValue placeholder={t('filter_reviews_any')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                    <SelectItem value="0" className="py-2.5">{t('filter_reviews_any')}</SelectItem>
                    <SelectItem value="5" className="py-2.5">{t('filter_reviews_5')}</SelectItem>
                    <SelectItem value="10" className="py-2.5">{t('filter_reviews_10')}</SelectItem>
                    <SelectItem value="50" className="py-2.5">{t('filter_reviews_50')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Has Works Filter */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn("w-6 h-6 rounded-lg border flex items-center justify-center transition-all", hasWorks ? "bg-indigo-600 border-indigo-600" : "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 group-hover:border-indigo-500")}>
                    {hasWorks && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('filter_with_works')}</span>
                  <input type="checkbox" className="hidden" checked={hasWorks} onChange={(e) => setHasWorks(e.target.checked)} />
                </label>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={handleReset}
                className="w-full h-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold mt-4"
              >
                {t('reset_filters')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500">
            <MasterMap 
              masters={filteredWorkers.map((w: any, idx: number) => ({
                id: w.id,
                name: w.user?.name || 'Мастер',
                skills: w.skills,
                rating: w.rating?.toFixed(1) || "5.0",
                price: w.price,
                // Mock coordinates for Dushanbe center with small offset if not provided
                lat: w.latitude || (38.5358 + (Math.random() - 0.5) * 0.05),
                lng: w.longitude || (68.7791 + (Math.random() - 0.5) * 0.05),
              }))} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
