import lobbyImg from "@/assets/rooms/lobby.jpg";
import hallwayImg from "@/assets/rooms/hallway.jpg";
import meetingImg from "@/assets/rooms/meeting.jpg";
import productionImg from "@/assets/rooms/production.jpg";
import warehouseImg from "@/assets/rooms/warehouse.jpg";
import dockImg from "@/assets/rooms/dock.jpg";

export type SmokeStatus = "clear" | "suspected" | "alert";
export type CameraStatus = "online" | "offline";

export interface PersonBox {
  id: string;
  /** percent coordinates 0-100 relative to the video frame */
  x: number;
  y: number;
  w: number;
  h: number;
  conf: number;
}

export interface Room {
  id: string;
  name: string;
  image: string | null;
  cameras: string[];
  cameraStatus: CameraStatus;
  headcount: number;
  capacity: number;
  smoke: SmokeStatus;
  boxes: PersonBox[];
  smokeRegion?: { x: number; y: number; w: number; h: number };
  peakToday: number;
}

export const rooms: Room[] = [
  {
    id: "main-lobby",
    name: "Main Lobby",
    image: lobbyImg,
    cameras: ["LOBBY-CAM-01"],
    cameraStatus: "online",
    headcount: 4,
    capacity: 24,
    smoke: "clear",
    peakToday: 18,
    boxes: [
      { id: "P1", x: 28, y: 46, w: 7, h: 22, conf: 0.97 },
      { id: "P2", x: 44, y: 28, w: 6, h: 20, conf: 0.95 },
      { id: "P3", x: 68, y: 38, w: 6, h: 19, conf: 0.93 },
      { id: "P4", x: 20, y: 50, w: 6, h: 18, conf: 0.91 },
    ],
  },
  {
    id: "office-hallway",
    name: "Office Hallway",
    image: hallwayImg,
    cameras: ["HALL-CAM-02"],
    cameraStatus: "online",
    headcount: 4,
    capacity: 16,
    smoke: "clear",
    peakToday: 11,
    boxes: [
      { id: "P1", x: 48, y: 42, w: 8, h: 30, conf: 0.98 },
      { id: "P2", x: 61, y: 26, w: 5, h: 18, conf: 0.94 },
      { id: "P3", x: 70, y: 18, w: 4, h: 13, conf: 0.9 },
      { id: "P4", x: 71, y: 14, w: 3, h: 10, conf: 0.86 },
    ],
  },
  {
    id: "meeting-3",
    name: "Meeting Room 3",
    image: meetingImg,
    cameras: ["MEET-CAM-03"],
    cameraStatus: "online",
    headcount: 3,
    capacity: 10,
    smoke: "suspected",
    peakToday: 6,
    smokeRegion: { x: 12, y: 55, w: 30, h: 34 },
    boxes: [
      { id: "P1", x: 47, y: 26, w: 8, h: 18, conf: 0.97 },
      { id: "P2", x: 60, y: 40, w: 9, h: 20, conf: 0.95 },
      { id: "P3", x: 25, y: 58, w: 10, h: 22, conf: 0.92 },
    ],
  },
  {
    id: "production",
    name: "Production Floor",
    image: productionImg,
    cameras: ["PROD-CAM-04", "PROD-CAM-05"],
    cameraStatus: "online",
    headcount: 12,
    capacity: 48,
    smoke: "alert",
    peakToday: 31,
    smokeRegion: { x: 30, y: 12, w: 38, h: 30 },
    boxes: [
      { id: "P1", x: 27, y: 26, w: 4, h: 12, conf: 0.96 },
      { id: "P2", x: 81, y: 52, w: 6, h: 22, conf: 0.98 },
      { id: "P3", x: 55, y: 24, w: 3, h: 9, conf: 0.9 },
      { id: "P4", x: 40, y: 30, w: 3, h: 8, conf: 0.88 },
      { id: "P5", x: 66, y: 20, w: 3, h: 8, conf: 0.85 },
      { id: "P6", x: 12, y: 34, w: 4, h: 12, conf: 0.93 },
    ],
  },
  {
    id: "warehouse-a",
    name: "Warehouse A",
    image: warehouseImg,
    cameras: ["WH-CAM-06"],
    cameraStatus: "online",
    headcount: 2,
    capacity: 40,
    smoke: "clear",
    peakToday: 9,
    boxes: [
      { id: "P1", x: 23, y: 28, w: 4, h: 16, conf: 0.97 },
      { id: "P2", x: 79, y: 34, w: 4, h: 14, conf: 0.94 },
    ],
  },
  {
    id: "loading-dock",
    name: "Loading Dock",
    image: dockImg,
    cameras: ["DOCK-CAM-07"],
    cameraStatus: "online",
    headcount: 2,
    capacity: 25,
    smoke: "clear",
    peakToday: 8,
    boxes: [
      { id: "P1", x: 22, y: 42, w: 4, h: 18, conf: 0.96 },
      { id: "P2", x: 78, y: 30, w: 4, h: 14, conf: 0.93 },
    ],
  },
  {
    id: "server-room",
    name: "Server Room",
    image: null,
    cameras: ["SRV-CAM-08"],
    cameraStatus: "offline",
    headcount: 0,
    capacity: 6,
    smoke: "clear",
    peakToday: 0,
    boxes: [],
  },
];

