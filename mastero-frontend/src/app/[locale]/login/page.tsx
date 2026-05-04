"use client"

import React, { useState } from 'react'
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useTranslations } from 'next-intl'
import { Link, useRouter } from "@/src/i18n/routing"
import { Hammer, Mail, Lock, ArrowRight } from "lucide-react"
import { useLoginMutation } from "@/src/store/api/authApi"
import { toast } from "sonner"
import { GoogleSignInButton } from "@/src/components/GoogleSignIn"

export default function LoginPage() {
  const t = useTranslations('Auth')
  const router = useRouter()
  const [login, { isLoading }] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await login({ email, password }).unwrap()
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token)
      }
      toast.success(res.message || 'Успешный вход')
      router.push('/')
    } catch (err: any) {
      toast.error(err.data?.error || 'Ошибка входа')
    }
  }

  return (
    <div className="pt-25 pb-25 relative min-h-screen flex items-center justify-center overflow-hidden px-6 bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 dark:from-indigo-500/20 to-cyan-500/10 dark:to-cyan-500/20 rounded-[2.5rem] blur-sm" />
        
        <div className="relative space-y-8 bg-white dark:bg-slate-900/40 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-2xl transition-all">
          
          <div className="text-center space-y-4">
            <Link href="/" className="inline-flex p-6 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2 transition-transform hover:rotate-360 duration-500 ">
              <Hammer size={32} />
            </Link>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
              {t('login_title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Рады видеть тебя снова в Mastero
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email')} 
                  className="h-14 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')} 
                  className="h-14 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all" 
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 transition-all font-bold text-lg disabled:opacity-50"
            >
              {isLoading ? 'Загрузка...' : t('submit_login')}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-bold">
              <span className="bg-white dark:bg-[#0b1024] px-4 text-slate-400 dark:text-slate-500">Или</span>
            </div>
          </div>

          <GoogleSignInButton />

          <div className="text-center">
            <Link 
              href="/register" 
              className="group inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              <span>{t('submit_reg')}</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}