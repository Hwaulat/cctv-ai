import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Activity,
  Cctv,
  Flame,
  History,
  Users,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
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

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  eventTypeLabel,
  events,
  occupancyByHour,
  roomById,
  rooms,
  smokeLabel,
  totalHeadcount,
  unacknowledgedCount,
  cameras as initialCameras,
  type Camera,
  type Room,
  type SmokeStatus,
  type AIModel,
  aiModelLabels,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monitoring Dashboard — AI CCTV Monitoring Platform" },
      {
        name: "description",
        content:
          "Live camera monitoring with dedicated single AI model per camera: smoke detection, people counting, or crowd capacity.",
      },
      { property: "og:title", content: "Monitoring Dashboard — AI CCTV Monitoring Platform" },
      {
        property: "og:description",
        content:
          "Live camera monitoring with dedicated single AI model per camera: smoke detection, people counting, or crowd capacity.",
      },
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

function FeedImage({ room, className }: { room?: Room | undefined; className?: string | undefined }) {
  if (!room?.image) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className ?? ""}`}>
        <span className="font-mono text-xs tracking-widest text-zinc-500">
          NO SIGNAL · CAMERA OFFLINE
        </span>
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
        SMOKE HAZARD REGION
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
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"
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

function CameraFeedCard({
  camera,
  room,
  onModelChange,
  showModelSelector = false,
}: {
  camera: Camera;
  room?: Room | undefined;
  onModelChange: (camId: string, model: AIModel) => void;
  showModelSelector?: boolean | undefined;
}) {
  const isOnline = camera.status === "online";
  const fill = room ? Math.min(100, Math.round((room.headcount / room.capacity) * 100)) : 0;

  return (
    <Dialog>
      <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        {/* Card Header with Camera Info and Model Selector */}
        <div className="flex items-center justify-between border-b bg-card/60 px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="truncate font-medium">{camera.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {room?.name ?? "No room"} · <span className="font-mono">{camera.id}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showModelSelector ? (
              <Select
                value={camera.model}
                onValueChange={(val: AIModel) => onModelChange(camera.id, val)}
              >
                <SelectTrigger
                  className="h-6 w-34 px-2 text-[10px] font-semibold"
                  title="Change active AI model for this camera"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="people-counting">People Counting</SelectItem>
                  <SelectItem value="smoke-detection">Smoke Detection</SelectItem>
                  <SelectItem value="crowd-capacity">Crowd / Capacity</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary" className="h-6 px-2 text-[10px] font-medium">
                {aiModelLabels[camera.model]}
              </Badge>
            )}
          </div>
        </div>

        {/* Video feed with ONLY the 1 selected model's visual overlays */}
        <DialogTrigger asChild>
          <button type="button" className="relative block w-full cursor-pointer text-left">
            <FeedImage room={room} className="aspect-video w-full" />
            <span className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />

            {/* Top Overlay strictly matching the 1 chosen model */}
            {isOnline && room && (
              <>
                {/* 1. PEOPLE COUNTING ONLY */}
                {camera.model === "people-counting" && (
                  <>
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-info/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                      <Users className="h-3 w-3" />
                      {room.headcount} People Detected
                    </span>
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/90">
                      Model: People
                    </span>
                    {/* Bounding boxes only on People Counting */}
                    {room.image && <PersonBoxes room={room} />}
                  </>
                )}

                {/* 2. SMOKE DETECTION ONLY */}
                {camera.model === "smoke-detection" && (
                  <>
                    <span className="absolute left-2 top-2 shadow">
                      <SmokeChip status={room.smoke} />
                    </span>
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/90">
                      <Flame className="h-3 w-3 text-destructive" /> Model: Smoke
                    </span>
                    {/* Smoke region overlay only on Smoke Detection */}
                    {room.image && <SmokeRegion room={room} />}
                  </>
                )}

                {/* 3. CROWD / CAPACITY ONLY */}
                {camera.model === "crowd-capacity" && (
                  <>
                    <span
                      className={`absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow ${fill >= 90
                          ? "bg-destructive animate-pulse"
                          : fill >= 70
                            ? "bg-warning text-foreground"
                            : "bg-success"
                        }`}
                    >
                      <Activity className="h-3 w-3" />
                      {room.headcount} / {room.capacity} ({fill}%)
                    </span>
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/90">
                      Model: Capacity
                    </span>
                  </>
                )}
              </>
            )}

            {/* Stream resolution & connection badge at bottom */}
            <span className="absolute bottom-2 left-2 font-mono text-[10px] text-white/80 drop-shadow">
              {camera.resolution} · {camera.lastSeen}
            </span>
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
              {isOnline ? "LIVE" : "OFFLINE"}
            </span>
          </button>
        </DialogTrigger>

        {/* Card Footer: Detail specific to the single chosen model */}
        <CardContent className="px-3.5 py-2.5">
          {camera.model === "people-counting" && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-info" />
                Active Model: <span className="font-semibold text-foreground">People Counting</span>
              </span>
              <span className="font-mono text-[11px] font-medium text-foreground">
                {room?.boxes.length ?? 0} boxes tracked
              </span>
            </div>
          )}

          {camera.model === "smoke-detection" && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-destructive" />
                Active Model: <span className="font-semibold text-foreground">Smoke Detection</span>
              </span>
              <span className="font-medium">
                {room?.smoke === "alert" ? (
                  <span className="text-destructive font-semibold">Active Hazard</span>
                ) : room?.smoke === "suspected" ? (
                  <span className="text-warning">Suspected</span>
                ) : (
                  <span className="text-success">Normal Atmosphere</span>
                )}
              </span>
            </div>
          )}

          {camera.model === "crowd-capacity" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Activity className="h-3.5 w-3.5 text-warning" />
                  Active Model: <span className="font-semibold text-foreground">Capacity Limit</span>
                </span>
                <span className="font-mono text-[11px] font-medium">
                  {room ? `${room.capacity - room.headcount} spots left` : "-"}
                </span>
              </div>
              <Progress value={fill} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live View Modal with Dedicated 1-Model Telemetry */}
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {camera.name} — Live AI Stream
                <Badge
                  variant="outline"
                  className={
                    camera.status === "online"
                      ? "bg-success/10 text-success border-transparent"
                      : "bg-destructive/10 text-destructive border-transparent"
                  }
                >
                  {camera.status === "online" ? "Online" : "Offline"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1">
                Room: {room?.name ?? "Unassigned"} · RTSP: <span className="font-mono">{camera.rtsp}</span>
              </DialogDescription>
            </div>

            {/* Inline model switcher or static badge inside modal */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Camera Model:</Label>
              {showModelSelector ? (
                <Select
                  value={camera.model}
                  onValueChange={(val: AIModel) => onModelChange(camera.id, val)}
                >
                  <SelectTrigger className="h-8 w-40 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="people-counting">People Counting</SelectItem>
                    <SelectItem value="smoke-detection">Smoke Detection</SelectItem>
                    <SelectItem value="crowd-capacity">Crowd / Capacity</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
                  {aiModelLabels[camera.model]}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Video feed in modal */}
        <div className="relative overflow-hidden rounded-lg border bg-black">
          <FeedImage room={room} className="aspect-video w-full" />

          {/* Model-specific live overlays */}
          {isOnline && room && (
            <>
              {camera.model === "people-counting" && room.image && <PersonBoxes room={room} />}
              {camera.model === "smoke-detection" && room.image && <SmokeRegion room={room} />}
              {camera.model === "crowd-capacity" && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span>
                      Occupancy: {room.headcount} / {room.capacity} people
                    </span>
                    <span>{fill}% of capacity</span>
                  </div>
                  <Progress value={fill} className="mt-1 h-2" />
                </div>
              )}
            </>
          )}

          <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
            LIVE 30 FPS
          </span>
        </div>

        {/* Model-specific analytics banner */}
        <div className="rounded-md border bg-muted/40 p-3">
          {camera.model === "people-counting" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-info" />
                <span>
                  <strong>People Counting Active:</strong> Real-time bounding box detection & tracking.
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono">
                <span>Detected: <strong>{room?.headcount ?? 0}</strong></span>
                <span>Peak Today: <strong>{room?.peakToday ?? 0}</strong></span>
                <span>Avg Confidence: <strong>0.94</strong></span>
              </div>
            </div>
          )}

          {camera.model === "smoke-detection" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-destructive" />
                <span>
                  <strong>Smoke Detection Active:</strong> Optical haze and flame pattern analysis.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Status:</span>
                <SmokeChip status={room?.smoke ?? "clear"} />
              </div>
            </div>
          )}

          {camera.model === "crowd-capacity" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-warning" />
                <span>
                  <strong>Capacity Monitoring Active:</strong> Crowd density & threshold alerting.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>Limit: <strong>{room?.capacity ?? 0} max</strong></span>
                <span>Current: <strong>{fill}% capacity</strong></span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Dashboard() {
  const [cameraList, setCameraList] = useState<Camera[]>(initialCameras);
  const [selectedModel, setSelectedModel] = useState<"all" | AIModel>("all");

  const handleModelChange = (camId: string, model: AIModel) => {
    setCameraList((prev) =>
      prev.map((c) => (c.id === camId ? { ...c, model } : c))
    );
  };

  const filteredCameras = useMemo(() => {
    if (selectedModel === "all") return cameraList;
    return cameraList.filter((c) => c.model === selectedModel);
  }, [cameraList, selectedModel]);

  // Model counts for filter tabs
  const modelCounts = useMemo(() => {
    const people = cameraList.filter((c) => c.model === "people-counting").length;
    const smoke = cameraList.filter((c) => c.model === "smoke-detection").length;
    const capacity = cameraList.filter((c) => c.model === "crowd-capacity").length;
    return { all: cameraList.length, people, smoke, capacity };
  }, [cameraList]);

  const onlineCameras = cameraList.filter((c) => c.status === "online").length;
  const smokeAlerts = rooms.filter((r) => r.smoke === "alert").length;
  const recent = events.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monitoring Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            1 camera = 1 dedicated AI model. Select an AI model to view cameras operating that model.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Cctv}
          label="Total Cameras Online"
          value={`${onlineCameras}/${cameraList.length}`}
          detail={`${cameraList.length - onlineCameras} offline · 8 channels`}
        />
        <StatCard
          icon={Flame}
          label="Smoke Detection Alerts"
          value={String(smokeAlerts)}
          detail={smokeAlerts > 0 ? "Production Floor active alert" : "All smoke zones clear"}
          tone={smokeAlerts > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={Users}
          label="People Counted (Live)"
          value={String(totalHeadcount())}
          detail="Active people counting models"
        />
        <StatCard
          icon={History}
          label="Unacknowledged Events"
          value={String(unacknowledgedCount())}
          detail="Re-notify every 2 minutes"
          tone={unacknowledgedCount() > 0 ? "danger" : "default"}
        />
      </div>

      {/* AI Model Selector & Camera Feeds */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Select AI Model
            </h2>
            <p className="text-xs text-muted-foreground">
              Filter by AI model or view all cameras running their assigned model
            </p>
          </div>

          {/* Model Selection Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => setSelectedModel("all")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${selectedModel === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              All Cameras ({modelCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("people-counting")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${selectedModel === "people-counting"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Users className="h-3.5 w-3.5 text-info" />
              People Counting ({modelCounts.people})
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("smoke-detection")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${selectedModel === "smoke-detection"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Flame className="h-3.5 w-3.5 text-destructive" />
              Smoke Detection ({modelCounts.smoke})
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("crowd-capacity")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${selectedModel === "crowd-capacity"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Activity className="h-3.5 w-3.5 text-warning" />
              Crowd / Capacity ({modelCounts.capacity})
            </button>
          </div>
        </div>

        {/* Grid of Cameras */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCameras.map((camera) => {
            const room = roomById(camera.roomId);
            return (
              <CameraFeedCard
                key={camera.id}
                camera={camera}
                room={room}
                onModelChange={handleModelChange}
                showModelSelector={selectedModel === "all"}
              />
            );
          })}
        </div>
      </section>

      {/* Analytics Charts & Event log */}
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
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
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
            <Link to="/events" className={badgeVariants({ variant: "secondary" })}>
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((e) => {
              const room = roomById(e.roomId);
              return (
                <div key={e.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${e.type === "smoke"
                        ? "bg-destructive/10 text-destructive"
                        : e.type === "capacity"
                          ? "bg-warning/15 text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {e.type === "smoke" ? (
                      <Flame className="h-3.5 w-3.5" />
                    ) : (
                      <Users className="h-3.5 w-3.5" />
                    )}
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