export type EventType = "smoke" | "capacity" | "camera-offline";
export type EventStatus = "unacknowledged" | "acknowledged" | "true-alarm" | "false-alarm";

export interface MonitorEvent {
  id: string;
  type: EventType;
  roomId: string;
  camera: string;
  at: string;
  status: EventStatus;
  confidence?: number;
  handler?: string;
  reason?: string;
}

export const events: MonitorEvent[] = [
  { id: "EVT-1042", type: "smoke", roomId: "production", camera: "PROD-CAM-04", at: "2026-11-05 10:41:07", status: "unacknowledged", confidence: 0.91 },
  { id: "EVT-1041", type: "smoke", roomId: "meeting-3", camera: "MEET-CAM-03", at: "2026-11-05 10:38:22", status: "unacknowledged", confidence: 0.64 },
  { id: "EVT-1040", type: "capacity", roomId: "production", camera: "PROD-CAM-04", at: "2026-11-05 10:12:50", status: "unacknowledged" },
  { id: "EVT-1039", type: "smoke", roomId: "production", camera: "PROD-CAM-05", at: "2026-11-05 09:57:31", status: "true-alarm", confidence: 0.88, handler: "admin", reason: "Welding station visible smoke" },
  { id: "EVT-1038", type: "camera-offline", roomId: "server-room", camera: "SRV-CAM-08", at: "2026-11-05 09:44:02", status: "unacknowledged" },
  { id: "EVT-1037", type: "capacity", roomId: "main-lobby", camera: "LOBBY-CAM-01", at: "2026-11-05 09:20:15", status: "acknowledged", handler: "budi" },
  { id: "EVT-1036", type: "smoke", roomId: "warehouse-a", camera: "WH-CAM-06", at: "2026-11-05 08:58:44", status: "false-alarm", confidence: 0.41, handler: "sari", reason: "Dust from forklift, no smoke" },
  { id: "EVT-1035", type: "smoke", roomId: "production", camera: "PROD-CAM-04", at: "2026-11-04 17:03:19", status: "true-alarm", confidence: 0.9, handler: "admin", reason: "Confirmed burning smell" },
  { id: "EVT-1034", type: "capacity", roomId: "meeting-3", camera: "MEET-CAM-03", at: "2026-11-04 15:42:08", status: "true-alarm", handler: "rani", reason: "Client visit, 12 people in room" },
  { id: "EVT-1033", type: "smoke", roomId: "main-lobby", camera: "LOBBY-CAM-01", at: "2026-11-04 14:11:36", status: "false-alarm", confidence: 0.38, handler: "budi", reason: "Backlight haze at entrance" },
  { id: "EVT-1032", type: "camera-offline", roomId: "server-room", camera: "SRV-CAM-08", at: "2026-11-04 11:26:53", status: "acknowledged", handler: "admin" },
  { id: "EVT-1031", type: "smoke", roomId: "loading-dock", camera: "DOCK-CAM-07", at: "2026-11-04 08:47:10", status: "false-alarm", confidence: 0.35, handler: "sari", reason: "Truck exhaust fumes" },
  { id: "EVT-1030", type: "capacity", roomId: "production", camera: "PROD-CAM-04", at: "2026-11-03 16:30:41", status: "true-alarm", handler: "rani" },
  { id: "EVT-1029", type: "smoke", roomId: "meeting-3", camera: "MEET-CAM-03", at: "2026-11-03 10:05:27", status: "false-alarm", confidence: 0.44, handler: "budi", reason: "Steam from coffee machine" },
];

