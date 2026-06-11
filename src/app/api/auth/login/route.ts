import { NextResponse } from "next/server";
import { getCollection, type Doc } from "@/lib/store";
import {
  verifyPassword,
  createSession,
  toPublicUser,
  type User,
} from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const users = await getCollection<User & Doc>("users");
  const user = (await users.findOne({
    email: String(email).toLowerCase(),
  })) as User | null;

  if (!user || !verifyPassword(String(password), user.password)) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  await createSession(String(user._id));
  await notify(
    String(user._id),
    "star",
    "Welcome back 👋",
    `Good to see you again, ${user.name}. New live spaces are waiting for you.`
  );
  return NextResponse.json({ user: toPublicUser(user) });
}
