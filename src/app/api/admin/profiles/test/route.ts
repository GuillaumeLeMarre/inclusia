import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/auth/require-teacher";
import { requireAdmin } from "@/lib/auth/require-admin";
import { profileTestPromptSchema } from "@/schemas/pedagogical-profile.schema";
import { testProfilePrompt } from "@/services/profiles/profile-test.service";
import { shouldUseDemoAi, generateDemoAdaptation } from "@/services/adaptation/demo-adaptation.service";

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireAdmin();
    const body = await request.json();
    const parsed = profileTestPromptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (shouldUseDemoAi()) {
      const demo = generateDemoAdaptation(
        {
          id: "test",
          teacher_id: teacherId,
          school_id: null,
          profile_name: "Test",
          approximate_level: null,
          adaptation_slugs: parsed.data.slug ? [parsed.data.slug] : [],
          pedagogical_needs: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        "Test de prompt",
        parsed.data.source_text,
        parsed.data.slug ? [parsed.data.slug] : ["lecture_simplifiee"],
      );
      return NextResponse.json({
        demo: true,
        profileSource: "FALLBACK_PROFILE",
        output: demo,
      });
    }

    const result = await testProfilePrompt(supabase, parsed.data, teacherId);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
