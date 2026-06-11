import { NextResponse } from "next/server";
import { getCollection, ObjectId } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

function timeLabel(): string {
  // Stable HH:MM label without relying on locale formatting differences.
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const col = await getCollection("chats");
  const chat = await col.findOne({ _id: new ObjectId(id), userId: String(user._id) });
  if (!chat) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ chat: { ...chat, _id: String(chat._id) } });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const { text } = await request.json().catch(() => ({}));
  if (!text || !String(text).trim()) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 });
  }

  const col = await getCollection("chats");
  const time = timeLabel();
  const message = { from: "me", text: String(text).trim(), time };
  await col.updateOne(
    { _id: new ObjectId(id), userId: String(user._id) },
    {
      $push: { messages: message },
      $set: {
        lastMessage: message.text,
        unread: 0,
        time,
        lastActivity: Date.now(),
      },
    }
  );
  return NextResponse.json({ message });
}
