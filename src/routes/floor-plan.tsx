import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Grid3x3, MapPinned, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rooms, type Room } from "@/lib/data";

export const Route = createFileRoute("/floor-plan")({
  head: () => ({
    meta: [
      { title: "Floor Plan Heatmap — AI CCTV Monitoring Platform" },
      { name: "description", content: "Live occupancy heatmap on the floor plan with per-room density and person positions." },
      { property: "og:title", content: "Floor Plan Heatmap — AI CCTV Monitoring Platform" },
      { property: "og:description", content: "Live occupancy heatmap on the floor plan with per-room density and person positions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FloorPlanPage,
});

interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

const layout: Record<string, Zone> = {
  "main-lobby": { x: 30, y: 30, w: 250, h: 170 },
  "office-hallway": { x: 30, y: 220, w: 250, h: 110 },
  "meeting-3": { x: 300, y: 30, w: 170, h: 140 },
  "warehouse-a": { x: 300, y: 190, w: 170, h: 140 },
  "server-room": { x: 300, y: 350, w: 170, h: 110 },
  production: { x: 490, y: 30, w: 380, h: 260 },
  "loading-dock": { x: 490, y: 310, w: 380, h: 150 },
};

/** green → yellow → red by density ratio */
function heatColor(ratio: number) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const hue = 140 - clamped * 140;
  return `hsl(${hue}, 78%, 50%)`;
}

function personDots(room: Room, zone: Zone) {
  return Array.from({ length: room.headcount }, (_, i) => {
    const cx = zone.x + 14 + ((i * 47 + room.name.length * 13) % (zone.w - 28));
    const cy = zone.y + 16 + ((i * 71 + room.name.length * 29) % (zone.h - 30));
    return { cx, cy, key: `${room.id}-${i}` };
  });
}

function FloorPlanPage() {
  const [view, setView] = useState("both");
  const [range, setRange] = useState("live");
  const [roomFilter, setRoomFilter] = useState("all");
  const [showHeat, setShowHeat] = useState(true);

  const visible = (id: string) => roomFilter === "all" || roomFilter === id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Floor Plan Heatmap</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Occupancy density projected from calibrated cameras onto the floor plan (1 m × 1 m grid).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live · last 5 min</SelectItem>
              <SelectItem value="hour">Last hour</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rooms</SelectItem>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Card className="xl:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Level 1 — Main Building</CardTitle>
              <CardDescription>7 rooms · 8 cameras calibrated · cell size 1 m</CardDescription>
            </div>
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="heatmap" className="gap-1.5">
                  <Grid3x3 className="h-3.5 w-3.5" /> Heatmap
                </TabsTrigger>
                <TabsTrigger value="dots" className="gap-1.5">
                  <MapPinned className="h-3.5 w-3.5" /> Person dots
                </TabsTrigger>
                <TabsTrigger value="both" className="gap-1.5">
                  Both
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <svg viewBox="0 0 900 480" className="w-full rounded-lg border bg-muted/40">
              <defs>
                <pattern id="grid1m" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--color-border)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="900" height="480" fill="url(#grid1m)" />

              {rooms.map((room) => {
                const zone = layout[room.id];
                if (!zone) return null;
                const ratio = room.capacity > 0 ? room.headcount / room.capacity : 0;
                const dimmed = !visible(room.id);
                return (
                  <g key={room.id} opacity={dimmed ? 0.25 : 1}>
                    {view !== "dots" && showHeat && ratio > 0 && (
                      <rect
                        x={zone.x}
                        y={zone.y}
                        width={zone.w}
                        height={zone.h}
                        rx={6}
                        fill={heatColor(ratio)}
                        fillOpacity={0.4}
                      />
                    )}
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.w}
                      height={zone.h}
                      rx={6}
                      fill="none"
                      stroke="var(--color-foreground)"
                      strokeOpacity={0.35}
                      strokeWidth={1.5}
                    />
                    <text
                      x={zone.x + 10}
                      y={zone.y + 18}
                      fontSize={11}
                      fontWeight={600}
                      fill="var(--color-foreground)"
                      fillOpacity={0.8}
                    >
                      {room.name}
                    </text>
                    <text
                      x={zone.x + 10}
                      y={zone.y + 32}
                      fontSize={10}
                      fill="var(--color-muted-foreground)"
                      fontFamily="var(--font-mono)"
                    >
                      {room.headcount}/{room.capacity} · peak {room.peakToday}
                    </text>
                    {room.cameraStatus === "offline" && (
                      <text
                        x={zone.x + zone.w - 10}
                        y={zone.y + 18}
                        fontSize={10}
                        textAnchor="end"
                        fill="var(--color-destructive)"
                      >
                        CAM OFFLINE
                      </text>
                    )}
                    {view !== "heatmap" &&
                      personDots(room, zone).map((p) => (
                        <g key={p.key}>
                          <circle cx={p.cx} cy={p.cy} r={5} fill="var(--color-foreground)" fillOpacity={0.85} />
                          <circle cx={p.cx} cy={p.cy} r={9} fill="var(--color-foreground)" fillOpacity={0.15} />
                        </g>
                      ))}
                  </g>
                );
              })}
            </svg>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="h-2 w-full rounded-full" style={{ background: "linear-gradient(90deg, hsl(140,78%,50%), hsl(70,78%,50%), hsl(0,78%,50%))" }} />
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Low density</span>
                  <span>High density</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="show-heat" checked={showHeat} onCheckedChange={setShowHeat} />
                <Label htmlFor="show-heat" className="text-sm">
                  Show heatmap fill
                </Label>
              </div>
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Positions come from person ground points projected through each camera's calibrated
                homography.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Room occupancy</CardTitle>
              <CardDescription>Live counts · today's peak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {rooms.map((room) => {
                const ratio = room.capacity > 0 ? room.headcount / room.capacity : 0;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setRoomFilter(roomFilter === room.id ? "all" : room.id)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent ${
                      roomFilter === room.id ? "bg-accent" : ""
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: heatColor(ratio) }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{room.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {room.headcount}/{room.capacity}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
