'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const t = useTranslations('ThemeToggle')

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const options = [
    { value: 'light' as const, icon: Sun,     label: t('light')  },
    { value: 'dark'  as const, icon: Moon,    label: t('dark')   },
    { value: 'system' as const, icon: Monitor, label: t('system') },
  ]

  // На сервере или до монтирования рендерим кнопки без активного состояния
  if (!mounted) {
    return (
      <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
        {options.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            aria-label={label}
            className="relative flex items-center justify-center rounded-2xl p-1.5 transition-colors text-muted-foreground"
            title={label}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          className={cn(
            'relative flex items-center justify-center rounded-2xl p-1.5 transition-colors',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}
