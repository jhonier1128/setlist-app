'use client'

import React from 'react'
import { View, Text, ScrollView, Switch, StyleSheet, TouchableOpacity } from 'react-native'
import { useSettingsStore } from '@/stores/settings'
import { useTheme } from '@/hooks/useTheme'
import { Card } from '@/components/ui'

export default function SettingsScreen() {
  const { colors } = useTheme()
  const {
    theme,
    setTheme,
    defaultFontSize,
    setDefaultFontSize,
    defaultAutoScrollSpeed,
    setDefaultAutoScrollSpeed,
    defaultMetronomeBpm,
    setDefaultMetronomeBpm,
    defaultMetronomeTimeSignature,
    setDefaultMetronomeTimeSignature,
    enableHaptics,
    setEnableHaptics,
    autoTransposeCapo,
    setAutoTransposeCapo,
    showChordDiagrams,
    setShowChordDiagrams,
    backupEnabled,
    setBackupEnabled,
    backupFrequency,
    setBackupFrequency,
  } = useSettingsStore()

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Tema</Text>
            <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Claro, oscuro o sistema</Text>
          </View>
          <View style={styles.segmentedControl}>
            {(['light', 'dark', 'system'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.segment,
                  theme === t && { backgroundColor: colors.primary },
                  t === 'light' && styles.segmentFirst,
                  t === 'system' && styles.segmentLast,
                ]}
                onPress={() => setTheme(t)}
              >
                <Text style={[styles.segmentText, { color: theme === t ? '#fff' : colors.text }]}>{t === 'light' ? 'Claro' : t === 'dark' ? 'Oscuro' : 'Sistema'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ensayo por Defecto</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Tamaño de fuente</Text>
            <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Tamaño inicial en modo ensayo</Text>
          </View>
          <View style={styles.segmentedControl}>
            {(['small', 'medium', 'large'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.segment,
                  defaultFontSize === s && { backgroundColor: colors.primary },
                  s === 'small' && styles.segmentFirst,
                  s === 'large' && styles.segmentLast,
                ]}
                onPress={() => setDefaultFontSize(s)}
              >
                <Text style={[styles.segmentText, { color: defaultFontSize === s ? '#fff' : colors.text }]}>{s === 'small' ? 'Pequeño' : s === 'medium' ? 'Mediano' : 'Grande'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Velocidad auto-scroll</Text>
            <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Velocidad inicial del scroll automático</Text>
          </View>
          <View style={styles.selectWrapper}>
            <Text style={[styles.selectText, { color: colors.text }]}>{defaultAutoScrollSpeed}x</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>BPM metrónomo</Text>
            <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Tempo por defecto</Text>
          </View>
          <View style={styles.selectWrapper}>
            <Text style={[styles.selectText, { color: colors.text }]}>{defaultMetronomeBpm}</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Compás metrónomo</Text>
            <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Compás por defecto</Text>
          </View>
          <View style={styles.selectWrapper}>
            <Text style={[styles.selectText, { color: colors.text }]}>{defaultMetronomeTimeSignature}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Comportamiento</Text>
        <SettingToggle
          label="Retroalimentación háptica"
          description="Vibración al tocar botones"
          value={enableHaptics}
          onChange={setEnableHaptics}
        />
        <SettingToggle
          label="Transponer con capo automáticamente"
          description="Ajusta tonalidad al cambiar capo"
          value={autoTransposeCapo}
          onChange={setAutoTransposeCapo}
        />
        <SettingToggle
          label="Mostrar diagramas de acordes"
          description="Diagramas visuales en la letra"
          value={showChordDiagrams}
          onChange={setShowChordDiagrams}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Respaldo</Text>
        <SettingToggle
          label="Respaldos automáticos"
          description="Guardar copia de seguridad periódica"
          value={backupEnabled}
          onChange={setBackupEnabled}
        />
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Frecuencia</Text>
            <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Cada cuánto hacer respaldo</Text>
          </View>
          <View style={styles.segmentedControl}>
            {(['daily', 'weekly', 'manual'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.segment,
                  backupFrequency === f && { backgroundColor: colors.primary },
                  f === 'daily' && styles.segmentFirst,
                  f === 'manual' && styles.segmentLast,
                ]}
                onPress={() => setBackupFrequency(f)}
              >
                <Text style={[styles.segmentText, { color: backupFrequency === f ? '#fff' : colors.text }]}>{f === 'daily' ? 'Diario' : f === 'weekly' ? 'Semanal' : 'Manual'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Acerca de</Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Versión</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Plataforma</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>React Native + Expo</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Base de datos</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>WatermelonDB (SQLite)</Text>
        </View>
      </Card>
    </ScrollView>
  )
}

function SettingToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  const { colors } = useTheme()
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.settingDescription, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? colors.primary : colors.border}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100, gap: 16 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '500' },
  settingDescription: { fontSize: 12, marginTop: 2 },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 10, padding: 2 },
  segment: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  segmentFirst: { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  segmentLast: { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  segmentText: { fontSize: 13, fontWeight: '600' },
  selectWrapper: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e2e8f0', borderRadius: 8, minWidth: 80, alignItems: 'center' },
  selectText: { fontSize: 16, fontWeight: '600', fontFamily: 'monospace' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14, fontWeight: '500', fontFamily: 'monospace' },
})