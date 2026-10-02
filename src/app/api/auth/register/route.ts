import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { seedUserData } from "@/lib/seed";
import { ensureSchema, friendlyDbError, pgCode } from "@/lib/ensureSchema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Asegura las tablas (crea el esquema si el despliegue es nuevo).
    try {
      await ensureSchema();
    } catch (err) {
      console.error("[register/ensureSchema]", err);
      return Response.json({ error: friendlyDbError(err) }, { status: 500 });
    }

    // 2. Lee y valida los datos.
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const role = ["pianista", "vocalista", "director"].includes(body?.role) ? body.role : "pianista";
    const withDemo = body?.withDemo !== false;

    if (name.length < 2) return Response.json({ error: "Escribe tu nombre" }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Correo no válido" }, { status: 400 });
    if (password.length < 6)
      return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });

    // 3. Crea la cuenta.
    const passwordHash = await bcrypt.hash(password, 10);
    const [u] = await db.insert(users).values({ name, email, passwordHash, role }).returning();

    // 4. Datos de ejemplo: si falla, NO debe impedir el registro.
    let warning: string | undefined;
    if (withDemo) {
      try {
        await seedUserData(u.id);
      } catch (err) {
        console.error("[register/seed]", err);
        warning = "Tu cuenta se creó, pero no pudimos cargar las canciones de ejemplo. Puedes agregarlas tú.";
      }
    }

    try {
      await createSession(u.id);
    } catch (err) {
      console.error("[register/session]", err);
      return Response.json(
        { error: "Tu cuenta se creó, pero no pudimos iniciar tu sesión. Intenta ingresar con tu contraseña." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, warning });
  } catch (err) {
    // Nunca devolvemos un mensaje genérico: mostramos la causa real.
    console.error("[register]", err);
    const code = pgCode(err);
    if (code === "23505") return Response.json({ error: "Ese correo ya está registrado" }, { status: 409 });
    if (code === "23502")
      return Response.json({ error: "Faltan datos obligatorios en el formulario" }, { status: 400 });
    if (code === "42P10" || code === "42710")
      return Response.json(
        { error: "La base de datos tiene una estructura distinta. Ejecuta “npx drizzle-kit push”." },
        { status: 500 },
      );
    return Response.json({ error: friendlyDbError(err) }, { status: 500 });
  }
}
