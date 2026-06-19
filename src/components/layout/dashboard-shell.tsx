"use client";

import { MobileNav } from "./mobile-nav";
import { AppSidebar } from "./app-sidebar";
import { Logo } from "@/components/brand/logo";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-[100dvh] bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex min-h-[56px] items-center gap-3 border-b border-slate-200 bg-white px-4 pt-[env(safe-area-inset-top)] lg:hidden">
          <MobileNav />
          <Logo />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>
      </div>
    </div>
  );
}
