import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ChevronsUpDown,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserX,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";

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
    name: "Alex Pratama",
    email: "alex.p@facility.internal",
    role: "Administrator",
    status: "Active",
    lastLogin: "Today, 10:22",
  },
  {
    id: "USR-02",
    name: "Siti Rahma",
    email: "siti.r@facility.internal",
    role: "Security Lead",
    status: "Active",
    lastLogin: "Today, 08:45",
  },
  {
    id: "USR-03",
    name: "Budi Santoso",
    email: "budi.s@facility.internal",
    role: "Operator",
    status: "Active",
    lastLogin: "Yesterday, 22:15",
  },
  {
    id: "USR-04",
    name: "Diana Putri",
    email: "diana.p@facility.internal",
    role: "Operator",
    status: "Active",
    lastLogin: "Today, 07:05",
  },
  {
    id: "USR-05",
    name: "Rian Hidayat",
    email: "rian.h@facility.internal",
    role: "Auditor",
    status: "Suspended",
    lastLogin: "3 days ago",
  },
];

const rolePillClass: Record<UserAccount["role"], string> = {
  Administrator:
    "rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  "Security Lead":
    "rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  Operator:
    "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  Auditor:
    "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300",
};

function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserAccount["role"]>("Operator");

  const userRoleOptions: SelectOptionProps[] = useMemo(
    () => [
      { value: "Administrator", label: "Administrator" },
      { value: "Security Lead", label: "Security Lead" },
      { value: "Operator", label: "Operator" },
      { value: "Auditor", label: "Auditor" },
    ],
    [],
  );

  const filterRoleOptions: SelectOptionProps[] = useMemo(
    () => [
      { value: "all", label: "All Roles" },
      { value: "Administrator", label: "Administrator" },
      { value: "Security Lead", label: "Security Lead" },
      { value: "Operator", label: "Operator" },
      { value: "Auditor", label: "Auditor" },
    ],
    [],
  );

  const filterStatusOptions: SelectOptionProps[] = useMemo(
    () => [
      { value: "all", label: "All Status" },
      { value: "Active", label: "Active" },
      { value: "Suspended", label: "Suspended" },
    ],
    [],
  );

  const addUser = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Please enter user name and email");
      return;
    }
    const id = `USR-0${users.length + 1}`;
    setUsers((prev) => [
      ...prev,
      {
        id,
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        status: "Active",
        lastLogin: "Never",
      },
    ]);
    toast.success(`User "${newName.trim()}" added successfully`);
    setNewName("");
    setNewEmail("");
    setNewRole("Operator");
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = u.status === "Active" ? "Suspended" : "Active";
          toast.success(`${u.name} is now ${next.toLowerCase()}`);
          return { ...u, status: next };
        }
        return u;
      }),
    );
  };

  const deleteUser = (id: string, name: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success(`User "${name}" removed (demo)`);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const match =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users & Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user accounts, roles, access levels, and active monitoring operators.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-1.5 self-start sm:self-auto">
              <Plus className="h-4 w-4" /> Add user
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add user account</DialogTitle>
              <DialogDescription>
                Assign role and create credentials for a new operator or supervisor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="user-name">Full name</Label>
                <Input
                  id="user-name"
                  placeholder="e.g. Raden Arya"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-email">Email address</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="raden.a@facility.internal"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div>
                <SelectInput
                  label="Role permission"
                  placeholder="Select a role"
                  datalist={userRoleOptions}
                  value={newRole}
                  onChange={(val) => {
                    if (val) setNewRole(val as UserAccount["role"]);
                  }}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addUser}>Create user</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role cards */}
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

      {/* Table Container enclosing Header Filters, Table, and Footer Pagination */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Header Filter Section inside table container */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card p-3 sm:p-4">
          {/* Search on the Left */}
          <Search
            placeholder="Search user, email, role..."
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
              datalist={filterRoleOptions}
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val ?? "all");
                setPage(1);
              }}
              containerClassName="w-38 sm:w-40"
              hideClear
            />

            <SelectInput
              datalist={filterStatusOptions}
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
                NAME & EMAIL <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>
                ROLE <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead>
                LAST LOGIN <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
              </TableHead>
              <TableHead className="pr-4 text-right">MANAGE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((user) => (
              <TableRow key={user.id}>
                {/* Action buttons */}
                <TableCell className="pl-4">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="iconEdit"
                      size="iconS"
                      onClick={() => toggleStatus(user.id)}
                      title={user.status === "Active" ? "Suspend user" : "Activate user"}
                    >
                      {user.status === "Active" ? (
                        <UserX className="size-3.5 text-amber-600" />
                      ) : (
                        <UserCheck className="size-3.5 text-emerald-600" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="iconDelete"
                      size="iconS"
                      onClick={() => deleteUser(user.id, user.name)}
                      title="Delete user"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>

                {/* Status pill badge */}
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      user.status === "Active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>

                {/* Name & Email */}
                <TableCell>
                  <p className="font-medium">{user.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{user.email}</p>
                </TableCell>

                {/* Role */}
                <TableCell>
                  <span className={rolePillClass[user.role]}>
                    {user.role}
                  </span>
                </TableCell>

                {/* Last login */}
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {user.lastLogin}
                </TableCell>

                {/* Manage toggle button */}
                <TableCell className="pr-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => toggleStatus(user.id)}
                  >
                    {user.status === "Active" ? "Suspend" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No users match the current search or filters.
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
