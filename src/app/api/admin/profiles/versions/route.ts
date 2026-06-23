import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/auth/require-teacher";
import { requireAdmin } from "@/lib/auth/require-admin";
import { findPedagogicalProfileVersions } from "@/repositories/pedagogical-profiles.repository";
import { restorePedagogicalProfileVersion } from "@/services/profiles/profile-version.service";
import { z } from "zod";

const restoreSchema = z.object({
  profile_id: z.string().uuid(),
  version: z.number().int().min(1),
});

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const profileId = new URL(request.url).searchParams.get("profile_id");
    if (!profileId) {
      return NextResponse.json({ error: "profile_id requis" }, { status: 400 });
    }
    const versions = await findPedagogicalProfileVersions(supabase, profileId);
    return NextResponse.json({ versions });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireAdmin();
    const body = await request.json();
    const parsed = restoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const profile = await restorePedagogicalProfileVersion(
      supabase,
      parsed.data.profile_id,
      parsed.data.version,
      teacherId,
    );
    return NextResponse.json({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}
