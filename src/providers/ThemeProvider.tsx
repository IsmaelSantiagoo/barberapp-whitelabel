import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/hooks/use-auth'
import { ThemeProviderContext } from '@/hooks/use-theme'
import { adjustColor, getReadableTextColor } from '@/utils/color'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: ThemeProviderProps) => {
  const { barbershop } = useAuth()
  const barbershopPrimaryColor = barbershop?.primary_color || '#3B82F6'
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (theme !== 'system') return theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  const tokens = useMemo(() => {
    const onPrimary = getReadableTextColor(barbershopPrimaryColor)

    return {
      primary: barbershopPrimaryColor,
      onPrimary,

      background: resolvedTheme === 'light' ? '#FFFFFF' : '#121212',
      onBackground: resolvedTheme === 'light' ? '#1A1A1A' : '#FFFFFF',

      border: adjustColor(barbershopPrimaryColor, resolvedTheme === 'light' ? -40 : 40),
      hover: adjustColor(barbershopPrimaryColor, resolvedTheme === 'light' ? -20 : 20),
      active: adjustColor(barbershopPrimaryColor, resolvedTheme === 'light' ? -30 : 30),
      disabled: adjustColor(barbershopPrimaryColor + 'ff', -200),
    }
  }, [barbershopPrimaryColor, resolvedTheme])

  const value = {
    theme,
    setTheme: (t: Theme) => {
      localStorage.setItem(storageKey, t)
      setTheme(t)
    },
    tokens,
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export default ThemeProvider
