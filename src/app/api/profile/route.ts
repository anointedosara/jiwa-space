import { NextResponse } from "next/server";
import { getCollection, ObjectId, type Doc } from "@/lib/store";
import { getCurrentUser, toPublicUser, type User } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const allowed = ["name", "phone", "address", "gender", "birthDate", "avatar"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const users = await getCollection<User & Doc>("users");
  await users.updateOne(
    { _id: new ObjectId(String(user._id)) },
    { $set: update }
  );
  const updated = (await users.findOne({
    _id: new ObjectId(String(user._id)),
  })) as User;

  await notify(
    String(user._id),
    "star",
    "Profile updated",
    "Your profile details were saved successfully."
  );

  return NextResponse.json({ user: toPublicUser(updated) });
}
