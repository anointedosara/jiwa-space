import { NextResponse } from "next/server";
import { getCollection, ObjectId, type Doc } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const col = await getCollection("bookings");
  const bookings = await col
    .find({ userId: String(user._id) })
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json({
    bookings: bookings.map((b) => ({ ...b, _id: String(b._id) })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { spaceId, dates, guestInfo, payment, total } = body;
  if (!spaceId || !Array.isArray(dates) || dates.length === 0) {
    return NextResponse.json(
      { error: "Select a space and at least one date." },
      { status: 400 }
    );
  }

  const col = await getCollection("bookings");
  const doc: Doc = {
    userId: String(user._id),
    spaceId: String(spaceId),
    dates,
    guestInfo: guestInfo ?? null,
    payment: payment
      ? { last4: String(payment.cardNumber ?? "").slice(-4), name: payment.name }
      : null,
    total: total ?? null,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  const { insertedId } = await col.insertOne(doc);

  let spaceName = "your space";
  if (ObjectId.isValid(String(spaceId))) {
    const spaces = await getCollection("spaces");
    const space = await spaces.findOne({ _id: new ObjectId(String(spaceId)) });
    if (space?.name) spaceName = String(space.name);
  }
  await notify(
    String(user._id),
    "discount",
    "Booking confirmed 🎉",
    `Your stay at ${spaceName} for ${dates.length} night${
      dates.length > 1 ? "s" : ""
    } is confirmed. Thanks for booking with Jiva.`
  );

  return NextResponse.json({
    booking: { ...doc, _id: String(insertedId) },
  });
}
