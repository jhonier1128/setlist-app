import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alabanza Manager — Gestor de canciones para tu ministerio",
  description:
    "Organiza tu repertorio por tonalidad (hombre y mujer), por ritmo y crea popurrís en la misma tonalidad. Para pianistas y vocalistas de alabanza.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
