import { Logo } from "@/components/brand/logo";
import { NavContent } from "./nav-content";

export function AppSidebar() {
  return (
    <aside className="hidden lg:flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="p-6">
        <Logo showSlogan />
      </div>
      <div className="flex flex-1 flex-col">
        <NavContent />
      </div>
    </aside>
  );
}
