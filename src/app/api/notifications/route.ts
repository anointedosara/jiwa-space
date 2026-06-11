import { NextResponse } from "next/server";
import { getCollection } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ notifications: [], unread: 0 }, { status: 401 });
  }
  const col = await getCollection("notifications");
  const userId = String(user._id);
  const notifications = await col
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  const unread = await col.countDocuments({ userId, read: false });
  return NextResponse.json({
    notifications: notifications.map((n) => ({ ...n, _id: String(n._id) })),
    unread,
  });
}

// Mark all of the user's notifications as read (clears the bell signal).
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const col = await getCollection("notifications");
  const unread = await col
    .find({ userId: String(user._id), read: false })
    .toArray();
  for (const n of unread) {
    await col.updateOne({ _id: n._id }, { $set: { read: true } });
  }
  return NextResponse.json({ ok: true, cleared: unread.length });
}
