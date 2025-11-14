import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, ExternalLink, Settings } from "lucide-react";
import { mockSites } from "../../lib/mock-data";

export function SitesList({ onCreateSite, onManageSite }: { onCreateSite: () => void; onManageSite: (siteId: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>My Sites</h1>
          <p className="text-muted-foreground">Manage all your online stores</p>
        </div>
        <Button onClick={onCreateSite} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Create New Site
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockSites.map((site) => (
          <Card key={site.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onManageSite(site.id)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <a
                    href={`https://${site.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1 mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {site.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Badge
                  variant={site.status === "active" ? "default" : "secondary"}
                  className={site.status === "active" ? "bg-[#22C55E] hover:bg-[#22C55E]/90" : ""}
                >
                  {site.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl">{site.products}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div>
                    <p className="text-2xl">{site.orders}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl">${site.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://${site.url}`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
