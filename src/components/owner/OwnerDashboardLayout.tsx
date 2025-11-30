import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useAuth } from "../../hooks/auth-b2e/index";
import { Button } from "../ui/button";
import { 
  LayoutDashboard, 
  Globe, 
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Logo } from "../shared/Logo";

interface OwnerDashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onReturnToMain?: () => void;
}

export function OwnerDashboardLayout({ 
  children, 
  currentPage, 
  onNavigate, 
  onLogout,
  onReturnToMain 
}: OwnerDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { user, loading, clearUser } = useAuthContext();
  const { logout } = useAuth();
  
  const userName = user ? `${user.firstName} ${user.lastName}` : "";
  const userInitials = user 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "";

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      clearUser();
      onLogout();
    }
  };

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "sites", label: "My Sites", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-card border-r transition-all duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {!sidebarCollapsed && <Logo />}
            {sidebarCollapsed && (
              <div className="mx-auto">
                <div className="bg-gradient-to-br from-[#3B82F6] to-[#22C55E] p-2 rounded-lg">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {onReturnToMain && (
                <>
                  <button
                    onClick={() => {
                      onReturnToMain();
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      hover:bg-muted text-muted-foreground hover:text-foreground
                      ${sidebarCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <ArrowLeft className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>Main Menu</span>}
                  </button>
                  <div className="my-2 border-t" />
                </>
              )}
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }
                      ${sidebarCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Collapse Toggle - Desktop Only */}
          <div className="hidden lg:block p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Collapse
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:pl-64 ${sidebarCollapsed ? "lg:pl-20" : ""} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b bg-card">
          <div className="flex items-center justify-between h-full px-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {loading ? "..." : userInitials || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">
                      {loading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        userName || "User"
                      )}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{userName}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}