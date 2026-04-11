// API do recznej rewalidacji cache'a.
// GET /api/revalidate?tag=sidebar — czyści cache dla danego tagu.

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get("tag");
  if (!tag) {
    return NextResponse.json({ error: "missing ?tag=" }, { status: 400 });
  }

  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag, now: Date.now() });
}
