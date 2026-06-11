import { NextResponse } from "next/server";
import { getCollection, ObjectId, type Doc } from "@/lib/store";
import { getCurrentUser, type User } from "@/lib/auth";
import { sendEmail, generateOtp, OTP_TTL_MS, EXPOSE_DEV_CODE } from "@/lib/email";

// Regenerate and re-send the verification code for the signed-in user.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const otp = generateOtp();
  const users = await getCollection<User & Doc>("users");
  await users.updateOne(
    { _id: new ObjectId(String(user._id)) },
    { $set: { otp, otpExpires: Date.now() + OTP_TTL_MS } }
  );

  await sendEmail({
    to: user.email,
    subject: "Your new Jiva Space verification code",
    text: `Your new 4-digit verification code is ${otp}. It expires in 10 minutes.`,
  });

  return NextResponse.json({
    ok: true,
    ...(EXPOSE_DEV_CODE ? { devCode: otp } : {}),
  });
}
