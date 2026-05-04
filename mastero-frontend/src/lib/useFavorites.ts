import { useEffect, useMemo, useState } from 'react'

export interface FavoriteItem {
  id: string
  name: string
  city?: string
  category?: string
  price?: string
}

const FAVORITES_STORAGE_KEY = 'mastero_favorites'

function parseFavorites(value: string | null): FavoriteItem[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function serializeFavorites(favorites: FavoriteItem[]) {
  return JSON.stringify(favorites)
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    setFavorites(parseFavorites(stored))
  }, [])

  const saveFavorites = (nextFavorites: FavoriteItem[]) => {
    setFavorites(nextFavorites)
    if (typeof window !== 'undefined') {
      localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(nextFavorites))
    }
  }

  const isFavorite = useMemo(
    () => (id: string) => favorites.some((item) => item.id === id),
    [favorites]
  )

  const addFavorite = (item: FavoriteItem) => {
    if (!item.id) return
    if (favorites.some((favorite) => favorite.id === item.id)) return
    saveFavorites([...favorites, item])
  }

  const removeFavorite = (id: string) => {
    saveFavorites(favorites.filter((item) => item.id !== id))
  }

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id)
    } else {
      addFavorite(item)
    }
  }

  return {
    favorites,
    mounted,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  }
}
