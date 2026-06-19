import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentSourceLinkCardProps {
  documentId: string;
  documentTitle?: string;
}

export function DocumentSourceLinkCard({
  documentId,
  documentTitle,
}: DocumentSourceLinkCardProps) {
  const label = documentTitle ?? "Document source";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Document source</CardTitle>
      </CardHeader>
      <CardContent>
        <Link
          href={`/documents?doc=${documentId}`}
          className="inline-flex min-h-[44px] max-w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-base font-medium text-primary underline-offset-2 hover:bg-slate-50 hover:underline dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
        >
          <FileText className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">{label}</span>
          <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}
