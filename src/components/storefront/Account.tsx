import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/auth-b2c/useGetCustomers";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Loader2, LogOut, Trash2, Edit } from "lucide-react";
import { AuthPage } from "./Auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface AccountProps {
  siteId?: string;
}

export function Account({ siteId }: AccountProps) {
  const { user, isAuthenticated, isLoading, logout, updateProfile, deleteAccount, refetch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editable fields
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [telephone, setTelephone] = useState(user?.telephone || "");
  const [address, setAddress] = useState(user?.address || "");

  // Sync form values with user data when user changes
  useEffect(() => {
    if (user && !isEditing) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setTelephone(user.telephone || "");
      setAddress(user.address || "");
    }
  }, [user, isEditing]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, show login/register page
  if (!isAuthenticated) {
    return (
      <AuthPage
        siteId={siteId}
        onSuccess={async () => {
          // Refresh auth state in Account component after successful login/register
          await refetch();
        }}
      />
    );
  }

  // Reset form when starting to edit
  const handleStartEdit = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setTelephone(user?.telephone || "");
    setAddress(user?.address || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset to original user values
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setTelephone(user?.telephone || "");
    setAddress(user?.address || "");
    setIsEditing(false);
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsSaving(true);
    try {
      const success = await updateProfile({
        firstName,
        lastName,
        telephone,
        address,
      });
      if (success) {
        // Refresh user data to get updated values
        await refetch();
        // Return to profile view (read-only mode)
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>My Account</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header with Edit Button */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-2xl">Profile</CardTitle>
              <CardDescription>View and manage your account information</CardDescription>
            </div>
            {!isEditing && (
              <Button type="button" onClick={handleStartEdit} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Information */}
          {!isEditing ? (
            /* Read-only Profile View */
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-base">{user?.email || "Not provided"}</p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                    <p className="text-base">{user?.firstName || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                    <p className="text-base">{user?.lastName || "Not provided"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Telephone</Label>
                  <p className="text-base">{user?.telephone || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="text-base">{user?.address || "Not provided"}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName || ""}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName || ""}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Telephone</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={telephone || ""}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Enter telephone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address || ""}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Modification"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Danger zone */}
          <div className="pt-6 border-t space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout} disabled={isLoading || isSaving}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading || isSaving}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}