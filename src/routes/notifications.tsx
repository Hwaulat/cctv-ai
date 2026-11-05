import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Mail, MessageSquare, Plus, Send, Smartphone } from "lucide-react";
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

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Rules — AI CCTV Monitoring Platform" },
      { name: "description", content: "Configure real-time alerts for smoke, overcrowding, and camera disconnects via Webhook, Telegram, SMS, and Email." },
    ],
  }),
  component: NotificationsPage,
});

interface Rule {
  id: string;
  name: string;
  trigger: string;
  channels: string[];
  recipients: string;
  active: boolean;
}

const initialRules: Rule[] = [
  {
    id: "RULE-01",
    name: "Immediate Smoke & Fire Alarm",
    trigger: "Smoke suspected or alert (Confidence ≥ 85%)",
    channels: ["Webhook", "Telegram", "SMS", "Email"],
    recipients: "security-team@facility.internal, +62812345678",
    active: true,
  },
  {
    id: "RULE-02",
    name: "Overcrowding Warning (>100% capacity)",
    trigger: "Headcount ≥ Capacity for > 30 seconds",
    channels: ["Telegram", "Email"],
    recipients: "operations-mgr@facility.internal",
    active: true,
  },
  {
    id: "RULE-03",
    name: "Camera Disconnect Alert",
    trigger: "Camera offline > 15 seconds",
    channels: ["Webhook", "Email"],
    recipients: "it-support@facility.internal",
    active: true,
  },
];

function NotificationsPage() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("smoke");
  const [newRecipients, setNewRecipients] = useState("");

  const addRule = () => {
    if (!newName.trim() || !newRecipients.trim()) {
      toast.error("Please enter rule name and recipients");
      return;
    }
    const id = `RULE-0${rules.length + 1}`;
    setRules((prev) => [
      ...prev,
      {
        id,
        name: newName.trim(),
        trigger: newTrigger === "smoke" ? "Smoke suspected or alert" : "Headcount ≥ Capacity",
        channels: ["Telegram", "Email"],
        recipients: newRecipients.trim(),
        active: true,
      },
    ]);
    toast.success(`Rule "${newName.trim()}" created successfully`);
    setNewName("");
    setNewRecipients("");
  };

  const toggleActive = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = !r.active;
          toast.success(`Rule ${r.name} is now ${updated ? "active" : "paused"}`);
          return { ...r, active: updated };
        }
        return r;
      }),
    );
  };

  const testWebhook = () => {
    toast.success("Test alert payload sent successfully to webhook endpoint (HTTP 200 OK)");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notification Rules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure automated channels and dispatch rules for AI detections and system events.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add alert rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Notification Rule</DialogTitle>
              <DialogDescription>
                Define conditions and dispatch channels for automated alerts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g., Server Room Thermal Warning"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rule-trigger">Trigger Event</Label>
                <Select value={newTrigger} onValueChange={setNewTrigger}>
                  <SelectTrigger id="rule-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smoke">Smoke or Fire Detected</SelectItem>
                    <SelectItem value="capacity">Room Overcrowding</SelectItem>
                    <SelectItem value="offline">Camera Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rule-recipients">Recipients / Webhook URL</Label>
                <Input
                  id="rule-recipients"
                  placeholder="email@facility.internal or https://api.ops/webhook"
                  value={newRecipients}
                  onChange={(e) => setNewRecipients(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addRule}>Save rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Telegram Bot</CardTitle>
            <MessageSquare className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
            <p className="text-xs text-muted-foreground">@CCTV_AI_Security_Bot</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Webhook Endpoint</CardTitle>
            <Send className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">https://hooks.facility.internal/cctv</p>
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={testWebhook}>
              Send test payload
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SMTP Email</CardTitle>
            <Mail className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Configured</div>
            <p className="text-xs text-muted-foreground">smtp.facility.internal:587</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SMS Gateway</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Standby</div>
            <p className="text-xs text-muted-foreground">Twilio API US-East</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Rule Name</TableHead>
              <TableHead>Trigger Condition</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="pl-4 font-medium">
                  {rule.name}
                  <span className="block font-mono text-[11px] text-muted-foreground">{rule.id}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{rule.trigger}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {rule.channels.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                  {rule.recipients}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      rule.active
                        ? "bg-success/10 text-success border-transparent"
                        : "bg-muted text-muted-foreground border-transparent"
                    }
                  >
                    {rule.active ? "Active" : "Paused"}
                  </Badge>
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Switch checked={rule.active} onCheckedChange={() => toggleActive(rule.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
