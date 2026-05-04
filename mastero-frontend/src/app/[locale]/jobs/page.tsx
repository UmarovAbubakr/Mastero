"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/i18n/routing'
import { useGetJobRequestsQuery } from '@/src/store/api/jobApi'
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { 
  ClipboardList, 
  MapPin, 
  Banknote, 
  Calendar,
  MessageSquare,
  ArrowRight,
  Search,
  Filter,
  Plus
} from "lucide-react"
import { Input } from "@/src/components/ui/input"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0
  }
}

export default function JobsPage() {
  const t = useTranslations('Jobs')
  const ts = useTranslations('Search')
  const { data: jobs, isLoading } = useGetJobRequestsQuery({})
  const [searchTerm, setSearchTerm] = useState('')

  const filteredJobs = jobs?.filter((job: any) => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] pt-32 pb-20 px-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight">{t('title')}</h1>
            <p className="text-slate-500 font-medium text-lg">{t('subtitle')}</p>
          </div>
          <Link href="/jobs/create">
            <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
              <Plus className="mr-2" size={18} />
              {t('create_title')}
            </Button>
          </Link>
        </div>

        <div className="relative max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={ts('filter')}
            className="w-full h-16 pl-14 pr-6 rounded-3xl bg-white dark:bg-slate-900 border-none shadow-xl shadow-slate-200/50 dark:shadow-none text-lg"
          />
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredJobs?.map((job: any) => (
                <motion.div key={job.id} variants={cardVariants}>
                  <Link href={`/jobs/${job.id}`}>
                    <Card className="group h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 rounded-[2.5rem] transition-all duration-500 overflow-hidden">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <Badge className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-none px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {ts(`cat_${job.category}`)}
                          </Badge>
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                            <Calendar size={14} />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <h3 className="text-2xl font-black mb-3 group-hover:text-indigo-500 transition-colors line-clamp-1">{job.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 line-clamp-2 flex-grow">
                          {job.description}
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 transition-colors">
                              <MapPin size={18} />
                            </div>
                            <span className="text-sm font-bold">{job.city}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-emerald-500 transition-colors">
                              <Banknote size={18} />
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {job.budget ? `${job.budget} TJS` : t('fixed_price')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase">
                              {job.client?.name?.[0]}
                            </div>
                            <span className="text-xs font-bold text-slate-400">{job.client?.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {job._count?.proposals} {t('proposals')}
                            </span>
                            <div className="p-3 rounded-2xl bg-slate-900 text-white group-hover:bg-indigo-600 transition-colors">
                              <ArrowRight size={20} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && filteredJobs?.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold">{ts('not_found')}</h3>
            <p className="text-slate-500">{t('subtitle')}</p>
          </div>
        )}

      </div>
    </div>
  )
}
