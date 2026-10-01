'use client'

import React, { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { DatabaseProvider } from '@/hooks/useWatermelon'
import { ThemeProvider } from '@/hooks/useTheme'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  )
}