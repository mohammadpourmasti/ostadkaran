import { NextRequest, NextResponse } from "next/server";
import { prepareQuery } from "@/lib/error-codes/search";
import { searchPublishedErrorCodes } from "@/lib/error-codes/search-index";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q") ?? "";

  // Too short (or only separators): nothing to search, and no database/index work at all.
  if (!prepareQuery(raw)) {
    return NextResponse.json({ results: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const results = await searchPublishedErrorCodes(raw);

    return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "جست‌وجو موقتاً در دسترس نیست." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
