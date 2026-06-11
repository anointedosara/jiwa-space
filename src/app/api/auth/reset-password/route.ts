import { NextResponse } from "next/server";
import { getCollection, ObjectId, type Doc } from "@/lib/store";
import { hashPassword, type User } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, code, password } = await request.json().catch(() => ({}));

  if (!email || !code || !password) {
    return NextResponse.json(
      { error: "Email, code and new password are required." },
      { status: 400 }
    );
  }
  if (String(password).length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const users = await getCollection<User & Doc>("users");
  const user = (await users.findOne({
    email: String(email).toLowerCase(),
  })) as User | null;

  if (!user || !user.resetCode || user.resetCode !== String(code)) {
    return NextResponse.json(
      { error: "That reset code is incorrect." },
      { status: 400 }
    );
  }
  if (user.resetExpires && Date.now() > user.resetExpires) {
    return NextResponse.json(
      { error: "That reset code has expired. Request a new one." },
      { status: 400 }
    );
  }

  await users.updateOne(
    { _id: new ObjectId(String(user._id)) },
    { $set: { password: hashPassword(String(password)), resetCode: "", resetExpires: 0 } }
  );

  return NextResponse.json({ ok: true });
}
