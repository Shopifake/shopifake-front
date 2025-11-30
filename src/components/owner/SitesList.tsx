// src/components/SitesList.tsx

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, ExternalLink } from "lucide-react";
import { useGetSitesByOwner } from "../../hooks/sites/useGetSitesByOwner";
import { Skeleton } from "../ui/skeleton";
import { getSiteUrl, BASE_DOMAIN } from "../../lib/domain-config";

// 1. Import the necessary type: SiteWithRole
import { SiteWithRole } from "../../types/api/sitesApiTypes"; 
import { JSX } from "react";

export function SitesList({ onCreateSite, onManageSite }: { 
  onCreateSite: () => void; 
  onManageSite: (siteId: string) => void;
}) {
  const { 
    sites, 
    isLoading, 
    error 
  }: { sites: SiteWithRole[], isLoading: boolean, error: Error | null } = useGetSitesByOwner();

  let content: JSX.Element;

  if (isLoading) {
    content = (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  } else if (sites.length === 0) {
    content = (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            No sites yet. Create your first site to get started!
          </p>
          <Button onClick={onCreateSite} className="bg-primary hover:bg-primary/90">
            Create New Site
          </Button>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <Card
            key={site.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onManageSite(site.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  {site.slug && (
                    <a
                      href={getSiteUrl(site.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1 mt-1"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                    >
                      {site.slug}.{BASE_DOMAIN}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col gap-1 items-end">
                  <Badge
                    variant={site.status === "ACTIVE" ? "default" : "secondary"}
                    className={site.status === "ACTIVE" ? "bg-[#22C55E] hover:bg-[#22C55E]/90" : ""}
                  >
                    {site.status.toLowerCase()}
                  </Badge>

                  {site.role && (
                    <Badge variant="outline" className="text-xs">
                      {site.role}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1">Currency: {site.currency}</p>
                  <p className="mb-1">Language: {site.language}</p>
                  {site.description && <p className="line-clamp-2">{site.description}</p>}
                </div>

                <div className="flex justify-end pt-2">
                  {site.slug && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        window.open(getSiteUrl(site.slug), "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <p className="text-destructive text-center">
              Failed to load sites: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {content}
    </div>
  );
}
