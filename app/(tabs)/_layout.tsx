import { Tabs } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function TabsLayout() {
  const { colors } = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="songs" options={{ title: 'Canciones', tabBarIcon: ({ color, size }) => <TabIcon name="music" color={color} size={size} /> }} />
      <Tabs.Screen name="setlists" options={{ title: 'Setlists', tabBarIcon: ({ color, size }) => <TabIcon name="list" color={color} size={size} /> }} />
      <Tabs.Screen name="rehearsal" options={{ title: 'Ensayo', tabBarIcon: ({ color, size }) => <TabIcon name="play" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarIcon: ({ color, size }) => <TabIcon name="settings" color={color} size={size} /> }} />
    </Tabs>
  )
}

function TabIcon({ name, color, size }: { name: string; color: any; size: number }) {
  const colorStr = typeof color === 'number' ? '#000000' : (color as string)
  const icons: Record<string, React.ReactNode> = {
    music: <View style={[styles.icon, { width: size, height: size }]}><Text style={{ color: colorStr, fontSize: size * 0.6, textAlign: 'center', lineHeight: size * 0.8 }}>♪</Text></View>,
    list: <View style={[styles.icon, { width: size, height: size }]}><Text style={{ color: colorStr, fontSize: size * 0.6, textAlign: 'center', lineHeight: size * 0.8 }}>≡</Text></View>,
    play: <View style={[styles.icon, { width: size, height: size }]}><Text style={{ color: colorStr, fontSize: size * 0.6, textAlign: 'center', lineHeight: size * 0.8 }}>▶</Text></View>,
    settings: <View style={[styles.icon, { width: size, height: size }]}><Text style={{ color: colorStr, fontSize: size * 0.6, textAlign: 'center', lineHeight: size * 0.8 }}>⚙</Text></View>,
  }
  return icons[name] || null
}

const styles = StyleSheet.create({
  icon: { justifyContent: 'center', alignItems: 'center' },
})