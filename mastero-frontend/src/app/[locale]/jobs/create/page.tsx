"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/src/i18n/routing'
import { useCreateJobRequestMutation } from '@/src/store/api/jobApi'
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  ClipboardList,
  MapPin,
  Banknote,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  Plus,
  X
} from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"

import { useUploadImageMutation } from '@/src/store/api/workerApi'

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

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
}

export default function CreateJobPage() {
  const t = useTranslations('Jobs')
  const ts = useTranslations('Search')
  const router = useRouter()
  const [createJob, { isLoading }] = useCreateJobRequestMutation()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    city: 'Dushanbe',
    imageUrl: ''
  })

  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadImage(file).unwrap()
      setFormData({ ...formData, imageUrl: result.imageUrl })
      toast.success("Photo uploaded")
    } catch (err) {
      toast.error("Upload failed")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category || !formData.title) {
      toast.error("Please fill title and category")
      return
    }

    try {
      await createJob(formData).unwrap()
      toast.success(t('success_created'))
      router.push('/profile')
    } catch (err) {
      toast.error("Failed to create job")
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] pt-32 pb-20 px-6 transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors text-sm font-bold uppercase tracking-widest mb-4"
            >
              <ChevronLeft size={16} />
              {t('back_to_jobs')}
            </button>
            <h1 className="text-4xl font-black tracking-tight">{t('create_title')}</h1>
            <p className="text-slate-500 font-medium">{t('create_subtitle')}</p>
          </div>

          <Card className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border-slate-100 dark:border-slate-800 shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">

                <motion.div variants={itemVariants} className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    {t('form_title')}
                  </Label>
                  <div className="relative">
                    <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('form_title_placeholder')}
                      className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      {ts('category_label')}
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder={ts('category_placeholder')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <SelectItem value="plumber">{ts('cat_plumber')}</SelectItem>
                        <SelectItem value="electrician">{ts('cat_electrician')}</SelectItem>
                        <SelectItem value="repair_house">{ts('cat_repair_house')}</SelectItem>
                        <SelectItem value="cleaning">{ts('cat_cleaning')}</SelectItem>
                        <SelectItem value="furniture">{ts('cat_furniture')}</SelectItem>
                        <SelectItem value="repair_of_household_appliances">{ts('cat_repair_of_household_appliances')}</SelectItem>
                        <SelectItem value="other">{ts('cat_other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      {t('form_city')}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    {t('form_desc')}
                  </Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('form_desc_placeholder')}
                    className="min-h-[150px] rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 focus:ring-indigo-500 transition-all resize-none"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      {t('form_budget')}
                    </Label>
                    <div className="relative">
                      <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        min='0'
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="500"
                        className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      {t('add_photo')}
                    </Label>
                    <div className="flex gap-6">
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
                        className="h-14 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition-all"
                      >
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Plus className="mr-2" size={18} /> {t('add_photo')}</>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {formData.imageUrl && (
                  <motion.div variants={itemVariants} className="relative w-full aspect-video rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    <Button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-6 right-4 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                    >
                      <X size={18} />
                    </Button>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="pt-4">
                  <Button
                    disabled={isLoading}
                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    {t('form_submit')}
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                </motion.div>

              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
