'use client'

import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

export default function RehearsalScreen() {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.placeholder}>
        <Text style={[styles.placeholderText, { color: colors.text }]}>Modo Ensayo</Text>
        <Text style={[styles.placeholderSubtext, { color: colors.textMuted }]}>Próximamente: Auto-scroll, transposición en vivo, metrónomo</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  placeholder: { alignItems: 'center', gap: 8 },
  placeholderText: { fontSize: 24, fontWeight: '700' },
  placeholderSubtext: { fontSize: 14, textAlign: 'center' },
})

import { StyleSheet } from 'react-native'