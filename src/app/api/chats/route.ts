import { NextResponse } from "next/server";
import { getCollection } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { CHAT_CONTACTS } from "@/lib/seed";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ chats: [] }, { status: 401 });
  }

  const col = await getCollection("chats");
  const userId = String(user._id);

  // First visit: materialize an empty conversation per contact for this user.
  const existing = await col.countDocuments({ userId });
  if (existing === 0) {
    for (let i = 0; i < CHAT_CONTACTS.length; i++) {
      const c = CHAT_CONTACTS[i];
      await col.insertOne({
        userId,
        name: c.name,
        avatar: c.avatar,
        lastMessage: "",
        unread: 0,
        time: "",
        order: i,
        lastActivity: 0,
        messages: [],
      });
    }
  }

  const chats = await col.find({ userId }).toArray();
  // Most-recently-active conversations first; untouched keep their seed order.
  chats.sort(
    (a, b) =>
      Number(b.lastActivity ?? 0) - Number(a.lastActivity ?? 0) ||
      Number(a.order ?? 0) - Number(b.order ?? 0)
  );

  return NextResponse.json({
    chats: chats.map((c) => ({ ...c, _id: String(c._id) })),
  });
}
