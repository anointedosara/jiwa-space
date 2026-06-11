import { NextResponse } from "next/server";
import { getCollection, ObjectId, type Doc } from "@/lib/store";
import type { User } from "@/lib/auth";
import { sendEmail, generateOtp, OTP_TTL_MS, EXPOSE_DEV_CODE } from "@/lib/email";

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || !String(email).includes("@")) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const users = await getCollection<User & Doc>("users");
  const user = (await users.findOne({
    email: String(email).toLowerCase(),
  })) as User | null;

  // Only issue a code for a real account, but always respond OK so the endpoint
  // can't be used to discover which emails are registered.
  let devCode: string | undefined;
  if (user) {
    const code = generateOtp();
    devCode = code;
    await users.updateOne(
      { _id: new ObjectId(String(user._id)) },
      { $set: { resetCode: code, resetExpires: Date.now() + OTP_TTL_MS } }
    );
    await sendEmail({
      to: user.email,
      subject: "Reset your Jiva Space password",
      text: `Use this 4-digit code to reset your password: ${code}. It expires in 10 minutes.`,
    });
  }

  return NextResponse.json({
    ok: true,
    email,
    ...(EXPOSE_DEV_CODE && devCode ? { devCode } : {}),
  });
}
