import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { User, Mail, Phone, MapPin, Trash2, Save, AlertTriangle } from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { useGetSitesByOwner } from "../../hooks/sites/useGetSitesByOwner";
import { useUpdateProfile } from "../../hooks/auth-b2e/useUpdateProfile";
import { useDeleteProfile } from "../../hooks/auth-b2e/useDeleteProfile";


export function Profile({ onAccountDeleted }: { onAccountDeleted?: () => void }) {
  const { user, refreshUser } = useAuthContext();
  const { sites } = useGetSitesByOwner();
  const { deleteProfile } = useDeleteProfile();
  const { updateProfile } = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  // Check if user is owner of any site
  const ownedSites = sites.filter(site => site.role === "Owner");
  const canDeleteAccount = ownedSites.length === 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        phone,
        address,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
      await refreshUser();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original user data
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteProfile(deleteReason);
      toast.success("Account deleted successfully");
      setDeleteDialogOpen(false);
      if (onAccountDeleted) onAccountDeleted();
      globalThis.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1>Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <User className="h-4 w-4 inline mr-2" />
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                <User className="h-4 w-4 inline mr-2" />
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              <MapPin className="h-4 w-4 inline mr-2" />
              Address
            </Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your address"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>Overview of your account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Sites</p>
              <p className="text-2xl font-bold">{sites.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sites Owned</p>
              <p className="text-2xl font-bold">{ownedSites.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sites Managed</p>
              <p className="text-2xl font-bold">{sites.length - ownedSites.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Delete Account</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!canDeleteAccount && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
                  <p className="text-sm text-destructive font-medium mb-1">
                    Cannot delete account
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You are the owner of {ownedSites.length} site{ownedSites.length > 1 ? "s" : ""}. 
                    Please transfer ownership or delete these sites before deleting your account:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                    {ownedSites.map(site => (
                      <li key={site.id}>{site.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={!canDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </p>
              <div className="space-y-2">
                <Label htmlFor="deleteReason">
                  Please tell us why you're leaving (required)
                </Label>
                <Textarea
                  id="deleteReason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Your feedback helps us improve..."
                  rows={3}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting || !deleteReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}