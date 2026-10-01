import SongsManager from "@/components/SongsManager";
import { getCurrentUser } from "@/lib/auth";
import { getSongs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const user = (await getCurrentUser())!;
  const songs = await getSongs(user.id);
  return <SongsManager initialSongs={songs} />;
}
