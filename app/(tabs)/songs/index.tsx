'use client'

import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useSongsStore } from '@/stores/songs'
import { useDatabase, useCollections } from '@/hooks/useWatermelon'
import { Button, Card, Input, Badge } from '@/components/ui'
import { useTheme } from '@/hooks/useTheme'
import { KEYS } from '@/constants'
import type { Song } from '@/types'

export default function SongsScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { songs, searchQuery, filterKey, filterArtist, setSongs, setSearchQuery, setFilterKey, setFilterArtist, getFilteredSongs, addSong, updateSong, deleteSong } = useSongsStore()
  const { songsCollection, isReady } = useCollections()
  const [refreshing, setRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (isReady && songsCollection) {
      loadSongs()
    }
  }, [isReady, songsCollection])

  const loadSongs = async () => {
    if (!songsCollection) return
    const allSongs = await songsCollection.query().fetch()
    const mapped = allSongs.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      key: s.key,
      originalKey: s.originalKey,
      bpm: s.bpm,
      timeSignature: s.timeSignature,
      duration: s.duration,
      capo: s.capo,
      tuning: s.tuning,
      lyricChordPro: s.lyricChordPro,
      notes: s.notes,
      sections: s.sections,
      audioRef: s.audioRef,
      youtubeUrl: s.youtubeUrl,
      spotifyUrl: s.spotifyUrl,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }))
    setSongs(mapped)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadSongs()
    setRefreshing(false)
  }

  const filteredSongs = getFilteredSongs()
  const artists = [...new Set(songs.map((s) => s.artist).filter(Boolean))] as string[]

  const handleDelete = async (id: string) => {
    if (!songsCollection) return
    const record = await songsCollection.find(id)
    await record.destroyPermanently()
    loadSongs()
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Canciones</Text>
        <Button variant="primary" size="sm" onPress={() => router.push('/songs/new')}>
          +
        </Button>
      </View>

      <Input
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar por título o artista..."
        style={styles.searchInput}
      />

      {showFilters && (
        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Tonalidad</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { backgroundColor: filterKey === null ? colors.primary : colors.surfaceVariant },
                  { borderColor: filterKey === null ? colors.primary : colors.border },
                ]}
                onPress={() => setFilterKey(null)}
              >
                <Text style={[styles.filterChipText, { color: filterKey === null ? '#fff' : colors.text }]}>Todas</Text>
              </TouchableOpacity>
              {KEYS.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterChip,
                    { backgroundColor: filterKey === key ? colors.primary : colors.surfaceVariant },
                    { borderColor: filterKey === key ? colors.primary : colors.border },
                  ]}
                  onPress={() => setFilterKey(filterKey === key ? null : key)}
                >
                  <Text style={[styles.filterChipText, { color: filterKey === key ? '#fff' : colors.text }]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Artista</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { backgroundColor: filterArtist === null ? colors.primary : colors.surfaceVariant },
                  { borderColor: filterArtist === null ? colors.primary : colors.border },
                ]}
                onPress={() => setFilterArtist(null)}
              >
                <Text style={[styles.filterChipText, { color: filterArtist === null ? '#fff' : colors.text }]}>Todos</Text>
              </TouchableOpacity>
              {artists.slice(0, 5).map((artist) => (
                <TouchableOpacity
                  key={artist}
                  style={[
                    styles.filterChip,
                    { backgroundColor: filterArtist === artist ? colors.primary : colors.surfaceVariant },
                    { borderColor: filterArtist === artist ? colors.primary : colors.border },
                  ]}
                  onPress={() => setFilterArtist(filterArtist === artist ? null : artist)}
                >
                  <Text style={[styles.filterChipText, { color: filterArtist === artist ? '#fff' : colors.text }]}>{artist}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <View style={styles.filterToggle}>
        <Button variant="ghost" size="sm" onPress={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </View>

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/songs/${item.id}`)}
            activeOpacity={0.8}
          >
            <Card style={styles.songCard}>
              <View style={styles.songHeader}>
                <View style={styles.songTitleContainer}>
                  <Text style={[styles.songTitle, { color: colors.text }]}>{item.title}</Text>
                  {item.artist && <Text style={[styles.songArtist, { color: colors.textSecondary }]}>{item.artist}</Text>}
                </View>
                <View style={styles.songMeta}>
                  <Badge variant="primary">{item.key}</Badge>
                  {item.bpm && <Badge variant="default">{item.bpm} BPM</Badge>}
                  {item.capo && item.capo > 0 && <Badge variant="warning">Capo {item.capo}</Badge>}
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay canciones</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Toca el + para añadir tu primera canción</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700' },
  searchInput: { marginHorizontal: 16, marginBottom: 8 },
  filtersRow: { paddingHorizontal: 16, marginBottom: 8, gap: 16 },
  filterGroup: { flex: 1, gap: 6 },
  filterLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: '500' },
  filterToggle: { paddingHorizontal: 16, marginBottom: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { marginBottom: 8 },
  songCard: { padding: 12 },
  songHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  songTitleContainer: { flex: 1 },
  songTitle: { fontSize: 18, fontWeight: '600' },
  songArtist: { fontSize: 14, marginTop: 2 },
  songMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  separator: { height: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
})