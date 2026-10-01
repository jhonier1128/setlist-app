import type { Voice } from "./music";

export type SongDTO = {
  id: number;
  title: string;
  artist: string;
  keyMale: string;
  keyFemale: string;
  rhythm: string;
  bpm: number | null;
  notes: string;
};

export type MedleyDTO = {
  id: number;
  name: string;
  description: string;
  voice: Voice;
  baseKey: string;
  transpose: number;
  songs: SongDTO[]; // ordered by position
};

export type UserDTO = {
  id: number;
  name: string;
  email: string;
  role: string;
};
