import { Link, useRouterState } from "@tanstack/react-router";
import {
  Cctv,
  LayoutGrid,
  Map,
  History,
  Camera,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { events, rooms } from "@/lib/data";

interface NavBadge {
  text: string;
  tone: "alert" | "count";
}

function NavItem({
  to,
  icon: Icon,
  label,
  badge,
  compact = false,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: NavBadge | undefined;
  compact?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`relative flex items-center rounded-md font-medium transition-colors ${
        compact ? "gap-2.5 px-2.5 py-1.5 text-xs" : "gap-3 px-3 py-2 text-sm"
      } ${
        active
          ? "bg-sidebar-active text-white"
          : "text-sidebar-foreground/75 hover:bg-sidebar-hover hover:text-sidebar-foreground"
      }`}
    >
      {active && <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-white" />}
      <Icon className={compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"} />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
            badge.tone === "alert" ? "bg-destructive text-white" : "bg-info text-white"
          }`}
        >
          {badge.text}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-2 mt-6 flex items-center gap-2 px-3 first:mt-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted">
        {children}
      </span>
      <span className="h-px flex-1 bg-sidebar-border" />
    </div>
  );
}

export function AppSidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle?: () => void;
}) {
  const alertCount = rooms.filter((r) => r.smoke === "alert").length;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {/* Brand */}
        <div className="flex items-center gap-3 px-3 pb-3 pt-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-info to-sidebar-active shadow-lg">
            <Cctv className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-white">
              AI CCTV Monitoring
            </p>
            <p className="text-[11px] font-medium leading-tight text-info">Security Platform</p>
          </div>
        </div>

        <SectionLabel>Core Functions</SectionLabel>
        <nav className="flex flex-col gap-1">
          <NavItem to="/" icon={LayoutGrid} label="Monitoring" badge={alertCount > 0 ? { text: `${alertCount} ALERT`, tone: "alert" } : undefined} />
          <NavItem to="/floor-plan" icon={Map} label="Floor Plan Heatmap" />
          <NavItem to="/events" icon={History} label="Event Log" badge={{ text: String(events.length), tone: "count" }} />
        </nav>

        <SectionLabel>Setup System</SectionLabel>
        <nav className="flex flex-col gap-1">
          <NavItem to="/cameras" icon={Camera} label="Cameras & Rooms" />
        </nav>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-sidebar-border px-4 py-3">
        <span className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/80">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          System Online
        </span>
        <span className="font-mono text-[10px] text-sidebar-muted">v2.4.1</span>
      </div>
    </aside>
  );
}
