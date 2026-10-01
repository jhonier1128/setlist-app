import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { medleySongs, medleys, songs } from "@/db/schema";
import type { MedleyDTO, SongDTO } from "./types";
import type { Voice } from "./music";

export function toSongDTO(s: typeof songs.$inferSelect): SongDTO {
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    keyMale: s.keyMale,
    keyFemale: s.keyFemale,
    rhythm: s.rhythm,
    bpm: s.bpm,
    notes: s.notes,
  };
}

export async function getSongs(userId: number): Promise<SongDTO[]> {
  const rows = await db.select().from(songs).where(eq(songs.userId, userId)).orderBy(asc(songs.title));
  return rows.map(toSongDTO);
}

export async function getMedleys(userId: number): Promise<MedleyDTO[]> {
  const ms = await db.select().from(medleys).where(eq(medleys.userId, userId)).orderBy(asc(medleys.name));
  if (ms.length === 0) return [];
  const links = await db
    .select({ link: medleySongs, song: songs })
    .from(medleySongs)
    .innerJoin(songs, eq(songs.id, medleySongs.songId))
    .where(
      inArray(
        medleySongs.medleyId,
        ms.map((m) => m.id),
      ),
    )
    .orderBy(asc(medleySongs.position));
  return ms.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    voice: m.voice as Voice,
    baseKey: m.baseKey,
    transpose: m.transpose,
    songs: links.filter((l) => l.link.medleyId === m.id).map((l) => toSongDTO(l.song)),
  }));
}

export async function getMedley(userId: number, id: number): Promise<MedleyDTO | null> {
  const all = await getMedleys(userId);
  return all.find((m) => m.id === id) ?? null;
}
