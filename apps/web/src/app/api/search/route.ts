import { NextResponse } from "next/server";
import {
  fetchSearchResults,
  fetchSearchSuggestions,
} from "@/lib/search/catalog";

export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const mode = searchParams.get("mode") || "results";
  const page = Number(searchParams.get("page") || "1") || 1;
  const limit =
    Number(searchParams.get("limit") || (mode === "suggest" ? "5" : "12")) ||
    12;

  if (!query) {
    return NextResponse.json({ data: [], meta: { query, page, limit } });
  }

  const data =
    mode === "suggest"
      ? await fetchSearchSuggestions(query, limit)
      : await fetchSearchResults({ query, page, limit });

  return NextResponse.json(
    {
      data,
      meta: {
        query,
        page,
        limit,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}
