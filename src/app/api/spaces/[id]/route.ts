import { NextResponse } from "next/server";
import { getCollection, ObjectId } from "@/lib/store";
import type { Space } from "@/lib/seed";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const col = await getCollection<Space>("spaces");
  const space = await col.findOne({ _id: new ObjectId(id) });
  if (!space) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ space: { ...space, _id: String(space._id) } });
}
