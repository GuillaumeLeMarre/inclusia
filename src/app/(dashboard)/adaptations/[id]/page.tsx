import { notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { AdaptationResult } from "@/features/adaptations/components/adaptation-result";
import { findAdaptationById } from "@/repositories/adaptations.repository";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdaptationDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  let adaptation;
  try {
    adaptation = await findAdaptationById(supabase, user.id, id);
  } catch {
    notFound();
  }

  const studentName = adaptation.student
    ? `${adaptation.student.first_name} ${adaptation.student.last_name}`
    : undefined;

  return (
    <>
      <AppHeader
        title="Support adapté"
        description={adaptation.document?.title ?? "Adaptation générée"}
        action={
          <Link href="/adaptations/new">
            <Button variant="outline">Nouvelle adaptation</Button>
          </Link>
        }
      />
      <div className="p-8 max-w-4xl">
        <AdaptationResult
          adaptation={adaptation}
          studentName={studentName}
          documentTitle={adaptation.document?.title}
        />
      </div>
    </>
  );
}
