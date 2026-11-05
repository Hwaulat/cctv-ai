import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera as CameraIcon, Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  cameras as initialCameras,
  rooms as initialRooms,
  type Camera,
  type Room,
  type AIModel,
  aiModelLabels,
} from "@/lib/data";

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
  const [activeTab, setActiveTab] = useState<string>("cameras");
  const [list, setList] = useState<Camera[]>(initialCameras);
  const [roomList, setRoomList] = useState<Room[]>(initialRooms);
  const [capacities, setCapacities] = useState<Record<string, number>>(
    Object.fromEntries(initialRooms.map((r) => [r.id, r.capacity])),
  );
  const [masks, setMasks] = useState<Record<string, boolean>>(
    Object.fromEntries(initialRooms.map((r) => [r.id, r.id === "server-room"])),
  );
  const [countingAreas, setCountingAreas] = useState<Record<string, boolean>>(
    Object.fromEntries(initialRooms.map((r) => [r.id, true])),
  );
  const [smokeRegions, setSmokeRegions] = useState<Record<string, boolean>>(
    Object.fromEntries(initialRooms.map((r) => [r.id, r.smoke !== "clear" || !!r.smokeRegion])),
  );

  // Add camera form state
  const [isAddCamOpen, setIsAddCamOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newRtsp, setNewRtsp] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [newModel, setNewModel] = useState<AIModel>("people-counting");

  // Add room form state
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState("20");
  const [newRoomCounting, setNewRoomCounting] = useState(true);
  const [newRoomSmokeAlert, setNewRoomSmokeAlert] = useState(false);
  const [newRoomMask, setNewRoomMask] = useState(false);

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
        model: newModel,
      },
    ]);
    setRoomList((prev) =>
      prev.map((r) => (r.id === newRoom ? { ...r, cameras: [...r.cameras, id] } : r))
    );
    toast.success(`${newName.trim()} added with model ${aiModelLabels[newModel]} — connection test passed (demo)`);
    setNewName("");
    setNewRoom("");
    setNewRtsp("");
    setNewSecret("");
    setNewModel("people-counting");
    setIsAddCamOpen(false);
  };

  const addRoom = () => {
    if (!newRoomName.trim()) {
      toast.error("Room name is required");
      return;
    }
    const cap = Math.max(1, parseInt(newRoomCapacity, 10) || 20);
    const slug =
      newRoomName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `room-${Date.now()}`;

    const newRoomObj: Room = {
      id: slug,
      name: newRoomName.trim(),
      image: null,
      cameras: [],
      cameraStatus: "online",
      headcount: 0,
      capacity: cap,
      smoke: newRoomSmokeAlert ? "alert" : "clear",
      boxes: [],
      peakToday: 0,
    };

    setRoomList((prev) => [...prev, newRoomObj]);
    setCapacities((prev) => ({ ...prev, [slug]: cap }));
    setMasks((prev) => ({ ...prev, [slug]: newRoomMask }));
    setCountingAreas((prev) => ({ ...prev, [slug]: newRoomCounting }));
    setSmokeRegions((prev) => ({ ...prev, [slug]: newRoomSmokeAlert }));

    toast.success(`Room "${newRoomName.trim()}" added successfully with capacity ${cap} (demo)`);
    setNewRoomName("");
    setNewRoomCapacity("20");
    setNewRoomCounting(true);
    setNewRoomSmokeAlert(false);
    setNewRoomMask(false);
    setIsAddRoomOpen(false);
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
          Onboard cameras and assign 1 dedicated AI model per camera, configure rooms, capacities, and analysis zones.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tab list row with action buttons aligned in parallel */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="cameras" className="gap-1.5">
              <CameraIcon className="h-4 w-4" /> Cameras
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-1.5">
              <Users className="h-4 w-4" /> Rooms & Zones
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeTab === "cameras" ? (
              <Dialog open={isAddCamOpen} onOpenChange={setIsAddCamOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-1.5">
                    <Plus className="h-4 w-4" /> Add camera
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add camera</DialogTitle>
                    <DialogDescription>
                      Configure stream details and assign a dedicated AI model (1 camera = 1 model).
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
                          {roomList.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Dedicated AI Model</Label>
                      <Select value={newModel} onValueChange={(v: AIModel) => setNewModel(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select 1 AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="people-counting">People Counting (Headcount & Boxes)</SelectItem>
                          <SelectItem value="smoke-detection">Smoke Detection (Fire & Smoke Hazard)</SelectItem>
                          <SelectItem value="crowd-capacity">Crowd / Capacity (Occupancy Limit)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        Each camera runs exactly 1 AI model at a time.
                      </p>
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
            ) : (
              <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-1.5">
                    <Plus className="h-4 w-4" /> Add room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add room</DialogTitle>
                    <DialogDescription>
                      Define a new room or zone to monitor, set maximum capacity, and configure analysis rules.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="room-name">Room name</Label>
                      <Input
                        id="room-name"
                        placeholder="e.g. Server Room B or Warehouse West"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="room-capacity">Maximum capacity</Label>
                      <Input
                        id="room-capacity"
                        type="number"
                        min={1}
                        placeholder="20"
                        value={newRoomCapacity}
                        onChange={(e) => setNewRoomCapacity(e.target.value)}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Triggers alert when headcount exceeds this limit.
                      </p>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="room-counting" className="text-xs font-medium">Counting area</Label>
                          <p className="text-[11px] text-muted-foreground">Enable people tracking in this zone</p>
                        </div>
                        <Switch
                          id="room-counting"
                          checked={newRoomCounting}
                          onCheckedChange={setNewRoomCounting}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="room-smoke" className="text-xs font-medium">Smoke detection</Label>
                          <p className="text-[11px] text-muted-foreground">Monitor smoke and fire hazards</p>
                        </div>
                        <Switch
                          id="room-smoke"
                          checked={newRoomSmokeAlert}
                          onCheckedChange={setNewRoomSmokeAlert}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="room-mask" className="text-xs font-medium">Privacy mask</Label>
                          <p className="text-[11px] text-muted-foreground">Mask sensitive area from stream</p>
                        </div>
                        <Switch
                          id="room-mask"
                          checked={newRoomMask}
                          onCheckedChange={setNewRoomMask}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addRoom}>Save room</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <TabsContent value="cameras" className="mt-4 space-y-4">
          <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Camera</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>AI Model</TableHead>
                  <TableHead>Stream URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead className="pr-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((cam) => {
                  const room = roomList.find((r) => r.id === cam.roomId);
                  return (
                    <TableRow key={cam.id}>
                      <TableCell className="pl-4">
                        <p className="text-sm font-medium">{cam.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{cam.id}</p>
                      </TableCell>
                      <TableCell className="text-sm">{room?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Select
                          value={cam.model}
                          onValueChange={(val: AIModel) => {
                            setList((prev) =>
                              prev.map((c) => (c.id === cam.id ? { ...c, model: val } : c))
                            );
                            toast.success(`Updated ${cam.name} to ${aiModelLabels[val]}`);
                          }}
                        >
                          <SelectTrigger className="h-7 w-38 text-xs font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="people-counting">People Counting</SelectItem>
                            <SelectItem value="smoke-detection">Smoke Detection</SelectItem>
                            <SelectItem value="crowd-capacity">Crowd / Capacity</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
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
            {roomList.map((room) => (
              <Card key={room.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{room.name}</CardTitle>
                  <CardDescription>
                    {room.cameras.length} camera{room.cameras.length > 1 ? "s" : ""}
                    {room.cameras.length > 0 && (
                      <>
                        {" "}· <span className="font-mono">{room.cameras.join(", ")}</span>
                      </>
                    )}
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-foreground">Counting area</span>
                        <p className="text-[11px] text-muted-foreground">
                          {countingAreas[room.id] ?? true ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <Switch
                        id={`counting-${room.id}`}
                        checked={countingAreas[room.id] ?? true}
                        onCheckedChange={(v) => {
                          setCountingAreas((prev) => ({ ...prev, [room.id]: v }));
                          toast.success(
                            v
                              ? `Counting area enabled for ${room.name} (demo)`
                              : `Counting area disabled for ${room.name} (demo)`,
                          );
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-foreground">Smoke-detection region</span>
                        <p className="text-[11px] text-muted-foreground">
                          {smokeRegions[room.id] ?? false ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <Switch
                        id={`smoke-${room.id}`}
                        checked={smokeRegions[room.id] ?? false}
                        onCheckedChange={(v) => {
                          setSmokeRegions((prev) => ({ ...prev, [room.id]: v }));
                          toast.success(
                            v
                              ? `Smoke-detection region enabled for ${room.name} (demo)`
                              : `Smoke-detection region disabled for ${room.name} (demo)`,
                          );
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-foreground">Privacy mask</span>
                        <p className="text-[11px] text-muted-foreground">
                          {masks[room.id] ?? false ? "Active" : "Inactive"}
                        </p>
                      </div>
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
                    </div>
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
