import { notFound } from "next/navigation";
import MedleyDetail from "@/components/MedleyDetail";
import { getCurrentUser } from "@/lib/auth";
import { getMedley, getSongs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MedleyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = (await getCurrentUser())!;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [medley, songs] = await Promise.all([getMedley(user.id, id), getSongs(user.id)]);
  if (!medley) notFound();
  return <MedleyDetail key={medley.id} initialMedley={medley} allSongs={songs} />;
}
