/** Convierte errores de base de datos en mensajes útiles para el usuario. */
export function dbError(error: unknown): { error: string; status: number } {
  const raw = error instanceof Error ? error.message : String(error);
  if (/does not exist|relation .* does not exist/i.test(raw)) {
    return {
      error: "La base de datos aún no tiene las tablas. Ejecuta `npx drizzle-kit push` en tu base de Neon.",
      status: 500,
    };
  }
  if (/password authentication failed|28P01/i.test(raw)) {
    return { error: "Credenciales de la base de datos incorrectas. Revisa DATABASE_URL.", status: 500 };
  }
  if (/timeout|ECONNREFUSED|ENOTFOUND|self-signed|SSL|TLS|connection/i.test(raw)) {
    return {
      error: "No se pudo conectar a la base de datos. Revisa la variable DATABASE_URL (usa ?sslmode=require).",
      status: 503,
    };
  }
  console.error("[api]", raw);
  return { error: "Algo salió mal en el servidor. Intenta de nuevo.", status: 500 };
}
