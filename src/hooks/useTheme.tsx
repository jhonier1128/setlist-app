'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { useSettingsStore } from '@/stores/settings'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  colors: ThemeColors
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const lightColors: ThemeColors = {
  primary: '#0ea5e9',
  primaryLight: '#38bdf8',
  primaryDark: '#0284c7',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  border: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  overlay: 'rgba(0,0,0,0.5)',
  backdrop: 'rgba(0,0,0,0.3)',
}

const darkColors: ThemeColors = {
  primary: '#38bdf8',
  primaryLight: '#7dd3fc',
  primaryDark: '#0ea5e9',
  background: '#0f0f1a',
  surface: '#1a1a2e',
  surfaceVariant: '#16213e',
  border: '#2d2d44',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  error: '#f87171',
  success: '#4ade80',
  warning: '#fbbf24',
  overlay: 'rgba(0,0,0,0.7)',
  backdrop: 'rgba(0,0,0,0.5)',
}

interface ThemeColors {
  primary: string
  primaryLight: string
  primaryDark: string
  background: string
  surface: string
  surfaceVariant: string
  border: string
  text: string
  textSecondary: string
  textMuted: string
  error: string
  success: string
  warning: string
  overlay: string
  backdrop: string
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useColorScheme()
  const { theme: storedTheme, setTheme: setStoredTheme } = useSettingsStore()
  const [theme, setTheme] = useState<Theme>(storedTheme === 'system' ? (systemTheme === 'dark' ? 'dark' : 'light') : storedTheme)
  const [colors, setColors] = useState<ThemeColors>(theme === 'dark' ? darkColors : lightColors)

  useEffect(() => {
    if (storedTheme === 'system') {
      const newTheme = systemTheme === 'dark' ? 'dark' : 'light'
      setTheme(newTheme)
      setColors(newTheme === 'dark' ? darkColors : lightColors)
    }
  }, [systemTheme, storedTheme])

  useEffect(() => {
    if (storedTheme !== 'system') {
      setTheme(storedTheme)
      setColors(storedTheme === 'dark' ? darkColors : lightColors)
    }
  }, [storedTheme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setColors(newTheme === 'dark' ? darkColors : lightColors)
    setStoredTheme(newTheme)
  }

  const setThemeDirect = (newTheme: Theme) => {
    setTheme(newTheme)
    setColors(newTheme === 'dark' ? darkColors : lightColors)
    setStoredTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme: setThemeDirect }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}