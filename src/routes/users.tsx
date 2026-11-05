import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Shield, UserCheck, UserX } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — AI CCTV Monitoring Platform" },
      { name: "description", content: "Manage system operators, security supervisors, and administrator permissions." },
    ],
  }),
  component: UsersPage,
});

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Security Lead" | "Operator" | "Auditor";
  status: "Active" | "Suspended";
  lastLogin: string;
}

const initialUsers: UserAccount[] = [
  {
    id: "USR-01",
    name: "Alexandre Vance",
    email: "a.vance@facility.internal",
    role: "Administrator",
    status: "Active",
    lastLogin: "2 mins ago",
  },
  {
    id: "USR-02",
    name: "Sarah Chen",
    email: "s.chen@facility.internal",
    role: "Security Lead",
    status: "Active",
    lastLogin: "14 mins ago",
  },
  {
    id: "USR-03",
    name: "Marcus Brody",
    email: "m.brody@facility.internal",
    role: "Operator",
    status: "Active",
    lastLogin: "1 hour ago",
  },
  {
    id: "USR-04",
    name: "Elena Rostova",
    email: "e.rostova@facility.internal",
    role: "Auditor",
    status: "Suspended",
    lastLogin: "3 days ago",
  },
];

const roleColor: Record<string, string> = {
  Administrator: "bg-destructive/10 text-destructive border-transparent",
  "Security Lead": "bg-info/10 text-info border-transparent",
  Operator: "bg-success/10 text-success border-transparent",
  Auditor: "bg-muted text-muted-foreground border-transparent",
};

function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserAccount["role"]>("Operator");

  const addUser = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const id = `USR-0${users.length + 1}`;
    setUsers((prev) => [
      ...prev,
      {
        id,
        name: name.trim(),
        email: email.trim(),
        role,
        status: "Active",
        lastLogin: "Just now",
      },
    ]);
    toast.success(`User ${name.trim()} added successfully`);
    setName("");
    setEmail("");
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === "Active" ? "Suspended" : "Active";
          toast.success(`User ${u.name} status updated to ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users & Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage personnel access permissions and security clearance roles across monitoring shifts.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add user
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add System User</DialogTitle>
              <DialogDescription>Grant operator or administrative access to the platform.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="user-name">Full Name</Label>
                <Input
                  id="user-name"
                  placeholder="e.g., David Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-email">Email Address</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="d.miller@facility.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-role">Role & Permissions</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserAccount["role"])}>
                  <SelectTrigger id="user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator (Full Control)</SelectItem>
                    <SelectItem value="Security Lead">Security Lead (Override & Review)</SelectItem>
                    <SelectItem value="Operator">Operator (Live View & Acknowledge)</SelectItem>
                    <SelectItem value="Auditor">Auditor (Read-only Log Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addUser}>Create user</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Active security personnel</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Shift</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Online</div>
            <p className="text-xs text-muted-foreground">Shift A · 08:00 - 16:00</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Clearance</CardTitle>
            <Shield className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level 4 Max</div>
            <p className="text-xs text-muted-foreground">Encrypted session tokens</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name & Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="pl-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{user.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleColor[user.role]}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.status === "Active"
                        ? "bg-success/10 text-success border-transparent"
                        : "bg-destructive/10 text-destructive border-transparent"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{user.lastLogin}</TableCell>
                <TableCell className="pr-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => toggleStatus(user.id)}
                  >
                    {user.status === "Active" ? (
                      <>
                        <UserX className="mr-1 h-3.5 w-3.5 text-destructive" /> Suspend
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-1 h-3.5 w-3.5 text-success" /> Activate
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
