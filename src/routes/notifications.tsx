import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Bell,
  ChevronsUpDown,
  Mail,
  MessageSquare,
  Plus,
  Send,
  Smartphone,
  Trash2,
} from "lucide-react";
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
import { SelectInput, type SelectOptionProps } from "@/components/ui/select-input";
import { Search } from "@/components/ui/search";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("smoke");
  const [newRecipients, setNewRecipients] = useState("");

  const triggerOptions: SelectOptionProps[] = useMemo(
    () => [
      { value: "smoke", label: "Smoke suspected / alert" },
      { value: "capacity", label: "Capacity exceeded" },
      { value: "offline", label: "Camera offline" },
    ],
    [],
  );

  const channelFilterOptions: SelectOptionProps[] = useMemo(
    () => [
      { value: "all", label: "All Channels" },
      { value: "Telegram", label: "Telegram" },
      { value: "Email", label: "Email" },
      { value: "Webhook", label: "Webhook" },
      { value: "SMS", label: "SMS" },
    ],
    [],
  );

  const statusFilterOptions: SelectOptionProps[] = useMemo(
    () => [
      { value: "all", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "paused", label: "Paused" },
    ],
    [],
  );

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

  const deleteRule = (id: string, name: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Rule "${name}" deleted (demo)`);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rules.filter((r) => {
      if (q) {
        const match =
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.trigger.toLowerCase().includes(q) ||
          r.recipients.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter === "active" && !r.active) return false;
      if (statusFilter === "paused" && r.active) return false;
      if (channelFilter !== "all" && !r.channels.includes(channelFilter)) return false;
      return true;
    });
  }, [rules, search, statusFilter, channelFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const testWebhook = () => toast.success("Test payload delivered with HTTP 200 (demo)");

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notification Rules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-channel dispatch rules with quiet-hours exemption for critical safety alerts.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-1.5 self-start sm:self-auto">
              <Plus className="h-4 w-4" /> Add notification rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add notification rule</DialogTitle>
              <DialogDescription>
                Define trigger condition, delivery channels, and recipient list.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rule-name">Rule name</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g. Critical Safety Escalate"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <SelectInput
                  label="Trigger event"
                  placeholder="Select trigger event"
                  datalist={triggerOptions}
                  value={newTrigger}
                  onChange={(val) => {
                    if (val) setNewTrigger(val);
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rule-recipients">Recipients (comma separated)</Label>
                <Input
                  id="rule-recipients"
                  placeholder="safety@cctv.io, +62812999"
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

      {/* Integration stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Telegram Bot</CardTitle>
            <MessageSquare className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
            <p className="text-xs text-muted-foreground">@SafetyAlertsCctvBot</p>
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

      {/* Table Container enclosing Header Filters, Table, and Footer Pagination */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Header Filter Section inside table container */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card p-3 sm:p-4">
          {/* Search on the Left */}
          <Search
            placeholder="Search rules, triggers, recipients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            containerClassName="flex-1 min-w-[240px] h-9"
          />

          {/* Filter Dropdowns on the Right */}
          <div className="flex flex-wrap items-center gap-2">
            <SelectInput
              datalist={channelFilterOptions}
              value={channelFilter}
              onChange={(val) => {
                setChannelFilter(val ?? "all");
                setPage(1);
              }}
              containerClassName="w-38 sm:w-40"
              hideClear
            />

            <SelectInput
              datalist={statusFilterOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val ?? "all");
                setPage(1);
              }}
              containerClassName="w-32 sm:w-36"
              hideClear
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 pl-4">ACTION</TableHead>
              <TableHead>
                STATUS <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>
                RULE NAME <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>
                TRIGGER CONDITION <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>CHANNELS</TableHead>
              <TableHead>RECIPIENTS</TableHead>
              <TableHead className="pr-4 text-right">TOGGLE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="pl-4">
                  <Button
                    type="button"
                    variant="iconDelete"
                    size="iconS"
                    onClick={() => deleteRule(rule.id, rule.name)}
                    title="Delete rule"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      rule.active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300"
                    }`}
                  >
                    {rule.active ? "Active" : "Paused"}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
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
                <TableCell className="pr-4 text-right">
                  <Switch checked={rule.active} onCheckedChange={() => toggleActive(rule.id)} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No notification rules match the current search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer Pagination */}
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="border-t bg-card"
        />
      </div>
    </div>
  );
}
