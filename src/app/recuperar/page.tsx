import type { Metadata } from "next";
import RecoverForm from "@/components/RecoverForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recuperar contraseña · Alabanza Manager",
};

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <RecoverForm token={token?.trim() || null} />;
}
