import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, ExternalLink, Package, Users, BarChart3, Settings, FileText } from "lucide-react";
import { useGetSiteById } from "../../hooks/sites";
import { Skeleton } from "../ui/skeleton";

interface SiteManagementProps {
  siteId: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export function SiteManagement({ siteId, onBack, onNavigate }: SiteManagementProps) {
  const { site, isLoading } = useGetSiteById(siteId);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-px" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!site) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My Sites
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Site not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse config to get additional info
  let siteConfig: any = {};
  try {
    siteConfig = JSON.parse(site.config);
  } catch (e) {
    // Ignore parse errors
  }

  const statusDisplay = site.status.toLowerCase();
  const isActive = site.status === "ACTIVE";

  const managementOptions = [
    {
      id: "products",
      title: "Products",
      description: "Manage your product catalog",
      icon: Package,
      count: "Manage",
      color: "text-[#3B82F6]",
      bgColor: "bg-[#3B82F6]/10",
    },
    {
      id: "stock",
      title: "Stock Management",
      description: "Track and update inventory",
      icon: BarChart3,
      count: "Manage",
      color: "text-[#22C55E]",
      bgColor: "bg-[#22C55E]/10",
    },
    {
      id: "users",
      title: "Team Members",
      description: "Manage site users and permissions",
      icon: Users,
      count: "Team",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "audit",
      title: "Audit Log",
      description: "Track all actions and changes",
      icon: FileText,
      count: "Logs",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My Sites
          </Button>
          <div className="h-8 w-px bg-border" />
          <div>
            <div className="flex items-center gap-3">
              <h1>{site.name}</h1>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-[#22C55E] hover:bg-[#22C55E]/90" : ""}
              >
                {statusDisplay}
              </Badge>
            </div>
            {site.slug && (
              <a
                href={`https://${site.slug}.shopifake.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1 mt-1"
              >
                {site.slug}.shopifake.com
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {site.description && (
              <p className="text-sm text-muted-foreground mt-2">{site.description}</p>
            )}
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Site Settings
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="text-3xl mt-1">{site.currency}</p>
              </div>
              <div className="bg-[#3B82F6]/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Language</p>
                <p className="text-3xl mt-1">{site.language}</p>
              </div>
              <div className="bg-[#22C55E]/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm mt-1">{new Date(site.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Options */}
      <div>
        <h2 className="mb-4">Manage Site</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {managementOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate(option.id)}>
                <CardContent className="p-6">
                  <div className={`${option.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${option.color}`} />
                  </div>
                  <h3 className="mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
