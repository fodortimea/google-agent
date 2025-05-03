import { supabase } from "@/app/lib/db/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { interactionId, rating, comment } = await req.json();
  const { error } = await supabase
    .from("feedback")
    .insert({ interaction_id: interactionId, rating, comment });

  if (error) {
    console.error("DB insert failed:", error);
    return NextResponse.json({ error: "db_insert_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
