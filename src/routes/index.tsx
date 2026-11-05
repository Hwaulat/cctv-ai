import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Cctv,
  Flame,
  History,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  eventTypeLabel,
  events,
  occupancyByHour,
  roomById,
  rooms,
  smokeLabel,
  totalHeadcount,
  unacknowledgedCount,
  type Room,
  type SmokeStatus,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monitoring Dashboard — AI CCTV Monitoring Platform" },
      { name: "description", content: "Live room monitoring with AI smoke status, people counting, and camera health at a glance." },
      { property: "og:title", content: "Monitoring Dashboard — AI CCTV Monitoring Platform" },
      { property: "og:description", content: "Live room monitoring with AI smoke status, people counting, and camera health at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const smokeChipClass: Record<SmokeStatus, string> = {
  clear: "bg-success text-white",
  suspected: "bg-warning text-foreground",
  alert: "bg-destructive text-white animate-pulse",
};

function SmokeChip({ status }: { status: SmokeStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${smokeChipClass[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {smokeLabel[status]}
    </span>
  );
}

function FeedImage({ room, className }: { room: Room; className?: string }) {
  if (!room.image) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className ?? ""}`}>
        <span className="font-mono text-xs tracking-widest text-zinc-500">NO SIGNAL · CAMERA OFFLINE</span>
      </div>
    );
  }
  return (
    <img
      src={room.image}
      alt={`${room.name} camera feed`}
      loading="lazy"
      width={1024}
      height={576}
      className={`object-cover ${className ?? ""}`}
    />
  );
}

function PersonBoxes({ room }: { room: Room }) {
  return (
    <>
      {room.boxes.map((b) => (
        <div
          key={b.id}
          className="absolute border-2 border-info"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
        >
          <span className="absolute -top-5 left-0 whitespace-nowrap rounded-sm bg-info px-1 py-0.5 font-mono text-[9px] font-semibold text-white">
            {b.id} {b.conf.toFixed(2)}
          </span>
        </div>
      ))}
    </>
  );
}

function SmokeRegion({ room }: { room: Room }) {
  if (!room.smokeRegion || room.smoke === "clear") return null;
  const r = room.smokeRegion;
  const tone = room.smoke === "alert" ? "border-destructive" : "border-warning";
  const fill = room.smoke === "alert" ? "bg-destructive/20" : "bg-warning/25";
  return (
    <div
      className={`absolute rounded-sm border-2 border-dashed ${tone} ${fill}`}
      style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
    >
      <span className="absolute -top-5 left-0 whitespace-nowrap rounded-sm bg-foreground px-1 py-0.5 font-mono text-[9px] font-semibold text-background">
        SMOKE REGION
      </span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center gap-4 px-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
          <p className="truncate text-[11px] text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomCard({ room }: { room: Room }) {
  const [overlays, setOverlays] = useState({ boxes: true, smoke: true });
  const fill = Math.min(100, Math.round((room.headcount / room.capacity) * 100));

  return (
    <Dialog>
      <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <DialogTrigger asChild>
          <button type="button" className="relative block cursor-pointer text-left">
            <FeedImage room={room} className="aspect-video w-full" />
            {/* top gradient for chips */}
            <span className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
            <span className="absolute left-2 top-2">
              <SmokeChip status={room.smoke} />
            </span>
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Users className="h-3 w-3" />
              {room.headcount}/{room.capacity}
            </span>
            <span className="absolute bottom-2 left-2 font-mono text-[10px] text-white/70">
              {room.cameras[0]} {room.cameras.length > 1 ? `+${room.cameras.length - 1}` : ""}
            </span>
          </button>
        </DialogTrigger>
        <CardContent className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{room.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {room.cameras.length} camera{room.cameras.length > 1 ? "s" : ""} ·{" "}
                {room.cameraStatus === "online" ? (
                  <span className="text-success">Online</span>
                ) : (
                  <span className="text-destructive">Offline</span>
                )}
              </p>
            </div>
            <div className="w-24 shrink-0 text-right">
              <p className="mb-1 text-[10px] text-muted-foreground">{fill}% of capacity</p>
              <Progress value={fill} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{room.name} — Live View</DialogTitle>
          <DialogDescription>
            {room.cameras.join(", ")} · WebRTC low-latency stream simulated for this demo
          </DialogDescription>
        </DialogHeader>
        <div className="relative overflow-hidden rounded-lg border">
          <FeedImage room={room} className="aspect-video w-full" />
          {overlays.boxes && room.image && <PersonBoxes room={room} />}
          {overlays.smoke && room.image && <SmokeRegion room={room} />}
          {room.image && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
              LIVE
            </span>
          )}
          {room.image && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
              <Users className="h-3 w-3" /> {room.headcount} people
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id={`boxes-${room.id}`}
              checked={overlays.boxes}
              onCheckedChange={(v) => setOverlays((o) => ({ ...o, boxes: v }))}
            />
            <Label htmlFor={`boxes-${room.id}`} className="text-sm">
              Person boxes
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={`smoke-${room.id}`}
              checked={overlays.smoke}
              onCheckedChange={(v) => setOverlays((o) => ({ ...o, smoke: v }))}
            />
            <Label htmlFor={`smoke-${room.id}`} className="text-sm">
              Smoke region
            </Label>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-muted-foreground" /> {smokeLabel[room.smoke]}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" /> {room.headcount}/{room.capacity}
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-muted-foreground" /> Peak today {room.peakToday}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Dashboard() {
  const onlineCameras = rooms.reduce(
    (n, r) => n + (r.cameraStatus === "online" ? r.cameras.length : 0),
    0,
  );
  const totalCameras = rooms.reduce((n, r) => n + r.cameras.length, 0);
  const alertRooms = rooms.filter((r) => r.smoke === "alert").length;
  const recent = [...events].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monitoring Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live AI status for every room — smoke detection, headcount, and camera health.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          Live · updated 5s ago
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Cctv}
          label="Cameras online"
          value={`${onlineCameras}/${totalCameras}`}
          detail={`${totalCameras - onlineCameras} offline · 1 gateway`}
        />
        <StatCard
          icon={Flame}
          label="Active smoke alerts"
          value={String(alertRooms)}
          detail={alertRooms > 0 ? "Production Floor needs attention" : "All rooms clear"}
          tone={alertRooms > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={Users}
          label="People on site"
          value={String(totalHeadcount())}
          detail="Updated every 2 seconds"
        />
        <StatCard
          icon={History}
          label="Unacknowledged events"
          value={String(unacknowledgedCount())}
          detail="Re-notify every 2 minutes"
          tone={unacknowledgedCount() > 0 ? "danger" : "default"}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Rooms
          </h2>
          <p className="text-xs text-muted-foreground">
            Select a room to open its live view
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Occupancy — last 24 hours</CardTitle>
            <CardDescription>Total people on site per hour (peak 30 · avg 17)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={occupancyByHour} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value} people`, "On site"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="people"
                    stroke="var(--color-foreground)"
                    strokeWidth={1.5}
                    fill="url(#occFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent events</CardTitle>
              <CardDescription>Latest smoke, capacity & camera events</CardDescription>
            </div>
            <Badge variant="secondary" asChild>
              <a href="/events">View all</a>
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((e) => {
              const room = roomById(e.roomId);
              return (
                <div key={e.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                      e.type === "smoke"
                        ? "bg-destructive/10 text-destructive"
                        : e.type === "capacity"
                          ? "bg-warning/15 text-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.type === "smoke" ? <Flame className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{eventTypeLabel[e.type]}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {room?.name} · {e.camera}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {e.at.slice(11, 16)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
