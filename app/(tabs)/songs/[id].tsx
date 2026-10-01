'use client'

import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Alert, Linking, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSongsStore } from '@/stores/songs'
import { useDatabase, useCollections } from '@/hooks/useWatermelon'
import { Button, Card, Badge, Modal } from '@/components/ui'
import { useTheme } from '@/hooks/useTheme'
import { parseChordPro, transposeSong, renderChordPro } from '@/utils/chordpro'
import { KEYS } from '@/constants'

export default function SongDetailScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { songsCollection, isReady } = useCollections()
  const { deleteSong } = useSongsStore()
  const params = useLocalSearchParams()
  const songId = params.id as string

  const [song, setSong] = useState<any>(null)
  const [parsed, setParsed] = useState<any>(null)
  const [transposed, setTransposed] = useState<any>(null)
  const [transpose, setTranspose] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
      const songData = {
        id: record.id,
        title: (record as any).title,
        artist: (record as any).artist,
        key: (record as any).key,
        originalKey: (record as any).originalKey,
        bpm: (record as any).bpm,
        timeSignature: (record as any).timeSignature,
        duration: (record as any).duration,
        capo: (record as any).capo,
        tuning: (record as any).tuning,
        lyricChordPro: (record as any).lyricChordPro,
        notes: (record as any).notes,
        youtubeUrl: (record as any).youtubeUrl,
        spotifyUrl: (record as any).spotifyUrl,
        createdAt: (record as any).createdAt,
        updatedAt: (record as any).updatedAt,
      }
      setSong(songData)
      if (songData.lyricChordPro) {
        const p = parseChordPro(songData.lyricChordPro)
        setParsed(p)
        setTransposed(p)
      }
      setLoading(false)
    } catch (e) {
      console.error('Error loading song:', e)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (parsed) {
      const t = transposeSong(parsed, transpose)
      setTransposed(t)
    }
  }, [parsed, transpose])

  const handleOpenUrl = (url?: string) => {
    if (url) Linking.openURL(url)
  }

  const handleDelete = async () => {
    if (!songsCollection) return
    try {
      const record = await songsCollection.find(songId)
      await record.destroyPermanently()
      deleteSong(songId)
      router.back()
    } catch (e) {
      console.error('Error deleting song:', e)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
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

  if (!song) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={{ color: colors.text }}>Canción no encontrada</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            ←
          </Button>
          <View style={styles.headerCenter} />
          <View style={styles.headerActions}>
            <Button variant="ghost" size="sm" onPress={() => router.push(`/songs/${songId}/edit`)}>
              Editar
            </Button>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoMain}>
              <Text style={[styles.songTitle, { color: colors.text }]}>{song.title}</Text>
              {song.artist && <Text style={[styles.songArtist, { color: colors.textSecondary }]}>{song.artist}</Text>}
            </View>
            <View style={styles.infoBadges}>
              <Badge variant="primary" style={{ fontSize: 16, paddingHorizontal: 12, paddingVertical: 6 }}>
                {song.key}
              </Badge>
            </View>
          </View>

          <View style={styles.metaRow}>
            {song.bpm && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>BPM</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{song.bpm}</Text>
              </View>
            )}
            {song.timeSignature && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Compás</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{song.timeSignature}</Text>
              </View>
            )}
            {song.duration && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Duración</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{formatDuration(song.duration)}</Text>
              </View>
            )}
            {song.capo && song.capo > 0 && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Capo</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{song.capo}</Text>
              </View>
            )}
            {song.tuning && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Afinación</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{song.tuning}</Text>
              </View>
            )}
          </View>

          <View style={styles.linksRow}>
            {song.youtubeUrl && (
              <Button variant="outline" size="sm" onPress={() => handleOpenUrl(song.youtubeUrl)}>
                YouTube
              </Button>
            )}
            {song.spotifyUrl && (
              <Button variant="outline" size="sm" onPress={() => handleOpenUrl(song.spotifyUrl)}>
                Spotify
              </Button>
            )}
          </View>
        </Card>

        {song.lyricChordPro && transposed && (
          <Card style={styles.chordCard}>
            <View style={styles.chordHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Letra y Acordes</Text>
              <View style={styles.transposeControls}>
                <Button variant="ghost" size="sm" onPress={() => setTranspose((t) => Math.max(-11, t - 1))}>
                  −
                </Button>
                <View style={styles.transposeDisplay}>
                  <Text style={[styles.transposeValue, { color: colors.text }]}>
                    {transpose === 0 ? 'Original' : transpose > 0 ? `+${transpose}` : `${transpose}`}
                  </Text>
                  <Text style={[styles.transposeKey, { color: colors.textSecondary }]}>
                    → {transposed.key}
                  </Text>
                </View>
                <Button variant="ghost" size="sm" onPress={() => setTranspose((t) => Math.min(11, t + 1))}>
                  +
                </Button>
                <Button variant="outline" size="sm" onPress={() => setTranspose(0)}>
                  Reset
                </Button>
              </View>
            </View>

            <View style={[styles.chordContent, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={{ fontFamily: 'monospace', fontSize: 16, lineHeight: 26, color: colors.text }}>
                {renderChordPro(transposed)}
              </Text>
            </View>
          </Card>
        )}

        {song.notes && (
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notas</Text>
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>{song.notes}</Text>
          </Card>
        )}

        <Modal visible={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Eliminar canción</Text>
          <Text style={[styles.modalText, { color: colors.textSecondary }]}>
            ¿Estás seguro de que quieres eliminar "{song.title}"? Esta acción no se puede deshacer.
          </Text>
          <View style={styles.modalActions}>
            <Button variant="ghost" onPress={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onPress={handleDelete}>
              Eliminar
            </Button>
          </View>
        </Modal>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerCenter: { flex: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  infoCard: { marginHorizontal: 16, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  infoMain: { flex: 1 },
  songTitle: { fontSize: 24, fontWeight: '700' },
  songArtist: { fontSize: 16, marginTop: 4 },
  infoBadges: { flexDirection: 'row', gap: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 12 },
  metaItem: { gap: 4 },
  metaLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 14, fontWeight: '500' },
  linksRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chordCard: { marginHorizontal: 16, marginBottom: 16 },
  chordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  transposeControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  transposeDisplay: { paddingHorizontal: 12 },
  transposeValue: { fontSize: 16, fontWeight: '700', fontFamily: 'monospace' },
  transposeKey: { fontSize: 12 },
  chordContent: { padding: 16, borderRadius: 8, borderWidth: 1 },
  sectionCard: { marginHorizontal: 16, marginBottom: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  notesText: { fontSize: 14, lineHeight: 22 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  modalText: { fontSize: 14, marginBottom: 16, lineHeight: 22 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
})