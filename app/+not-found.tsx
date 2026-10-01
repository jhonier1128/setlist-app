'use client'

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui'

export default function NotFoundScreen() {
  const router = useRouter()
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.code, { color: colors.text }]}>404</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>Pantalla no encontrada</Text>
        <Button variant="primary" onPress={() => router.replace('/(tabs)/songs')}>
          Ir a Canciones
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  content: { alignItems: 'center', gap: 16 },
  code: { fontSize: 72, fontWeight: '700', fontFamily: 'monospace' },
  message: { fontSize: 18 },
})