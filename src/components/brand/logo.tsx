import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
}

export function Logo({ className, showSlogan = false }: LogoProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
          I
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">
          Inclusia
        </span>
      </div>
      {showSlogan && (
        <p className="mt-1 text-xs text-slate-500">
          L&apos;IA qui adapte l&apos;école à chaque élève
        </p>
      )}
    </div>
  );
}
