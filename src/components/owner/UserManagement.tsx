import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { UserPlus, Mail, ArrowLeft } from "lucide-react";
import { mockSites } from "../../lib/mock-data";
import { useAddManager } from "../../hooks/sites/useAddManager";
import { useGetManagers } from "../../hooks/sites/useGetManagers";
import { useUpdateManager } from "../../hooks/sites/useUpdateManager";
import { useDeleteManager } from "../../hooks/sites/useDeleteManager";
import { useAuthContext } from "../../contexts/AuthContext";

export function UserManagement({ siteId, onBack }: { siteId: string; onBack?: () => void }) {
  const currentUserEmail = useAuthContext().user?.email || "";

  const [editOpen, setEditOpen] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"Owner" | "CM" | "SM">("CM");
  const { updateManager, isLoading: isUpdating } = useUpdateManager();
  const { deleteManager, isLoading: isDeleting } = useDeleteManager();

  const handleEdit = (email: string, role: string) => {
    setEditEmail(email);
    // Map backend role to UI role
    let uiRole: "Owner" | "CM" | "SM" = "CM";
    if (role === "Owner") uiRole = "Owner";
    else if (role === "CM") uiRole = "CM";
    else if (role === "SM") uiRole = "SM";
    setEditRole(uiRole);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    await updateManager({ siteId, email: editEmail, role: editRole });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await deleteManager({ siteId, email: editEmail });
    setEditOpen(false);
  };

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Community Manager");
  const { addManager, isLoading } = useAddManager();

  const site = mockSites.find(s => s.id === siteId);
  const { managers, isLoading: isManagersLoading } = useGetManagers(siteId);

  const handleInvite = async () => {
    // Map UI role to backend role
    let backendRole: "Owner" | "CM" | "SM" = "CM";
    if (role === "Community Manager") backendRole = "CM";
    else if (role === "Stock Manager") backendRole = "SM";
    else if (role === "Admin") backendRole = "Owner";
    await addManager({ siteId, email, role: backendRole });
    setOpen(false);
    setEmail("");
    setRole("Community Manager");
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to {site?.name || 'Site Management'}
        </Button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management - {site?.name}</h1>
          <p className="text-muted-foreground">Invite and manage team members for this site</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Add a new team member to your store
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Community Manager">Community Manager</SelectItem>
                    <SelectItem value="Stock Manager">Stock Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} className="bg-primary hover:bg-primary/90">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isManagersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading...</TableCell>
                  </TableRow>
                ) : (
                  managers.map((entry: any) => (
                    <TableRow key={entry.user.id}>
                      <TableCell>{entry.user.firstName} {entry.user.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {entry.user.email !== currentUserEmail && (
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(entry.user.email, entry.role)}>
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Manager Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Change role or remove this user from the site
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input id="edit-email" type="email" value={editEmail} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editRole} onValueChange={(val: string) => setEditRole(val as "Owner" | "CM" | "SM")}> 
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Admin</SelectItem>
                  <SelectItem value="CM">Community Manager</SelectItem>
                  <SelectItem value="SM">Stock Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90" disabled={isUpdating}>
                Save Changes
              </Button>
              <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
                Remove User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}