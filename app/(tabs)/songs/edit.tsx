'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSongsStore } from '@/stores/songs'
import { useDatabase, useCollections } from '@/hooks/useWatermelon'
import { Button, Card, Input, Badge } from '@/components/ui'
import { useTheme } from '@/hooks/useTheme'
import { KEYS, TIME_SIGNATURES } from '@/constants'
import { parseChordPro, renderChordPro } from '@/utils/chordpro'

type SongFormData = {
  title: string
  artist: string
  key: string
  bpm: string
  timeSignature: string
  duration: string
  capo: string
  tuning: string
  lyricChordPro: string
  notes: string
  youtubeUrl: string
  spotifyUrl: string
}

const initialFormData: SongFormData = {
  title: '',
  artist: '',
  key: 'C',
  bpm: '120',
  timeSignature: '4/4',
  duration: '',
  capo: '0',
  tuning: 'EADGBE',
  lyricChordPro: '',
  notes: '',
  youtubeUrl: '',
  spotifyUrl: '',
}

export default function EditSongScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { songsCollection, isReady } = useCollections()
  const { updateSong } = useSongsStore()
  const params = useLocalSearchParams()
  const songId = params.id as string

  const [formData, setFormData] = useState<SongFormData>(initialFormData)
  const [parsedPreview, setParsedPreview] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isReady && songsCollection && songId) {
      loadSong()
    }
  }, [isReady, songsCollection, songId])

  const loadSong = async () => {
    if (!songsCollection) return
    try {
      const record = await songsCollection.find(songId)
      setFormData({
        title: (record as any).title,
        artist: (record as any).artist || '',
        key: (record as any).key,
        bpm: (record as any).bpm?.toString() || '120',
        timeSignature: (record as any).timeSignature || '4/4',
        duration: (record as any).duration?.toString() || '',
        capo: (record as any).capo?.toString() || '0',
        tuning: (record as any).tuning || 'EADGBE',
        lyricChordPro: (record as any).lyricChordPro || '',
        notes: (record as any).notes || '',
        youtubeUrl: (record as any).youtubeUrl || '',
        spotifyUrl: (record as any).spotifyUrl || '',
      })
      setLoading(false)
    } catch (e) {
      console.error('Error loading song:', e)
      setLoading(false)
    }
  }

  const updateField = (field: keyof SongFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleChordProChange = (text: string) => {
    updateField('lyricChordPro', text)
    if (text.trim()) {
      try {
        const parsed = parseChordPro(text)
        setParsedPreview(renderChordPro(parsed))
      } catch {
        setParsedPreview('Error al analizar ChordPro')
      }
    } else {
      setParsedPreview('')
    }
  }

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'El título es obligatorio'
    if (!KEYS.includes(formData.key as any)) return 'Tonalidad inválida'
    const bpm = parseInt(formData.bpm, 10)
    if (isNaN(bpm) || bpm < 40 || bpm > 280) return 'BPM debe estar entre 40 y 280'
    return null
  }

  const handleSave = async () => {
    const error = validateForm()
    if (error) {
      Alert.alert('Error', error)
      return
    }

    setSaving(true)
    try {
      const now = new Date()
      const songData = {
        title: formData.title.trim(),
        artist: formData.artist.trim() || undefined,
        key: formData.key,
        originalKey: formData.key,
        bpm: parseInt(formData.bpm, 10) || 120,
        timeSignature: formData.timeSignature,
        duration: formData.duration ? parseInt(formData.duration, 10) : undefined,
        capo: parseInt(formData.capo, 10) || 0,
        tuning: formData.tuning,
        lyricChordPro: formData.lyricChordPro,
        notes: formData.notes || undefined,
        youtubeUrl: formData.youtubeUrl || undefined,
        spotifyUrl: formData.spotifyUrl || undefined,
        updatedAt: now,
      }

      if (songsCollection) {
        const record = await songsCollection.find(songId)
        await record.update((s) => {
          Object.assign(s, songData)
        })
      }

      updateSong(songId, songData as any)
      router.back()
    } catch (e) {
      console.error('Error saving song:', e)
      Alert.alert('Error', 'No se pudo guardar la canción')
    } finally {
      setSaving(false)
    }
  }

  const handleImportChordPro = () => {
    Alert.prompt('Importar ChordPro', 'Pega el contenido del archivo .cho/.pro', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Importar', onPress: (text: string | undefined) => text && handleChordProChange(text) },
    ], 'plain-text')
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={{ color: colors.textMuted }}>Cargando...</Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            Cancelar
          </Button>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Editar Canción</Text>
          <Button variant="primary" size="sm" onPress={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </View>

        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Básica</Text>
          <Input
            label="Título *"
            value={formData.title}
            onChangeText={(t) => updateField('title', t)}
            placeholder="Nombre de la canción"
          />
          <Input
            label="Artista"
            value={formData.artist}
            onChangeText={(t) => updateField('artist', t)}
            placeholder="Artista o banda original"
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Tonalidad *"
                value={formData.key}
                onChangeText={(t) => updateField('key', t.toUpperCase())}
                placeholder="C"
              />
            </View>
            <View style={styles.half}>
              <Input
                label="BPM"
                value={formData.bpm}
                onChangeText={(t) => updateField('bpm', t)}
                placeholder="120"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Compás"
                value={formData.timeSignature}
                onChangeText={(t) => updateField('timeSignature', t)}
                placeholder="4/4"
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Duración (seg)"
                value={formData.duration}
                onChangeText={(t) => updateField('duration', t)}
                placeholder="240"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Capo"
                value={formData.capo}
                onChangeText={(t) => updateField('capo', t)}
                placeholder="0"
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Afinación"
                value={formData.tuning}
                onChangeText={(t) => updateField('tuning', t)}
                placeholder="EADGBE"
              />
            </View>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Letra con Acordes (ChordPro)</Text>
            <Button variant="ghost" size="sm" onPress={handleImportChordPro}>
              Importar .cho/.pro
            </Button>
          </View>
          <Input
            multiline
            numberOfLines={15}
            value={formData.lyricChordPro}
            onChangeText={handleChordProChange}
            placeholder={`{title: Mi Canción}
{artist: Mi Banda}
{key: G}
{tempo: 120}
{time: 4/4}

{start_of_verse}
[G]Esta es la [C]primera [D]estrofa
Con [G]acordes en [C]línea
{end_of_verse}

{start_of_chorus}
[G]Este es el [D]coro [Em]que [C]suena
[G]Muy [D]bien [C]juntos
{end_of_chorus}`}
          />
          <View style={styles.previewToggle}>
            <Button variant="outline" size="sm" onPress={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}
            </Button>
          </View>
          {showPreview && parsedPreview && (
            <View style={[styles.previewArea, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ fontFamily: 'monospace', fontSize: 14, color: colors.text }}>{parsedPreview}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Enlaces de Referencia</Text>
          <Input
            label="YouTube URL"
            value={formData.youtubeUrl}
            onChangeText={(t) => updateField('youtubeUrl', t)}
            placeholder="https://youtube.com/watch?v=..."
          />
          <Input
            label="Spotify URL"
            value={formData.spotifyUrl}
            onChangeText={(t) => updateField('spotifyUrl', t)}
            placeholder="https://open.spotify.com/track/..."
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notas</Text>
          <Input
            multiline
            numberOfLines={4}
            value={formData.notes}
            onChangeText={(t) => updateField('notes', t)}
            placeholder="Notas personales, arreglos, recordatorios..."
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 20, fontWeight: '700' },
  sectionCard: { marginHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  previewToggle: { marginTop: 12 },
  previewArea: { padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 12, maxHeight: 300 },
})

import { StyleSheet } from 'react-native'