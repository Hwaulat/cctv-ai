import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronsUpDown,
  Download,
  Eye,
  Flame,
  ThumbsDown,
  ThumbsUp,
  Users,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectInput, type SelectOptionProps } from "@/components/ui/select-input";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
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

const statusPillClass: Record<EventStatus, string> = {
  unacknowledged:
    "rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  acknowledged:
    "rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  "true-alarm":
    "rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
  "false-alarm":
    "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300",
};

function TypeIcon({ type }: { type: EventType }) {
  if (type === "smoke") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive">
        <Flame className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (type === "capacity") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/15 text-foreground">
        <Users className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <VideoOff className="h-3.5 w-3.5" />
    </span>
  );
}

function EventsPage() {
  const [items, setItems] = useState<MonitorEvent[]>(events);
  const [search, setSearch] = useState("");
  const [room, setRoom] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<MonitorEvent | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((e) => {
        if (!q) return true;
        const r = roomById(e.roomId);
        return (
          e.id.toLowerCase().includes(q) ||
          e.camera.toLowerCase().includes(q) ||
          (r && r.name.toLowerCase().includes(q)) ||
          eventTypeLabel[e.type].toLowerCase().includes(q)
        );
      })
      .filter((e) => (room === "all" ? true : e.roomId === room))
      .filter((e) => (type === "all" ? true : e.type === type))
      .filter((e) => (status === "all" ? true : e.status === status))
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [items, search, room, type, status]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const setStatusFor = (id: string, next: EventStatus, label: string) => {
    setItems((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: next, handler: "admin" } : e)),
    );
    toast.success(`${id} marked as ${label} (demo)`);
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: next } : prev));
  };

  const handleExport = (e: MonitorEvent) => {
    toast.success(`Exporting clip for ${e.id} (${e.camera}) — MP4 download initiated (demo)`);
  };

  const roomOptions: SelectOptionProps[] = useMemo(
    () => [{ value: "all", label: "All Rooms" }, ...rooms.map((r) => ({ value: r.id, label: r.name }))],
    [],
  );

  const typeOptions: SelectOptionProps[] = useMemo(
    () => [
      { value: "all", label: "All Types" },
      { value: "smoke", label: "Smoke Detection" },
      { value: "capacity", label: "Capacity Exceeded" },
      { value: "camera-offline", label: "Camera Offline" },
    ],
    [],
  );

  const statusOptions: SelectOptionProps[] = useMemo(
    () => [
      { value: "all", label: "All Status" },
      { value: "unacknowledged", label: "Unacknowledged" },
      { value: "acknowledged", label: "Acknowledged" },
      { value: "true-alarm", label: "True Alarm" },
      { value: "false-alarm", label: "False Alarm" },
    ],
    [],
  );

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Event Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Searchable history of smoke, capacity, and camera events — review, acknowledge, and label
          each one.
        </p>
      </div>

      {/* Table Container enclosing Header Filters, Table, and Footer Pagination */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Header Filter Section inside table container */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card p-3 sm:p-4">
          {/* Search Input on the Left */}
          <Search
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            containerClassName="flex-1 min-w-[240px] h-9"
          />

          {/* Filter Dropdowns & Date Range on the Right */}
          <div className="flex flex-wrap items-center gap-2">
            <SelectInput
              datalist={roomOptions}
              value={room}
              onChange={(val) => {
                setRoom(val ?? "all");
                setPage(1);
              }}
              containerClassName="w-36 sm:w-40"
              hideClear
            />

            <SelectInput
              datalist={typeOptions}
              value={type}
              onChange={(val) => {
                setType(val ?? "all");
                setPage(1);
              }}
              containerClassName="w-40 sm:w-44"
              hideClear
            />

            <SelectInput
              datalist={statusOptions}
              value={status}
              onChange={(val) => {
                setStatus(val ?? "all");
                setPage(1);
              }}
              containerClassName="w-36 sm:w-40"
              hideClear
            />

            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1.5 bg-background text-xs font-normal text-muted-foreground"
              onClick={() => toast.info("Date range filter: showing all available events")}
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>dd/mm/yyyy - dd/mm/yyyy</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 pl-4">ACTION</TableHead>
              <TableHead>
                STATUS <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>
                TYPE <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>
                ROOM / CAMERA <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>
                DATE & TIME <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>SNAPSHOT</TableHead>
              <TableHead className="w-32 pr-4 text-right">EVALUATION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((e) => {
              const r = roomById(e.roomId);
              return (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelected(e)}>
                  {/* Action buttons (matching screenshot outline icon buttons) */}
                  <TableCell className="pl-4" onClick={(ev) => ev.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="iconView"
                        size="iconS"
                        onClick={() => setSelected(e)}
                        title="View details"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="icon"
                        intent="primary"
                        size="iconS"
                        className="w-8 h-8 border-gray-200 dark:border-gray-600"
                        onClick={() => handleExport(e)}
                        title="Export clip"
                      >
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <span className={statusPillClass[e.status]}>
                      {eventStatusLabel[e.status]}
                    </span>
                  </TableCell>

                  {/* Type (merged with Event Title & ID) */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <TypeIcon type={e.type} />
                      <div>
                        <p className="text-sm font-medium">{eventTypeLabel[e.type]}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{e.id}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Room / Camera */}
                  <TableCell>
                    <p className="text-sm">{r?.name ?? "—"}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{e.camera}</p>
                  </TableCell>

                  {/* Time */}
                  <TableCell className="font-mono text-xs text-muted-foreground">{e.at}</TableCell>

                  {/* Snapshot */}
                  <TableCell>
                    {r?.image ? (
                      <img
                        src={r.image}
                        alt={`${r.name} snapshot`}
                        loading="lazy"
                        width={80}
                        height={45}
                        className="h-9 w-16 rounded object-cover"
                      />
                    ) : (
                      <span className="font-mono text-[10px] text-muted-foreground">no media</span>
                    )}
                  </TableCell>

                  {/* Evaluation Actions (matching outline icon buttons from Action column) */}
                  <TableCell className="w-32 pr-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {/* Button Acknowledge */}
                      <Button
                        type="button"
                        variant="icon"
                        size="iconS"
                        className={cn(
                          "w-8 h-8 border-gray-200 dark:border-gray-600 transition-all",
                          e.status === "acknowledged"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "text-gray-400 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                        )}
                        onClick={() => setStatusFor(e.id, "acknowledged", "Acknowledged")}
                        title={e.status === "acknowledged" ? "Acknowledged" : "Acknowledge event"}
                        aria-label="Acknowledge event"
                      >
                        <Check className="size-3.5" />
                      </Button>

                      {/* Button Like (True Alarm) */}
                      <Button
                        type="button"
                        variant="icon"
                        size="iconS"
                        className={cn(
                          "w-8 h-8 border-gray-200 dark:border-gray-600 transition-all",
                          e.status === "true-alarm"
                            ? "border-red-500 bg-red-50 text-red-600 dark:border-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "text-gray-400 hover:border-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        )}
                        onClick={() => setStatusFor(e.id, "true-alarm", "True Alarm")}
                        title={e.status === "true-alarm" ? "True Alarm (Selected)" : "Mark as True Alarm"}
                        aria-label="Mark as True Alarm"
                      >
                        <ThumbsUp className="size-3.5" />
                      </Button>

                      {/* Button Dislike (False Alarm) */}
                      <Button
                        type="button"
                        variant="icon"
                        size="iconS"
                        className={cn(
                          "w-8 h-8 border-gray-200 dark:border-gray-600 transition-all",
                          e.status === "false-alarm"
                            ? "border-slate-500 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                            : "text-gray-400 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800/40 dark:hover:text-slate-300"
                        )}
                        onClick={() => setStatusFor(e.id, "false-alarm", "False Alarm")}
                        title={e.status === "false-alarm" ? "False Alarm (Selected)" : "Mark as False Alarm"}
                        aria-label="Mark as False Alarm"
                      >
                        <ThumbsDown className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No events match the current search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer Pagination matching screenshot */}
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="border-t bg-card"
        />
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
                <span className={statusPillClass[selected.status]}>
                  {eventStatusLabel[selected.status]}
                </span>
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
                    <ThumbsUp className="mr-1.5 h-4 w-4 text-destructive" /> True Alarm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatusFor(selected.id, "false-alarm", "False Alarm")}
                  >
                    <ThumbsDown className="mr-1.5 h-4 w-4" /> False Alarm
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStatusFor(selected.id, "acknowledged", "Acknowledged")}
                  >
                    <Check className="mr-1.5 h-4 w-4" /> Acknowledge
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
