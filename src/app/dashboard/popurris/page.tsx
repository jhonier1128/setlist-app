import MedleysManager from "@/components/MedleysManager";
import { getCurrentUser } from "@/lib/auth";
import { getMedleys, getSongs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MedleysPage() {
  const user = (await getCurrentUser())!;
  const [medleys, songs] = await Promise.all([getMedleys(user.id), getSongs(user.id)]);
  return <MedleysManager initialMedleys={medleys} songs={songs} />;
}
