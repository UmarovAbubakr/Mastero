/**
 * Property-Based Tests for Dark/Light Mode Theme Switcher
 * Feature: dark-light-mode
 *
 * Uses fast-check for property-based testing with numRuns: 100.
 * Tests Properties 1–7 as defined in the design document.
 */

import * as fc from 'fast-check'
import { render, screen, act, renderHook, cleanup } from '@testing-library/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import { ThemeToggle } from '../components/ui/theme-toggle'
import enMessages from '../../messages/en.json'
import ruMessages from '../../messages/ru.json'
import tgMessages from '../../messages/tg.json'

// ─── Message map ────────────────────────────────────────────────────────────

type Locale = 'en' | 'ru' | 'tg'

const allMessages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  ru: ruMessages,
  tg: tgMessages as typeof enMessages,
}

// ─── Render helper ──────────────────────────────────────────────────────────

function renderThemeToggle(theme: string, locale: Locale = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={allMessages[locale]}>
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

// ─── matchMedia mock helper ──────────────────────────────────────────────────

function mockMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql = {
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: (fn: (e: MediaQueryListEvent) => void) => listeners.push(fn),
    removeListener: (fn: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(fn)
      if (idx !== -1) listeners.splice(idx, 1)
    },
    addEventListener: (type: string, fn: (e: MediaQueryListEvent) => void) => {
      if (type === 'change') listeners.push(fn)
    },
    removeEventListener: (type: string, fn: (e: MediaQueryListEvent) => void) => {
      if (type === 'change') {
        const idx = listeners.indexOf(fn)
        if (idx !== -1) listeners.splice(idx, 1)
      }
    },
    dispatchEvent: (event: Event) => {
      listeners.forEach((fn) => fn(event as MediaQueryListEvent))
      return true
    },
  }
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      if (query === '(prefers-color-scheme: dark)') return mql
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }
    },
  })
  return { mql, listeners }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('dark-light-mode property-based tests', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset matchMedia to a neutral default
    mockMatchMedia(false)
  })

  afterEach(() => {
    cleanup()
  })

  // ── Property 1: Theme persistence round-trip ─────────────────────────────
  it(
    // Feature: dark-light-mode, Property 1: theme persistence round-trip
    'Property 1: setTheme(value) persists value to localStorage["theme"]',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('light', 'dark', 'system'),
          async (themeValue) => {
            localStorage.clear()

            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem={false}
                storageKey="theme"
              >
                {children}
              </ThemeProvider>
            )

            const { result } = renderHook(() => useTheme(), { wrapper })

            await act(async () => {
              result.current.setTheme(themeValue)
            })

            const stored = localStorage.getItem('theme')
            cleanup()
            return stored === themeValue
          }
        ),
        { numRuns: 100 }
      )
    }
  )

  // ── Property 2: Theme restoration on mount ───────────────────────────────
  it(
    // Feature: dark-light-mode, Property 2: theme restoration on mount
    'Property 2: localStorage["theme"] value is restored as active theme on mount',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('light', 'dark', 'system'),
          async (themeValue) => {
            localStorage.clear()
            localStorage.setItem('theme', themeValue)

            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem={false}
                storageKey="theme"
              >
                {children}
              </ThemeProvider>
            )

            const { result } = renderHook(() => useTheme(), { wrapper })

            // next-themes resolves theme asynchronously after mount
            await act(async () => {
              await new Promise((r) => setTimeout(r, 0))
            })

            const restoredTheme = result.current.theme
            cleanup()
            return restoredTheme === themeValue
          }
        ),
        { numRuns: 100 }
      )
    }
  )

  // ── Property 3: Explicit theme ignores OS media query changes ────────────
  it(
    // Feature: dark-light-mode, Property 3: explicit theme ignores OS changes
    'Property 3: explicit theme (light|dark) is not changed by OS prefers-color-scheme events',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('light', 'dark'),
          fc.boolean(),
          async (explicitTheme, prefersDark) => {
            localStorage.clear()

            const { mql } = mockMatchMedia(!prefersDark)

            const wrapper = ({ children }: { children: React.ReactNode }) => (
              <ThemeProvider
                attribute="class"
                defaultTheme={explicitTheme}
                enableSystem={false}
                storageKey="theme"
              >
                {children}
              </ThemeProvider>
            )

            const { result } = renderHook(() => useTheme(), { wrapper })

            await act(async () => {
              result.current.setTheme(explicitTheme)
              await new Promise((r) => setTimeout(r, 0))
            })

            const themeBefore = result.current.theme

            // Fire OS preference change
            await act(async () => {
              mql.matches = prefersDark
              mql.dispatchEvent(
                new Event('change') as MediaQueryListEvent
              )
              await new Promise((r) => setTimeout(r, 0))
            })

            const themeAfter = result.current.theme
            cleanup()

            // With enableSystem=false, OS changes must not affect explicit theme
            return themeAfter === themeBefore && themeAfter === explicitTheme
          }
        ),
        { numRuns: 100 }
      )
    }
  )

  // ── Property 4: Active option has distinct CSS class ─────────────────────
  it(
    // Feature: dark-light-mode, Property 4: active option is visually distinguished
    'Property 4: active ThemeToggle button has bg-background class; others do not',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('light', 'dark', 'system'),
          async (activeTheme) => {
            const { unmount } = renderThemeToggle(activeTheme)

            await act(async () => {
              await new Promise((r) => setTimeout(r, 0))
            })

            const buttons = screen.getAllByRole('button')
            // 3 buttons: light, dark, system
            expect(buttons).toHaveLength(3)

            const activeLabel = allMessages.en.ThemeToggle[activeTheme as keyof typeof allMessages.en.ThemeToggle]
            const otherThemes = (['light', 'dark', 'system'] as const).filter((v) => v !== activeTheme)

            const activeBtn = screen.getByTitle(activeLabel)
            const activeHasBgBackground = activeBtn.classList.contains('bg-background')

            const othersLackBgBackground = otherThemes.every((v) => {
              const otherLabel = allMessages.en.ThemeToggle[v]
              const otherBtn = screen.getByTitle(otherLabel)
              return !otherBtn.classList.contains('bg-background')
            })

            unmount()
            return activeHasBgBackground && othersLackBgBackground
          }
        ),
        { numRuns: 100 }
      )
    }
  )

  // ── Property 5: All toggle options have accessible labels ─────────────────
  it(
    // Feature: dark-light-mode, Property 5: all toggle options have accessible labels
    'Property 5: every ThemeToggle button has a non-empty aria-label or title',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('light', 'dark', 'system'),
          async (activeTheme) => {
            const { unmount } = renderThemeToggle(activeTheme)

            await act(async () => {
              await new Promise((r) => setTimeout(r, 0))
            })

            const buttons = screen.getAllByRole('button')
            const allHaveLabels = buttons.every((btn) => {
              const ariaLabel = btn.getAttribute('aria-label') ?? ''
              const title = btn.getAttribute('title') ?? ''
              return ariaLabel.length > 0 || title.length > 0
            })

            unmount()
            return allHaveLabels
          }
        ),
        { numRuns: 100 }
      )
    }
  )

  // ── Property 6: Toggle labels match active locale ─────────────────────────
  it(
    // Feature: dark-light-mode, Property 6: toggle labels match active locale translations
    'Property 6: ThemeToggle button titles match the active locale message file',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Locale>('en', 'ru', 'tg'),
          async (locale) => {
            const msgs = allMessages[locale]
            const { unmount } = renderThemeToggle('light', locale)

            await act(async () => {
              await new Promise((r) => setTimeout(r, 0))
            })

            const themeKeys = ['light', 'dark', 'system'] as const
            const allMatch = themeKeys.every((key) => {
              const expectedLabel = msgs.ThemeToggle[key]
              const btn = screen.queryByTitle(expectedLabel)
              return btn !== null
            })

            unmount()
            return allMatch
          }
        ),
        { numRuns: 100 }
      )
    }
  )

  // ── Property 7: All locale files contain ThemeToggle keys ─────────────────
  it(
    // Feature: dark-light-mode, Property 7: all locale files contain ThemeToggle keys
    'Property 7: every locale file has non-empty ThemeToggle.light, .dark, .system strings',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom<Locale>('en', 'ru', 'tg'),
          (locale) => {
            const msgs = allMessages[locale]
            const toggle = msgs.ThemeToggle
            return (
              typeof toggle?.light === 'string' && toggle.light.length > 0 &&
              typeof toggle?.dark === 'string' && toggle.dark.length > 0 &&
              typeof toggle?.system === 'string' && toggle.system.length > 0
            )
          }
        ),
        { numRuns: 100 }
      )
    }
  )
})

