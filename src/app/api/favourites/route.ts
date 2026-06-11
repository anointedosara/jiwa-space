import { NextResponse } from "next/server";
import { getCollection, ObjectId, type Doc } from "@/lib/store";
import { getCurrentUser, type User } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ favourites: user.favourites ?? [] });
}

// Toggle a space in the signed-in user's saved list.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { spaceId } = await request.json().catch(() => ({}));
  if (!spaceId) {
    return NextResponse.json({ error: "spaceId is required." }, { status: 400 });
  }

  const current = new Set(user.favourites ?? []);
  if (current.has(spaceId)) current.delete(spaceId);
  else current.add(spaceId);
  const favourites = [...current];

  const users = await getCollection<User & Doc>("users");
  await users.updateOne(
    { _id: new ObjectId(String(user._id)) },
    { $set: { favourites } }
  );

  const saved = current.has(spaceId);
  if (saved) {
    await notify(
      String(user._id),
      "heart",
      "Saved to your list ❤️",
      "A space was added to your Loved House. Find it in your saved places."
    );
  }

  return NextResponse.json({ favourites, saved });
}
