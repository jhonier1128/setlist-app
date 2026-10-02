import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { medleySongs, medleys, songs, users } from "@/db/schema";

type Seed = {
  title: string;
  artist: string;
  keyMale: string;
  keyFemale: string;
  rhythm: string;
  bpm: number;
  notes: string;
};

const SEED_SONGS: Seed[] = [
  { title: "Océanos (Donde mis pies pueden fallar)", artist: "Hillsong United", keyMale: "D", keyFemale: "G", rhythm: "Lento", bpm: 66, notes: "Intro con pad y piano suave. Puente crece con toda la banda." },
  { title: "Sublime Gracia", artist: "Tradicional", keyMale: "G", keyFemale: "C", rhythm: "6/8", bpm: 72, notes: "Acompañamiento en arpegios. Última estrofa a capela." },
  { title: "Cuán Grande es Él", artist: "Tradicional", keyMale: "G", keyFemale: "C", rhythm: "Lento", bpm: 70, notes: "Coro en dinámica fuerte." },
  { title: "Way Maker (Camino en el desierto)", artist: "Sinach", keyMale: "E", keyFemale: "A", rhythm: "Lento", bpm: 68, notes: "Repetir el puente 3 veces, subir intensidad." },
  { title: "Renuévame", artist: "Marcos Witt", keyMale: "D", keyFemale: "G", rhythm: "Lento", bpm: 64, notes: "Solo piano en la primera estrofa." },
  { title: "Tu Fidelidad", artist: "Marcos Witt", keyMale: "G", keyFemale: "C", rhythm: "Medio", bpm: 84, notes: "" },
  { title: "Sobre Todo", artist: "Michael W. Smith", keyMale: "D", keyFemale: "G", rhythm: "Lento", bpm: 62, notes: "Ideal para cierre de la adoración." },
  { title: "Yo Me Rindo", artist: "Tradicional", keyMale: "D", keyFemale: "G", rhythm: "Lento", bpm: 60, notes: "Momento de ministración." },
  { title: "Abre mis ojos", artist: "Paul Baloche", keyMale: "G", keyFemale: "C", rhythm: "Lento", bpm: 68, notes: "" },
  { title: "Hosanna", artist: "Hillsong", keyMale: "E", keyFemale: "A", rhythm: "Medio", bpm: 76, notes: "Dinámica baja en la estrofa." },
  { title: "Bondad de Dios", artist: "Bethel Music", keyMale: "A", keyFemale: "D", rhythm: "Medio", bpm: 64, notes: "La vocalista lleva la primera estrofa." },
  { title: "Amor Desmedido", artist: "Cory Asbury", keyMale: "C", keyFemale: "F", rhythm: "Medio", bpm: 82, notes: "" },
  { title: "Poderoso para Salvar", artist: "Hillsong", keyMale: "A", keyFemale: "D", rhythm: "Medio", bpm: 70, notes: "" },
  { title: "Levanto mis manos", artist: "Miel San Marcos", keyMale: "C", keyFemale: "F", rhythm: "Rápido", bpm: 120, notes: "Canción de apertura, mucha energía." },
  { title: "Bendice, alma mía", artist: "Matt Redman", keyMale: "G", keyFemale: "C", rhythm: "Rápido", bpm: 112, notes: "Coro a dos voces." },
  { title: "Bendito sea tu nombre", artist: "Matt Redman", keyMale: "A", keyFemale: "D", rhythm: "Rápido", bpm: 110, notes: "" },
  { title: "Santo, Santo, Santo", artist: "Tradicional", keyMale: "D", keyFemale: "G", rhythm: "Lento", bpm: 66, notes: "Solo órgano/pad al inicio." },
];

const SEED_MEDLEYS: {
  name: string;
  description: string;
  voice: "male" | "female";
  baseKey: string;
  titles: string[];
}[] = [
  {
    name: "Adoración en Re",
    description: "Bloque de ministración para voz masculina, flujo continuo sin pausas.",
    voice: "male",
    baseKey: "D",
    titles: ["Renuévame", "Océanos (Donde mis pies pueden fallar)", "Sobre Todo", "Yo Me Rindo"],
  },
  {
    name: "Celebración en Sol",
    description: "Para subir el ánimo antes de la Palabra.",
    voice: "male",
    baseKey: "G",
    titles: ["Tu Fidelidad", "Bendice, alma mía", "Cuán Grande es Él"],
  },
  {
    name: "Noche de Gracia (Mujer)",
    description: "Popurrí para vocalista, tonalidad en Do. Probado en servicio de domingo.",
    voice: "female",
    baseKey: "C",
    titles: ["Sublime Gracia", "Abre mis ojos", "Cuán Grande es Él"],
  },
];

/** Carga canciones y popurrís de ejemplo. Nunca lanza: los fallos se reportan. */
export async function seedUserData(userId: number) {
  const inserted = await db
    .insert(songs)
    .values(SEED_SONGS.map((s) => ({ ...s, userId })))
    .returning();
  const byTitle = new Map(inserted.map((s) => [s.title, s.id]));

  for (const m of SEED_MEDLEYS) {
    const [row] = await db
      .insert(medleys)
      .values({
        userId,
        name: m.name,
        description: m.description,
        voice: m.voice,
        baseKey: m.baseKey,
        transpose: 0,
      })
      .returning();
    const links = m.titles
      .map((t, i) => ({ medleyId: row.id, songId: byTitle.get(t), position: i }))
      .filter((l): l is { medleyId: number; songId: number; position: number } => Boolean(l.songId));
    if (links.length) await db.insert(medleySongs).values(links);
  }
}

export const DEMO_EMAIL = "demo@alabanza.app";
export const DEMO_PASSWORD = "alabanza123";

export async function ensureDemoUser(): Promise<number> {
  const existing = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (existing[0]) return existing[0].id;
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [u] = await db
    .insert(users)
    .values({ name: "Daniel Ramírez", email: DEMO_EMAIL, passwordHash, role: "pianista" })
    .onConflictDoNothing()
    .returning();
  if (!u) {
    const again = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
    return again[0].id;
  }
  await seedUserData(u.id);
  return u.id;
}
