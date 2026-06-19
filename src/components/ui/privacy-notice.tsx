import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivacyNoticeProps {
  className?: string;
}

export function PrivacyNotice({ className }: PrivacyNoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-900",
        className,
      )}
    >
      <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
      <p>
        Pour respecter la confidentialité, n&apos;indiquez pas le nom complet de
        l&apos;élève ni de données médicales.
      </p>
    </div>
  );
}
