import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Eye, EyeOff, Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cameras as initialCameras, rooms, type Camera } from "@/lib/data";

export const Route = createFileRoute("/cameras")({
  head: () => ({
    meta: [
      { title: "Cameras & Rooms — AI CCTV Monitoring Platform" },
      { name: "description", content: "Add cameras, define rooms, draw counting areas, smoke regions, and privacy masks." },
      { property: "og:title", content: "Cameras & Rooms — AI CCTV Monitoring Platform" },
      { property: "og:description", content: "Add cameras, define rooms, draw counting areas, smoke regions, and privacy masks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CamerasPage,
});

function CamerasPage() {
  const [list, setList] = useState<Camera[]>(initialCameras);
  const [capacities, setCapacities] = useState<Record<string, number>>(
    Object.fromEntries(rooms.map((r) => [r.id, r.capacity])),
  );
  const [masks, setMasks] = useState<Record<string, boolean>>(
    Object.fromEntries(rooms.map((r) => [r.id, r.id === "server-room"])),
  );
  const [newName, setNewName] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newRtsp, setNewRtsp] = useState("");
  const [newSecret, setNewSecret] = useState("");

  const addCamera = () => {
    if (!newName.trim() || !newRtsp.trim() || !newRoom) {
      toast.error("Camera name, room, and RTSP URL are required");
      return;
    }
    const id = `NEW-CAM-${String(list.length + 1).padStart(2, "0")}`;
    setList((prev) => [
      ...prev,
      {
        id,
        name: newName.trim(),
        roomId: newRoom,
        rtsp: newRtsp.trim(),
        resolution: "1080p H.264",
        status: "online",
        lastSeen: "just now",
      },
    ]);
    toast.success(`${newName.trim()} added — connection test passed (demo)`);
    setNewName("");
    setNewRoom("");
    setNewRtsp("");
    setNewSecret("");
  };

  const testConnection = (cam: Camera) =>
    cam.status === "online"
      ? toast.success(`${cam.id}: connection passed in 1.8 s (demo)`)
      : toast.error(`${cam.id}: connection failed — host unreachable (demo)`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cameras & Rooms</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Onboard cameras and configure rooms, capacities, and analysis zones without developer
          help.
        </p>
      </div>

      <Tabs defaultValue="cameras">
        <TabsList>
          <TabsTrigger value="cameras" className="gap-1.5">
            <Camera className="h-4 w-4" /> Cameras
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-1.5">
            <Users className="h-4 w-4" /> Rooms & Zones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cameras" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> Add camera
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add camera</DialogTitle>
                  <DialogDescription>
                    RTSP/ONVIF credentials are stored encrypted and never displayed again.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cam-name">Camera name</Label>
                    <Input
                      id="cam-name"
                      placeholder="e.g. Cafeteria Cam 09"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Assign to room</Label>
                    <Select value={newRoom} onValueChange={setNewRoom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cam-rtsp">RTSP / ONVIF URL</Label>
                    <Input
                      id="cam-rtsp"
                      placeholder="rtsp://192.168.10.19:554/stream1"
                      value={newRtsp}
                      onChange={(e) => setNewRtsp(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cam-secret">Stream credentials</Label>
                    <Input
                      id="cam-secret"
                      type="password"
                      placeholder="••••••••"
                      value={newSecret}
                      onChange={(e) => setNewSecret(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addCamera}>Save & test connection</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Camera</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Stream URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead className="pr-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((cam) => {
                  const room = rooms.find((r) => r.id === cam.roomId);
                  return (
                    <TableRow key={cam.id}>
                      <TableCell className="pl-4">
                        <p className="text-sm font-medium">{cam.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{cam.id}</p>
                      </TableCell>
                      <TableCell className="text-sm">{room?.name}</TableCell>
                      <TableCell className="max-w-52 truncate font-mono text-xs text-muted-foreground">
                        {cam.rtsp}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            cam.status === "online"
                              ? "bg-success/10 text-success border-transparent"
                              : "bg-destructive/10 text-destructive border-transparent"
                          }
                        >
                          {cam.status === "online" ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{cam.resolution}</TableCell>
                      <TableCell className="font-mono text-xs">{cam.lastSeen}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7"
                          onClick={() => testConnection(cam)}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Test
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{room.name}</CardTitle>
                  <CardDescription>
                    {room.cameras.length} camera{room.cameras.length > 1 ? "s" : ""} ·{" "}
                    <span className="font-mono">{room.cameras.join(", ")}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`cap-${room.id}`} className="text-xs">
                      Maximum capacity (alert after 30 s above limit)
                    </Label>
                    <Input
                      id={`cap-${room.id}`}
                      type="number"
                      min={0}
                      value={capacities[room.id] ?? room.capacity}
                      onChange={(e) =>
                        setCapacities((prev) => ({ ...prev, [room.id]: Number(e.target.value) }))
                      }
                      onBlur={() => toast.success(`${room.name} capacity set to ${capacities[room.id]} (demo)`)}
                      className="w-28"
                    />
                  </div>
                  <div className="space-y-2.5">
                    {(
                      [
                        ["Counting area", true],
                        ["Smoke-detection region", room.smoke !== "clear"],
                        ["Privacy mask", masks[room.id] ?? false],
                      ] as const
                    ).map(([label, on]) => {
                      const isMask = label === "Privacy mask";
                      return (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          {isMask ? (
                            <Switch
                              id={`mask-${room.id}`}
                              checked={masks[room.id] ?? false}
                              onCheckedChange={(v) => {
                                setMasks((prev) => ({ ...prev, [room.id]: v }));
                                toast.success(
                                  v
                                    ? `Privacy mask enabled for ${room.name} (demo)`
                                    : `Privacy mask disabled for ${room.name} (demo)`,
                                );
                              }}
                            />
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              {on ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              {on ? "Active" : "Not drawn"}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
