import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/auth/require-teacher";
import { requireAdmin } from "@/lib/auth/require-admin";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import { createPedagogicalProfile } from "@/services/profiles/pedagogical-profile.service";
import { pedagogicalProfileInputSchema } from "@/schemas/pedagogical-profile.schema";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const category = searchParams.get("category") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const profiles = await findAllPedagogicalProfiles(supabase, {
      includeInactive,
      category,
      search,
    });
    return NextResponse.json({ profiles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireAdmin();
    const body = await request.json();
    const parsed = pedagogicalProfileInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const profile = await createPedagogicalProfile(supabase, parsed.data, teacherId);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
