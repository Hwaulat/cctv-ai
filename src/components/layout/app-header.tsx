import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, PanelLeft, Settings, UsersRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { events, eventTypeLabel, roomById, unacknowledgedCount } from "@/lib/data";

function LiveClock() {
  // Start empty so SSR and the client render the same markup on first paint.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="text-right leading-tight">
        <p className="text-base font-bold tracking-wide tabular-nums">-- : -- : --</p>
        <p className="text-[11px] text-muted-foreground">&nbsp;</p>
      </div>
    );
  }

  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(" : ");
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="text-right leading-tight">
      <p className="text-base font-bold tracking-wide tabular-nums">{time}</p>
      <p className="text-[11px] text-muted-foreground">{date}</p>
    </div>
  );
}

export function AppHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = unacknowledgedCount();
  const latest = [...events]
    .filter((e) => e.status === "unacknowledged")
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 lg:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 sm:gap-5">
        <LiveClock />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-white">
                  {unread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Unacknowledged events</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {latest.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">All clear</p>
            )}
            {latest.map((e) => {
              const room = roomById(e.roomId);
              return (
                <DropdownMenuItem key={e.id} asChild>
                  <Link to="/events" className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {eventTypeLabel[e.type]} · {room?.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {e.id} · {e.at}
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/events" className={pathname === "/events" ? "text-info" : ""}>
                View all events
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-accent">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-info to-sidebar-active text-xs font-bold text-white">
                AD
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold">admin</span>
                <span className="block text-[11px] text-muted-foreground">Super Admin</span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-sm font-semibold">admin</span>
              <span className="block text-xs font-normal text-muted-foreground">admin@cctv.io</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/cameras" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Cameras & Rooms
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/users" className="flex items-center gap-2">
                <UsersRound className="h-4 w-4" /> Users & Roles
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
