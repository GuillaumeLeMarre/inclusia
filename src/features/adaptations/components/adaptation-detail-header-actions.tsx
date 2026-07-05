"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdaptationDetailHeaderActions() {
  return (
    <Link href="/adaptations/new" className="block w-full sm:w-auto">
      <Button variant="outline" className="w-full sm:w-auto">
        Nouvelle adaptation
      </Button>
    </Link>
  );
}
