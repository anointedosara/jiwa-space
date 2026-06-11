import { NextResponse } from "next/server";
import { getCollection } from "@/lib/store";
import type { Space } from "@/lib/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const area = searchParams.get("area");
  const popular = searchParams.get("popular");

  const filter: Record<string, unknown> = {};
  if (type && type !== "Near You") filter.type = type;
  if (city) filter.city = city;
  if (area) filter.area = area;
  if (popular === "true") filter.popular = true;

  const col = await getCollection<Space>("spaces");
  let results = await col.find(filter).toArray();

  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    results = results.filter(
      (s) =>
        re.test(s.name) ||
        re.test(s.location) ||
        re.test(s.city) ||
        re.test(s.area) ||
        re.test(s.type)
    );
  }

  return NextResponse.json({
    spaces: results.map((s) => ({ ...s, _id: String(s._id) })),
  });
}
