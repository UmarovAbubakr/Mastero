"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/src/i18n/routing'
import { 
  useGetJobRequestByIdQuery, 
  useCreateProposalMutation, 
  useAcceptProposalMutation 
} from '@/src/store/api/jobApi'
import { useGetMeQuery } from '@/src/store/api/authApi'
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { 
  ClipboardList, 
  MapPin, 
  Banknote, 
  Calendar,
  MessageSquare,
  ChevronLeft,
  CheckCircle2,
  User,
  Clock,
  Check
} from "lucide-react"
import { toast } from "sonner"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string
  const t = useTranslations('Jobs')
  const ts = useTranslations('Search')
  const tNav = useTranslations('Navbar')
  const router = useRouter()
  
  const { data: job, isLoading, error } = useGetJobRequestByIdQuery(id)
  const { data: user } = useGetMeQuery(undefined)
  const [createProposal, { isLoading: isApplying }] = useCreateProposalMutation()
  const [acceptProposal, { isLoading: isAccepting }] = useAcceptProposalMutation()

  const [proposalData, setProposalData] = useState({
    message: '',
    price: ''
  })

  const isClient = user?.id === job?.clientId
  const isWorker = user?.role === 'worker'
  const hasApplied = job?.proposals?.some((p: any) => p.worker?.userId === user?.id)

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProposal({
        jobRequestId: id,
        ...proposalData
      }).unwrap()
      toast.success(t('success_applied'))
    } catch (err: any) {
      toast.error(err.data?.error || "Failed to apply")
    }
  }

  const handleAccept = async (proposalId: string) => {
    try {
      await acceptProposal(proposalId).unwrap()
      toast.success(t('success_accepted'))
    } catch (err) {
      toast.error("Failed to select master")
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center pt-32"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  if (!job) return <div className="min-h-screen flex items-center justify-center pt-32 text-2xl font-bold">Job not found</div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] pt-32 pb-20 px-6 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-16"
        >
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors text-sm font-bold uppercase tracking-widest"
              >
                <ChevronLeft size={16} />
                {t('back_to_jobs')}
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-none px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {ts(`cat_${job.category}`)}
                </Badge>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Clock size={14} />
                  {t('posted')} {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{job.title}</h1>
            </div>

            <Card className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-6 space-y-8">
                {job.imageUrl && (
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-8 group">
                    <img 
                      src={job.imageUrl} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt={job.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                    <ClipboardList size={16} />
                    {t('job_details')}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('form_city')}</div>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <MapPin className="text-indigo-500" size={20} />
                      {job.city}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('budget')}</div>
                    <div className="flex items-center gap-2 font-black text-2xl text-emerald-500">
                      <Banknote size={24} />
                      {job.budget ? `${job.budget} TJS` : t('fixed_price')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black">
                {job.client?.name?.[0]}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('client')}</div>
                <div className="font-bold text-lg">{job.client?.name}</div>
              </div>
            </div>
          </div>

          {/* Sidebar / Interaction */}
          <div className="lg:col-span-1 space-y-6">
            
            {isClient ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <MessageSquare className="text-indigo-500" />
                  {t('proposals')}
                  <span className="ml-auto text-sm text-slate-400">{job.proposals?.length}</span>
                </h2>
                
                <div className="space-y-4">
                  {job.proposals?.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('no_proposals')}</p>
                    </div>
                  ) : (
                    job.proposals.map((proposal: any) => (
                      <Card key={proposal.id} className="bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black">
                              {proposal.worker?.user?.name?.[0]}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm">{proposal.worker?.user?.name}</div>
                              <div className="text-xs text-indigo-500 font-bold">{proposal.price} TJS</div>
                            </div>
                            {proposal.status === 'accepted' && (
                                <Badge className="bg-emerald-500 text-white border-none rounded-full"><Check size={12} /></Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-3">{proposal.message}</p>
                          
                          {job.status === 'open' && (
                            <Button 
                              onClick={() => handleAccept(proposal.id)}
                              disabled={isAccepting}
                              className="w-full h-10 rounded-3xl bg-slate-900 text-white hover:bg-indigo-600 transition-all font-bold text-xs uppercase"
                            >
                              {t('accept')}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 sticky top-32">
                {job.status === 'open' ? (
                  isWorker ? (
                    hasApplied ? (
                      <Card className="bg-emerald-500/10 border-emerald-500/20 rounded-3xl">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto">
                            <CheckCircle2 size={32} />
                          </div>
                          <h3 className="font-black text-emerald-600 uppercase text-xs tracking-widest">{t('success_applied')}</h3>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl">
                        <CardContent className="p-6 space-y-6">
                          <h3 className="text-xl font-black">{t('apply')}</h3>
                          <form onSubmit={handleApply} className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('apply_message')}</Label>
                              <Textarea 
                                required
                                value={proposalData.message}
                                onChange={(e) => setProposalData({...proposalData, message: e.target.value})}
                                placeholder="..."
                                className="rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 min-h-[100px] resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('apply_price')}</Label>
                              <Input 
                                type="number"
                                required
                                value={proposalData.price}
                                onChange={(e) => setProposalData({...proposalData, price: e.target.value})}
                                className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                              />
                            </div>
                            <Button 
                              disabled={isApplying}
                              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs"
                            >
                              {t('apply_submit')}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 text-amber-600 text-center space-y-4">
                        <User className="mx-auto" size={32} />
                        <p className="text-sm font-bold">{t('become_worker_to_apply')}</p>
                        <Link href="/register-worker">
                            <Button variant="outline" className="border-amber-500/20 text-amber-600 hover:bg-amber-500/10">
                                {tNav('become_worker')}
                            </Button>
                        </Link>
                    </div>
                  )
                ) : (
                  <Card className="bg-slate-100 dark:bg-slate-900 border-none rounded-3xl">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="text-4xl font-black text-slate-300">#</div>
                      <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest">{t('status_closed')}</h3>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

          </div>
        </motion.div>

      </div>
    </div>
  )
}
