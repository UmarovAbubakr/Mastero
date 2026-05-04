"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from '@/src/i18n/routing'
import { useGetMeQuery } from '@/src/store/api/authApi'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Try to get token from localStorage first
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // We can also query the API to be sure, but we only skip if no token
  const { data: user, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token || !mounted
  })

  useEffect(() => {
    // Define public routes
    const publicRoutes = ['/', '/login', '/register']
    
    // Check if current path is public
    const isPublic = publicRoutes.includes(pathname)

    // If no token or token is invalid, and trying to access protected route -> redirect
    if (!isLoading) {
      if (!token || isError) {
        if (!isPublic) {
          router.replace('/login')
        }
      } else if (user) {
        // If logged in, maybe don't allow login/register pages
        if (pathname === '/login' || pathname === '/register') {
          router.replace('/')
        }
      }
    }
  }, [pathname, router, token, isError, isLoading, user])

  // Optional: show a loading state while checking
  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center text-slate-900 dark:text-white">Загрузка...</div>
  }

  return <>{children}</>
}