export type Role = "Admin" | "Manager" | "Operator" | "Viewer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastActive: string;
  status: "active" | "invited";
}

export const users: AppUser[] = [
  { id: "USR-001", name: "admin", email: "admin@cctv.io", role: "Admin", lastActive: "2026-11-05 10:40", status: "active" },
  { id: "USR-002", name: "Budi Santoso", email: "budi@cctv.io", role: "Operator", lastActive: "2026-11-05 10:22", status: "active" },
  { id: "USR-003", name: "Sari Wulandari", email: "sari@cctv.io", role: "Operator", lastActive: "2026-11-05 09:58", status: "active" },
  { id: "USR-004", name: "Rani Pratiwi", email: "rani@cctv.io", role: "Manager", lastActive: "2026-11-05 08:15", status: "active" },
  { id: "USR-005", name: "Andi Nugroho", email: "andi@cctv.io", role: "Viewer", lastActive: "2026-11-04 17:44", status: "active" },
  { id: "USR-006", name: "Maya Lestari", email: "maya@cctv.io", role: "Viewer", lastActive: "—", status: "invited" },
];

export interface AuditEntry {
  at: string;
  user: string;
  action: string;
  target: string;
  ip: string;
}

export const auditLog: AuditEntry[] = [
  { at: "2026-11-05 10:41:22", user: "admin", action: "Acknowledged alert", target: "EVT-1042", ip: "10.20.1.4" },
  { at: "2026-11-05 10:12:55", user: "budi", action: "Viewed clip", target: "EVT-1040", ip: "10.20.1.9" },
  { at: "2026-11-05 09:57:40", user: "admin", action: "Marked True Alarm", target: "EVT-1039", ip: "10.20.1.4" },
  { at: "2026-11-05 09:30:12", user: "rani", action: "Changed capacity limit", target: "Meeting Room 3", ip: "10.20.1.15" },
  { at: "2026-11-05 08:44:03", user: "sari", action: "Marked False Alarm", target: "EVT-1036", ip: "10.20.1.11" },
  { at: "2026-11-04 17:52:31", user: "admin", action: "Updated notification rule", target: "Camera offline", ip: "10.20.1.4" },
  { at: "2026-11-04 15:20:09", user: "admin", action: "Added camera", target: "DOCK-CAM-07", ip: "10.20.1.4" },
  { at: "2026-11-04 11:27:15", user: "admin", action: "Acknowledged alert", target: "EVT-1032", ip: "10.20.1.4" },
];

export interface NotificationRule {
  type: "Smoke detection" | "Capacity exceeded" | "Camera offline";
  inApp: boolean;
  email: boolean;
  recipients: string[];
  quietHoursExempt?: boolean;
  locked?: boolean;
}

export const notificationRules: NotificationRule[] = [
  { type: "Smoke detection", inApp: true, email: true, recipients: ["admin@cctv.io", "budi@cctv.io", "sari@cctv.io"], quietHoursExempt: true, locked: true },
  { type: "Capacity exceeded", inApp: true, email: true, recipients: ["rani@cctv.io", "admin@cctv.io"] },
  { type: "Camera offline", inApp: true, email: false, recipients: ["admin@cctv.io"] },
];

export type AIModel = "people-counting" | "smoke-detection" | "crowd-capacity";

export const aiModelLabels: Record<AIModel, string> = {
  "people-counting": "People Counting",
  "smoke-detection": "Smoke Detection",
  "crowd-capacity": "Crowd / Capacity",
};

