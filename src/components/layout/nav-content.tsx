"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profiles", label: "Profils", icon: Users },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/adaptations", label: "Adaptations", icon: Sparkles },
] as const;

interface NavContentProps {
  onNavigate?: () => void;
}

export function NavContent({ onNavigate }: NavContentProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    onNavigate?.();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <nav className="flex-1 space-y-1 px-3" aria-label="Navigation principale">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 space-y-1">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Settings className="h-5 w-5 shrink-0" aria-hidden />
          Paramètres
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          Déconnexion
        </button>
      </div>
    </>
  );
}
