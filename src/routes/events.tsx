import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Flame, ThumbsUp, ThumbsDown, Users, VideoOff } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  eventStatusLabel,
  eventTypeLabel,
  events,
  roomById,
  rooms,
  type EventStatus,
  type EventType,
  type MonitorEvent,
} from "@/lib/data";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Event Log — AI CCTV Monitoring Platform" },
      { name: "description", content: "Searchable log of smoke, capacity, and camera events with snapshots, clips, and review status." },
      { property: "og:title", content: "Event Log — AI CCTV Monitoring Platform" },
      { property: "og:description", content: "Searchable log of smoke, capacity, and camera events with snapshots, clips, and review status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});

const statusClass: Record<EventStatus, string> = {
  unacknowledged: "bg-destructive/10 text-destructive border-transparent",
  acknowledged: "bg-muted text-muted-foreground border-transparent",
  "true-alarm": "bg-success/10 text-success border-transparent",
  "false-alarm": "bg-warning/15 text-foreground border-transparent",
};

function TypeIcon({ type }: { type: EventType }) {
  if (type === "smoke") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-destructive">
        <Flame className="h-4 w-4" />
      </span>
    );
  }
  if (type === "capacity") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-warning/15 text-foreground">
        <Users className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <VideoOff className="h-4 w-4" />
    </span>
  );
}

function EventsPage() {
  const [items, setItems] = useState<MonitorEvent[]>(events);
  const [room, setRoom] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<MonitorEvent | null>(null);

  const filtered = useMemo(
    () =>
      items
        .filter((e) => (room === "all" ? true : e.roomId === room))
        .filter((e) => (type === "all" ? true : e.type === type))
        .filter((e) => (status === "all" ? true : e.status === status))
        .sort((a, b) => b.at.localeCompare(a.at)),
    [items, room, type, status],
  );

  const setStatusFor = (id: string, next: EventStatus, label: string) => {
    setItems((prev) => prev.map((e) => (e.id === id ? { ...e, status: next, handler: "admin" } : e)));
    toast.success(`${id} marked as ${label} (demo)`);
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: next } : prev));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Event Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Searchable history of smoke, capacity, and camera events — review, acknowledge, and label
          each one.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={room} onValueChange={setRoom}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Room" />
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
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>
            <SelectItem value="smoke">Smoke Detection</SelectItem>
            <SelectItem value="capacity">Capacity Exceeded</SelectItem>
            <SelectItem value="camera-offline">Camera Offline</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="true-alarm">True Alarm</SelectItem>
            <SelectItem value="false-alarm">False Alarm</SelectItem>
          </SelectContent>
        </Select>
        <Tabs value={type === "all" ? "all" : "filtered"} className="hidden" />

        <p className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {items.length} events · retention 30 days
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">Type</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Room / Camera</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Snapshot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => {
              const r = roomById(e.roomId);
              return (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelected(e)}>
                  <TableCell className="pl-4">
                    <TypeIcon type={e.type} />
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{eventTypeLabel[e.type]}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{e.id}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{r?.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{e.camera}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{e.at}</TableCell>
                  <TableCell>
                    {r?.image ? (
                      <img
                        src={r.image}
                        alt={`${r.name} snapshot`}
                        loading="lazy"
                        width={80}
                        height={45}
                        className="h-10 w-20 rounded object-cover"
                      />
                    ) : (
                      <span className="font-mono text-[10px] text-muted-foreground">no media</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusClass[e.status]}>
                      {eventStatusLabel[e.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                    {e.status === "unacknowledged" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mr-1 h-7"
                        onClick={() => setStatusFor(e.id, "acknowledged", "Acknowledged")}
                      >
                        <Check className="h-3.5 w-3.5" /> Acknowledge
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-1 h-7"
                      onClick={() => setStatusFor(e.id, "true-alarm", "True Alarm")}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> True
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      onClick={() => setStatusFor(e.id, "false-alarm", "False Alarm")}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" /> False
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No events match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail dialog */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {eventTypeLabel[selected.type]} · {selected.id}
                </DialogTitle>
                <DialogDescription>
                  {roomById(selected.roomId)?.name} · {selected.camera} ·{" "}
                  <span className="font-mono">{selected.at}</span>
                </DialogDescription>
              </DialogHeader>
              {roomById(selected.roomId)?.image ? (
                <img
                  src={roomById(selected.roomId)!.image!}
                  alt="Event snapshot"
                  className="aspect-video w-full rounded-lg border object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-zinc-900 font-mono text-xs tracking-widest text-zinc-500">
                  NO SNAPSHOT · CAMERA OFFLINE
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={statusClass[selected.status]}>
                  {eventStatusLabel[selected.status]}
                </Badge>
                {selected.confidence !== undefined && (
                  <Badge variant="secondary">AI confidence {(selected.confidence * 100).toFixed(0)}%</Badge>
                )}
                <Badge variant="secondary">Clip: 10 s before / 20 s after</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Handled by</dt>
                <dd>{selected.handler ?? "—"}</dd>
                <dt className="text-muted-foreground">Reason</dt>
                <dd>{selected.reason ?? "—"}</dd>
              </dl>
              {selected.status === "unacknowledged" && (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatusFor(selected.id, "true-alarm", "True Alarm")}
                  >
                    <ThumbsUp className="h-4 w-4" /> True Alarm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatusFor(selected.id, "false-alarm", "False Alarm")}
                  >
                    <ThumbsDown className="h-4 w-4" /> False Alarm
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStatusFor(selected.id, "acknowledged", "Acknowledged")}
                  >
                    <Check className="h-4 w-4" /> Acknowledge
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
