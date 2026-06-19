import { Badge } from "@/components/ui/badge";
import { getAppConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AppHeader({ title, description, action }: AppHeaderProps) {
  const { isDemoMode } = getAppConfig();

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-foreground md:text-2xl">{title}</h1>
            {isDemoMode && <Badge variant="accent">Mode démo</Badge>}
          </div>
          {description && (
            <p className="mt-1 text-base text-slate-500">{description}</p>
          )}
        </div>
        {action && (
          <div className={cn("shrink-0 w-full sm:w-auto [&_button]:w-full sm:[&_button]:w-auto [&_a]:block sm:[&_a]:inline-block")}>
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
