import { createContext, useContext } from 'react'

export type Theme = 'dark' | 'light' | 'system'

export type ThemeTokens = {
  primary: string
  onPrimary: string

  background: string
  onBackground: string

  border: string
  hover: string
  active: string
  disabled: string
}

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  tokens: ThemeTokens
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  tokens: {
    primary: '#000000',
    onPrimary: '#FFFFFF',

    background: '#FFFFFF',
    onBackground: '#000000',

    border: '#E0E0E0',
    hover: '#333333',
    active: '#222222',
    disabled: '#AAAAAA',
  },
}

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (!context) {
    throw new Error('useTheme não pode ser usado sem o ThemeProvider')
  }

  return context
}
