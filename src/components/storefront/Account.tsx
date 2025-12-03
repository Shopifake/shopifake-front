import { useState } from "react";
import { useAuth } from "../../hooks/auth-b2c/useGetCustomers";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Loader2, LogOut, Trash2 } from "lucide-react";
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
  const { user, isAuthenticated, isLoading, logout, updateProfile, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editable fields
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [telephone, setTelephone] = useState(user?.telephone || "");
  const [address, setAddress] = useState(user?.address || "");

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
    return <AuthPage siteId={siteId} />;
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
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      firstName,
      lastName,
      telephone,
      address,
    });
    if (success) {
      setIsEditing(false);
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
          {/* Non-editable fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label>Customer ID</Label>
              <Input value={user?.id || ""} disabled />
            </div>
          </div>

          {/* Editable fields */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Telephone</Label>
              <Input
                id="telephone"
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button type="button" onClick={handleStartEdit}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>

          {/* Danger zone */}
          <div className="pt-6 border-t space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
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