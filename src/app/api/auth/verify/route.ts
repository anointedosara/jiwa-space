import { NextResponse } from "next/server";
import { getCollection, ObjectId, type Doc } from "@/lib/store";
import { getCurrentUser, type User } from "@/lib/auth";

export async function POST(request: Request) {
  const { code } = await request.json().catch(() => ({}));
  if (!/^\d{4}$/.test(String(code ?? ""))) {
    return NextResponse.json(
      { error: "Enter the 4-digit code sent to your email." },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!user.otp || user.otp !== String(code)) {
    return NextResponse.json(
      { error: "That code is incorrect. Check your email and try again." },
      { status: 400 }
    );
  }
  if (user.otpExpires && Date.now() > user.otpExpires) {
    return NextResponse.json(
      { error: "That code has expired. Tap Resend for a new one." },
      { status: 400 }
    );
  }

  const users = await getCollection<User & Doc>("users");
  await users.updateOne(
    { _id: new ObjectId(String(user._id)) },
    { $set: { verified: true, otp: "", otpExpires: 0 } }
  );
  return NextResponse.json({ ok: true });
}