export interface Camera {
  id: string;
  name: string;
  roomId: string;
  rtsp: string;
  resolution: string;
  status: CameraStatus;
  lastSeen: string;
  model: AIModel;
}

export const cameras: Camera[] = [
  { id: "LOBBY-CAM-01", name: "Lobby Cam 01", roomId: "main-lobby", rtsp: "rtsp://192.168.10.11:554/stream1", resolution: "1080p H.264", status: "online", lastSeen: "10:42:05", model: "people-counting" },
  { id: "HALL-CAM-02", name: "Hallway Cam 02", roomId: "office-hallway", rtsp: "rtsp://192.168.10.12:554/stream1", resolution: "1080p H.264", status: "online", lastSeen: "10:42:04", model: "people-counting" },
  { id: "MEET-CAM-03", name: "Meeting Cam 03", roomId: "meeting-3", rtsp: "rtsp://192.168.10.13:554/stream1", resolution: "1080p H.264", status: "online", lastSeen: "10:42:05", model: "smoke-detection" },
  { id: "PROD-CAM-04", name: "Production Cam 04", roomId: "production", rtsp: "rtsp://192.168.10.14:554/stream1", resolution: "1080p H.265", status: "online", lastSeen: "10:42:03", model: "smoke-detection" },
  { id: "PROD-CAM-05", name: "Production Cam 05", roomId: "production", rtsp: "rtsp://192.168.10.15:554/stream1", resolution: "720p H.264", status: "online", lastSeen: "10:42:05", model: "crowd-capacity" },
  { id: "WH-CAM-06", name: "Warehouse Cam 06", roomId: "warehouse-a", rtsp: "rtsp://192.168.10.16:554/stream1", resolution: "1080p H.264", status: "online", lastSeen: "10:42:04", model: "smoke-detection" },
  { id: "DOCK-CAM-07", name: "Dock Cam 07", roomId: "loading-dock", rtsp: "rtsp://192.168.10.17:554/stream1", resolution: "1080p H.264", status: "online", lastSeen: "10:42:05", model: "people-counting" },
  { id: "SRV-CAM-08", name: "Server Room Cam 08", roomId: "server-room", rtsp: "rtsp://192.168.10.18:554/stream1", resolution: "1080p H.264", status: "offline", lastSeen: "09:44:02", model: "smoke-detection" },
];

export const occupancyByHour = [
  { label: "00", people: 1 },
  { label: "02", people: 0 },
  { label: "04", people: 0 },
  { label: "06", people: 3 },
  { label: "07", people: 9 },
  { label: "08", people: 16 },
  { label: "09", people: 22 },
  { label: "10", people: 27 },
  { label: "11", people: 29 },
  { label: "12", people: 24 },
  { label: "13", people: 26 },
  { label: "14", people: 30 },
  { label: "15", people: 28 },
  { label: "16", people: 25 },
  { label: "17", people: 19 },
  { label: "18", people: 11 },
  { label: "19", people: 6 },
  { label: "20", people: 4 },
  { label: "22", people: 2 },
  { label: "23", people: 1 },
];

export const smokeLabel: Record<SmokeStatus, string> = {
  clear: "Clear",
  suspected: "Suspected",
  alert: "Smoke Alert",
};

export const eventStatusLabel: Record<EventStatus, string> = {
  unacknowledged: "Unacknowledged",
  acknowledged: "Acknowledged",
  "true-alarm": "True Alarm",
  "false-alarm": "False Alarm",
};

export const eventTypeLabel: Record<EventType, string> = {
  smoke: "Smoke Detection",
  capacity: "Capacity Exceeded",
  "camera-offline": "Camera Offline",
};

export const totalHeadcount = () => rooms.reduce((sum, r) => sum + r.headcount, 0);
export const unacknowledgedCount = () => events.filter((e) => e.status === "unacknowledged").length;
export const roomById = (id: string) => rooms.find((r) => r.id === id);
export const cameraById = (id: string) => cameras.find((c) => c.id === id);
