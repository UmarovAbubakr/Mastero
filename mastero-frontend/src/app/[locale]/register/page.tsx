"use client"

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from "@/src/i18n/routing"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Hammer, User, CheckCircle2, Mail, Lock, UserCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRegisterMutation } from "@/src/store/api/authApi"
import { toast } from "sonner"
import { GoogleSignInButton } from "@/src/components/GoogleSignIn"

export default function RegisterPage() {
  const t = useTranslations('Auth')
  const router = useRouter()
  const [registerUser, { isLoading }] = useRegisterMutation()
  const [role, setRole] = useState<'client' | 'worker'>('client')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await registerUser({ name, email, password, role }).unwrap()
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token)
      }
      toast.success(res.message || 'Успешная регистрация')
      if (role === 'worker') {
        router.push('/register-worker')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      toast.error(err.data?.error || 'Ошибка при регистрации')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50 flex items-center justify-center px-6 py-24 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-[540px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 dark:from-indigo-500/20 to-cyan-500/10 dark:to-cyan-500/20 rounded-[3rem] blur-md" />
        
        <div className="relative bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-200 dark:border-slate-800/50 p-6 md:p-16 rounded-[3rem] shadow-xl dark:shadow-2xl">
          
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex p-6 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6 transition-transform hover:scale-110 active:scale-95">
              <Hammer size={40} />
            </Link>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-3">
              {t('reg_title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{t('reg_subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            {[
              { id: 'client', label: t('i_am_client'), icon: UserCircle },
              { id: 'worker', label: t('i_am_worker'), icon: Hammer },
            ].map((item) => {
              const Icon = item.icon
              const isActive = role === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id as 'client' | 'worker')}
                  className={cn(
                    "relative p-5 rounded-[1.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 group",
                    isActive 
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10" 
                      : "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/20 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <Icon size={28} className={cn("transition-colors", isActive ? "text-indigo-500 dark:text-indigo-400" : "group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                  <span className={cn("text-xs uppercase tracking-widest font-bold", isActive ? "text-slate-900 dark:text-white" : "")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={18} className="text-indigo-500 dark:text-indigo-400 fill-indigo-400/10" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative group">
              <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('name')} 
                className="h-14 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all" 
                required
              />
            </div>

            <div className="relative group">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email')} 
                className="h-14 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all" 
                required
              />
            </div>

            <div className="relative group">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')} 
                className="h-14 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all" 
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 transition-all mt-6 disabled:opacity-50"
            >
              {isLoading ? 'Загрузка...' : t('submit_reg')}
            </Button>
          </form>

          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-bold">
              <span className="bg-white dark:bg-[#0b1024] px-4 text-slate-400 dark:text-slate-500">Или</span>
            </div>
          </div>

          <GoogleSignInButton />

          <div className="mt-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t('have_account')}{' '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold transition-colors inline-flex items-center gap-1 group">
                {t('login')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}