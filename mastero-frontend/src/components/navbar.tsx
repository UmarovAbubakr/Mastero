'use client'

import React, { useState, useEffect } from 'react'
import { Link, useRouter } from "@/src/i18n/routing"
import { usePathname } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Button } from "@/src/components/ui/button"
import { LanguageSwitcher } from "@/src/components/ui/language-switcher"
import { ThemeToggle } from "@/src/components/ui/theme-toggle"
import { Hammer, LogOut, Menu, MessageCircle, User, UserRoundCog, X, Heart, ClipboardList, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

import { useGetMeQuery } from "@/src/store/api/authApi"

export function Navbar() {
  const t = useTranslations('Navbar')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: user, isLoading, isError } = useGetMeQuery(undefined, {
    // Only query if we have a token in localStorage
    skip: typeof window !== 'undefined' && !localStorage.getItem('token')
  })

  const isLoggedIn = !!user

  const locale = pathname.split('/')[1] || 'ru'

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = `/${locale}/login` // Hard reload to clear state with locale
  }

  // Clear invalid token
  useEffect(() => {
    if (isError) {
      localStorage.removeItem('token')
    }
  }, [isError])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { title: t('home'), href: "/" },
    { title: t('search'), href: "/search" },
    { title: t('jobs'), href: "/jobs" },
    ...(user?.role !== 'worker' ? [{ title: t('become_worker'), href: "/register-worker" }] : []),
  ]

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b",
      scrolled
        ? " backdrop-blur-md border-slate-200 dark:border-border py-3"
        : "bg-transparent border-transparent py-5"

    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-[10px] group-hover:rotate-360 transition-transform duration-400 shadow-lg shadow-indigo-600/20">
            <Hammer className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter">MASTERO</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                (link.href === "/" 
                  ? (pathname === `/${locale}` || pathname === `/${locale}/`) 
                  : pathname.includes(link.href)) 
                  ? "text-primary font-bold" 
                  : "text-muted-foreground"
              )}
            >
              {link.title}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          <div className="h-6 w-[1px] bg-border mx-1" />
          <AuthSection mounted={mounted} isLoading={isLoading} isLoggedIn={isLoggedIn} user={user} t={t} isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} handleLogout={handleLogout} />
        </div>

        <div className="flex md:hidden items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-slate-200 dark:border-slate-800 md:hidden animate-in slide-in-from-top duration-300">
          <div className="p-6 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium border-b border-slate-100 dark:border-slate-800/50 pb-4 text-slate-700 dark:text-slate-300"
              >
                {link.title}
              </Link>
            ))}

            <div className="flex flex-col gap-6 pt-4">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-3 rounded-3xl border border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('language')}</span>
                <LanguageSwitcher />
              </div>
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-3 rounded-3xl border border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('theme')}</span>
                <ThemeToggle />
              </div>

              <MobileAuthSection mounted={mounted} isLoading={isLoading} isLoggedIn={isLoggedIn} t={t} setIsOpen={setIsOpen} handleLogout={handleLogout} />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function AuthSection({ mounted, isLoading, isLoggedIn, user, t, isDropdownOpen, setIsDropdownOpen, handleLogout }: any) {
  if (!mounted || isLoading) {
    return <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
  }

  if (isLoggedIn) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger
          asChild
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <Button variant="secondary" size="icon" className="rounded-full border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300">
            <UserRoundCog className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-white dark:bg-[#070A24] border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl dark:shadow-2xl animate-in fade-in zoom-in duration-200"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t('account')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/50 mx-1" />
          <DropdownMenuItem asChild className="rounded-3xl focus:bg-indigo-500/10 focus:text-indigo-500 dark:focus:text-indigo-400 transition-colors cursor-pointer">
            <Link href="/profile" className="flex items-center w-full px-3 py-2">
              <User className="mr-3 h-4 w-4" />
              <span className="font-medium">{t('profile')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-3xl focus:bg-indigo-500/10 focus:text-indigo-500 dark:focus:text-indigo-400 transition-colors cursor-pointer">
            <Link href="/favorites" className="flex items-center w-full px-3 py-2">
              <Heart className="mr-3 h-4 w-4" />
              <span className="font-medium">{t('favorites')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-3xl focus:bg-indigo-500/10 focus:text-indigo-500 dark:focus:text-indigo-400 transition-colors cursor-pointer">
            <Link href="/orders" className="flex items-center w-full px-3 py-2">
              <ClipboardList className="mr-3 h-4 w-4" />
              <span className="font-medium">{t('my_orders')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-3xl focus:bg-indigo-500/10 focus:text-indigo-500 dark:focus:text-indigo-400 transition-colors cursor-pointer">
            <Link href="/chat" className="flex items-center w-full px-3 py-2">
              <MessageCircle className="mr-3 h-4 w-4" />
              <span className="font-medium">{t('messages')}</span>
            </Link>
          </DropdownMenuItem>
          {user?.role === 'worker' && (
            <DropdownMenuItem asChild className="rounded-3xl focus:bg-amber-500/10 focus:text-amber-500 dark:focus:text-amber-400 transition-colors cursor-pointer">
              <Link href="/subscription" className="flex items-center w-full px-3 py-2">
                <Crown className="mr-3 h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-500">Premium</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/50 mx-1" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="rounded-3xl focus:bg-red-500/10 focus:text-red-400 text-red-500 dark:text-red-400 transition-colors cursor-pointer px-3 py-2"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium">{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <Link href="/login">
        <Button variant="ghost" size="sm">{t('login')}</Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className="bg-primary hover:opacity-90 transition-opacity">
          {t('register')}
        </Button>
      </Link>
    </>
  )
}

function MobileAuthSection({ mounted, isLoading, isLoggedIn, t, setIsOpen, handleLogout }: any) {
  if (!mounted || isLoading) {
    return <div className="w-full h-12 bg-slate-200 dark:bg-slate-900 animate-pulse rounded-3xl" />
  }

  if (isLoggedIn) {
    return (
      <>
        <Link href="/profile" onClick={() => setIsOpen(false)}>
          <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 bg-transparent h-12 rounded-3xl">
            {t('profile')}
          </Button>
        </Link>
        <Link href="/favorites" onClick={() => setIsOpen(false)}>
          <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 bg-transparent h-12 rounded-3xl">
            {t('favorites')}
          </Button>
        </Link>
        <Link href="/orders" onClick={() => setIsOpen(false)}>
          <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 bg-transparent h-12 rounded-3xl">
            {t('my_orders')}
          </Button>
        </Link>
        <Link href="/subscription" onClick={() => setIsOpen(false)}>
          <Button variant="outline" className="w-full border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 h-12 rounded-3xl text-amber-600 dark:text-amber-400 font-bold">
            <Crown className="w-4 h-4 mr-2" />
            Premium
          </Button>
        </Link>
        <Button
          variant="destructive"
          onClick={() => {
            handleLogout()
            setIsOpen(false)
          }}
          className="w-full h-12 rounded-3xl shadow-lg"
        >
          {t('logout')}
        </Button>
      </>
    )
  }

  return (
    <>
      <Link href="/login" onClick={() => setIsOpen(false)}>
        <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 bg-transparent h-12 rounded-3xl">
          {t('login')}
        </Button>
      </Link>
      <Link href="/register" onClick={() => setIsOpen(false)}>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-3xl shadow-lg shadow-indigo-500/20">
          {t('register')}
        </Button>
      </Link>
    </>
  )
}
