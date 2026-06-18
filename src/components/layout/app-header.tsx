import { Badge } from "@/components/ui/badge";
import { getAppConfig } from "@/lib/config";

interface AppHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AppHeader({ title, description, action }: AppHeaderProps) {
  const { isDemoMode } = getAppConfig();

  return (
    <header className="flex items-start justify-between border-b border-slate-200 bg-white px-8 py-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {isDemoMode && (
            <Badge variant="accent">Mode démo</Badge>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
