'use client'

import { Link } from '@/src/i18n/routing'
import { useTranslations } from 'next-intl'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Heart, Search, ArrowRight } from 'lucide-react'
import { useFavorites } from '@/src/lib/useFavorites'

export default function FavoritesPage() {
  const t = useTranslations('FavoritesPage')
  const { favorites, removeFavorite } = useFavorites()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3 rounded-full bg-indigo-600/10 px-4 py-2 text-indigo-500 font-bold uppercase text-xs tracking-[0.3em]">
            <Heart className="h-4 w-4" /> {t('title')}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">{t('title')}</h1>
          <p className="max-w-2xl text-slate-500 dark:text-slate-400 text-lg">{t('subtitle')}</p>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-16 text-center shadow-lg">
            <Heart className="mx-auto mb-6 h-12 w-12 text-indigo-500" />
            <h2 className="text-3xl font-black mb-2">{t('empty_title')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t('empty_description')}</p>
            <Link href="/search">
              <Button className="rounded-2xl px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                <Search className="mr-2 h-4 w-4" /> {t('search_button')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="bg-white/5 border border-slate-200/10 dark:border-slate-800 rounded-[2rem] overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">{favorite.name}</h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                        {favorite.city && <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200">{favorite.city}</Badge>}
                        {favorite.category && <Badge className="bg-indigo-500/10 text-indigo-500">{favorite.category}</Badge>}
                        {favorite.price && <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200">{favorite.price}</Badge>}
                      </div>
                    </div>
                    <Button variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={() => removeFavorite(favorite.id)}>
                      {t('remove')}
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-slate-500 dark:text-slate-400 text-sm">{favorite.city || ''}</div>
                    <Link href={`/worker/${favorite.id}`} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                        {t('view_profile')} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
