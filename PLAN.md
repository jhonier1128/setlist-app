# Setlist App — Plan de Desarrollo

## Stack Confirmado
- **Framework**: React Native + Expo (SDK 51+)
- **Routing**: Expo Router (file-based, tabs + stack)
- **Estado**: Zustand
- **DB Local**: WatermelonDB (SQLite reactivo, offline-first)
- **UI**: NativeWind (Tailwind CSS) + Radix UI primitives adaptados
- **Tests**: Vitest + React Native Testing Library
- **CI/CD**: EAS Build + GitHub Actions
- **TypeScript**: Strict mode

---

## Modelo de Datos (WatermelonDB)

```typescript
// Song
id, title, artist, key, originalKey, bpm, timeSignature, duration, capo, tuning
lyricChordPro, notes, sections[], audioRef, youtubeUrl, spotifyUrl
createdAt, updatedAt

// Setlist
id, name, description, songOrder[], estimatedDuration, createdAt, updatedAt

// SetlistSong (join con orden)
id, setlistId, songId, position, customKey, notes

// RehearsalSession
id, setlistId, date, duration, notes, songsPlayed[]
```

---

## Hitos (Milestones)

### M0 — Setup & Fundación (Semana 1)
- [ ] `expo init` + TypeScript + NativeWind + WatermelonDB config
- [ ] Estructura de carpetas, ESLint/Prettier, Husky pre-commit
- [ ] Tema oscuro/claro, fuentes, tokens de diseño
- [ ] Navegación base: Tabs (Canciones, Setlists, Ensayos, Ajustes)
- [ ] Schema WatermelonDB + migraciones
- [ ] Scripts: `dev`, `test`, `lint`, `typecheck`, `build:android`, `build:ios`

### M1 — CRUD Canciones (Semana 2)
- [ ] Lista de canciones con búsqueda/filtro (tonalidad, artista, tempo)
- [ ] Formulario crear/editar: campos + editor ChordPro con preview en vivo
- [ ] Transposición de acordes en editor (`+/-` semitonos, capo)
- [ ] Importar/exportar `.cho` / `.pro` (ChordPro parser)
- [ ] Detalle canción: vista inmersiva, auto-scroll, botón transposición rápida

### M2 — Setlists (Semana 3)
- [ ] CRUD setlists + drag-and-drop reordenar canciones
- [ ] Cálculo duración total + por canción
- [ ] Clonar setlist, plantillas (ensayo, show, acústico)
- [ ] Vista "Setlist del día" con acceso rápido

### M3 — Modo Ensayo / Vivo (Semana 4)
- [ ] Pantalla canción fullscreen: fuente configurable, auto-scroll (velocidad ajustable)
- [ ] Transposición en vivo (`+1`, `-1`, capo), acordes recalculados al vuelo
- [ ] Metrónomo: BPM, compás, acento visual, vibración
- [ ] Bloqueo rotación, pantalla siempre encendida, tema oscuro forzado
- [ ] Atajos: espacio = play/pause scroll, flechas = navegar secciones

### M4 — Historial & Extras (Semana 5)
- [ ] Historial de ensayos (fecha, setlist, duración, notas)
- [ ] Exportar setlist a PDF / TXT / ChordPro bundle
- [ ] Backup/restore JSON local (compartir vía Share sheet)
- [ ] Ajustes: tamaños fuente, tema, auto-scroll default, metrónomo default
- [ ] Accesibilidad: VoiceOver/TalkBack, contraste, dynamic type

### M5 — Pulido & Release (Semana 6)
- [ ] Tests unitarios + integración (cobertura >80% núcleo)
- [ ] EAS Build perfiles: preview, production
- [ ] Iconos, splash, adaptive icon, permisos (audio, wake lock)
- [ ] TestFlight / Play Console internal testing
- [ ] Documentación usuario (README + guía rápida en app)

---

## Estructura de Carpetas

```
setlist-app/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout + providers
│   ├── (tabs)/             # Tab navigator
│   │   ├── _layout.tsx
│   │   ├── songs/
│   │   │   ├── index.tsx      # Lista + búsqueda
│   │   │   ├── new.tsx        # Crear
│   │   │   ├── [id].tsx       # Detalle
│   │   │   └── edit.tsx       # Editar
│   │   ├── setlists/
│   │   │   ├── index.tsx
│   │   │   ├── new.tsx
│   │   │   ├── [id].tsx       # Detalle + drag-drop
│   │   │   └── edit.tsx
│   │   ├── rehearsal/
│   │   │   ├── index.tsx      # Seleccionar setlist
│   │   │   ├── [setlistId].tsx # Modo ensayo/vivo
│   │   │   └── history.tsx
│   │   └── settings.tsx
│   └── +not-found.tsx
├── src/
│   ├── components/         # UI reutilizable
│   │   ├── ui/             # Botones, inputs, modals, sheet, etc.
│   │   ├── chord/          # ChordPro renderer, transposer, auto-scroll
│   │   ├── metronome/      # Metronome component + hook
│   │   └── song/           # SongCard, SongForm, SongEditor
│   ├── db/                 # WatermelonDB
│   │   ├── schema.ts
│   │   ├── models/
│   │   │   ├── Song.ts
│   │   │   ├── Setlist.ts
│   │   │   ├── SetlistSong.ts
│   │   │   └── RehearsalSession.ts
│   │   ├── migrations/
│   │   └── database.ts     # Inicialización + decorators
│   ├── stores/             # Zustand stores
│   │   ├── songs.ts
│   │   ├── setlists.ts
│   │   ├── rehearsal.ts
│   │   └── settings.ts
│   ├── hooks/              # Custom hooks
│   │   ├── useWatermelon.ts
│   │   ├── useTranspose.ts
│   │   ├── useAutoScroll.ts
│   │   └── useMetronome.ts
│   ├── utils/
│   │   ├── chordpro.ts     # Parser + transposer
│   │   ├── date.ts
│   │   ├── export.ts       # PDF, TXT, JSON
│   │   └── validation.ts
│   ├── constants/
│   │   ├── keys.ts         # Array tonalidades, círculo de quintas
│   │   ├── chords.ts       # Mapa acordes -> intervalos
│   │   └── theme.ts        # Tokens NativeWind
│   └── types/              # TypeScript interfaces
├── assets/                 # Fonts, icons, images
├── __tests__/              # Vitest + RNTL
├── .github/workflows/      # CI
├── eas.json                # EAS Build config
├── metro.config.js
├── nativewind.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Próximo Paso Inmediato

1. `cd setlist-app && npx create-expo-app@latest . --template blank-typescript`
2. Instalar dependencias base + NativeWind + WatermelonDB
3. Configurar `metro.config.js` + `nativewind.config.ts` + `tailwind.config.js`
4. Crear schema WatermelonDB + modelos
5. Providers raíz: `DatabaseProvider`, `ThemeProvider`, `StoreProvider`
6. Navegación tabs base + pantalla "Canciones" vacía con lista
7. Commit inicial + push a GitHub

¿Empezamos con el setup? (Ejecuto los comandos y te voy informando)