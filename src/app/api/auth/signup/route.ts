import { NextResponse } from "next/server";
import { getCollection, type Doc } from "@/lib/store";
import {
  hashPassword,
  createSession,
  toPublicUser,
  type User,
} from "@/lib/auth";
import { sendEmail, generateOtp, OTP_TTL_MS, EXPOSE_DEV_CODE } from "@/lib/email";

export async function POST(request: Request) {
  const { name, email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }
  if (String(password).length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const users = await getCollection<Doc>("users");
  const existing = await users.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const otp = generateOtp();
  const doc = {
    name: name || String(email).split("@")[0],
    email: String(email).toLowerCase(),
    password: hashPassword(String(password)),
    role: "Customer",
    verified: false,
    phone: "",
    address: "",
    gender: "",
    birthDate: "",
    avatar: "",
    favourites: [],
    otp,
    otpExpires: Date.now() + OTP_TTL_MS,
  };
  const { insertedId } = await users.insertOne(doc as Doc);
  await createSession(String(insertedId));

  await sendEmail({
    to: doc.email,
    subject: "Your Jiva Space verification code",
    text: `Welcome to Jiva Space! Your 4-digit verification code is ${otp}. It expires in 10 minutes.`,
  });

  return NextResponse.json({
    user: toPublicUser({ ...doc, _id: insertedId } as unknown as User),
    ...(EXPOSE_DEV_CODE ? { devCode: otp } : {}),
  });
}
