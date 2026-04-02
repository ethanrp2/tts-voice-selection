import { createServerClient } from "@/lib/supabase";
import type { NextRequest } from "next/server";

function modelForProvider(provider: string | null | undefined) {
  switch ((provider || "").toLowerCase()) {
    case "elevenlabs":
      return "eleven_turbo_v2";
    case "cartesia":
      return "sonic-3";
    case "rime":
      return "mistv3";
    default:
      return "";
  }
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || "appeal";
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "20",
    10
  );
  const offset = parseInt(
    request.nextUrl.searchParams.get("offset") || "0",
    10
  );

  const validCategories = ["appeal", "empathy", "authority", "energy"];
  if (!validCategories.includes(category)) {
    return Response.json({ error: "Invalid category" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("elo_ratings")
    .select(
      `
      rating,
      match_count,
      win_count,
      voices (
        id,
        name,
        provider,
        description
      )
    `
    )
    .eq("category", category)
    .order("rating", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return Response.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }

  const voices = data.map((entry, index) => {
    const voice = entry.voices as unknown as {
      id: string;
      name: string;
      provider: string;
      description: string;
    };
    return {
      id: voice.id,
      name: voice.name,
      provider: voice.provider,
      description: modelForProvider(voice.provider),
      rating: entry.rating,
      matchCount: entry.match_count,
      winCount: entry.win_count,
      rank: offset + index + 1,
    };
  });

  return Response.json({ voices, category });
}
