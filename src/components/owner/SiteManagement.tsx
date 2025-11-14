import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, ExternalLink, Package, Users, BarChart3, Settings, FileText } from "lucide-react";
import { mockSites } from "../../lib/mock-data";

interface SiteManagementProps {
  siteId: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export function SiteManagement({ siteId, onBack, onNavigate }: SiteManagementProps) {
  const site = mockSites.find(s => s.id === siteId);
  
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

  const managementOptions = [
    {
      id: "products",
      title: "Products",
      description: "Manage your product catalog",
      icon: Package,
      count: site.products,
      color: "text-[#3B82F6]",
      bgColor: "bg-[#3B82F6]/10",
    },
    {
      id: "stock",
      title: "Stock Management",
      description: "Track and update inventory",
      icon: BarChart3,
      count: site.products,
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
                variant={site.status === "active" ? "default" : "secondary"}
                className={site.status === "active" ? "bg-[#22C55E] hover:bg-[#22C55E]/90" : ""}
              >
                {site.status}
              </Badge>
            </div>
            <a
              href={`https://${site.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1 mt-1"
            >
              {site.url}
              <ExternalLink className="h-3 w-3" />
            </a>
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
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-3xl mt-1">{site.products}</p>
              </div>
              <div className="bg-[#3B82F6]/10 p-3 rounded-lg">
                <Package className="h-6 w-6 text-[#3B82F6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl mt-1">{site.orders}</p>
              </div>
              <div className="bg-[#22C55E]/10 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-[#22C55E]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-3xl mt-1">${site.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
