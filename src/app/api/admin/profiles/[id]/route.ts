import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/auth/require-teacher";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deletePedagogicalProfile,
  findPedagogicalProfileById,
} from "@/repositories/pedagogical-profiles.repository";
import { patchPedagogicalProfileWithVersion } from "@/services/profiles/profile-version.service";
import { pedagogicalProfilePatchSchema } from "@/schemas/pedagogical-profile.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = pedagogicalProfilePatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const profile = await patchPedagogicalProfileWithVersion(
      supabase,
      id,
      parsed.data,
      teacherId,
    );
    return NextResponse.json({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const existing = await findPedagogicalProfileById(supabase, id);
    if (!existing) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }
    await deletePedagogicalProfile(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const profile = await findPedagogicalProfileById(supabase, id);
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}
