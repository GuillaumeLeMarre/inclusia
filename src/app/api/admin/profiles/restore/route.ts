import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/auth/require-teacher";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getSystemProfilesRestoreStatus,
  restoreSystemProfilesFromFallback,
} from "@/services/profiles/pedagogical-profile.service";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const status = await getSystemProfilesRestoreStatus(supabase);
    return NextResponse.json(status);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  try {
    const { supabase, teacherId } = await requireAdmin();
    const result = await restoreSystemProfilesFromFallback(supabase, teacherId);
    const status = await getSystemProfilesRestoreStatus(supabase);
    return NextResponse.json({ result, status });
  } catch (error) {
    return handleApiError(error);
  }
}
