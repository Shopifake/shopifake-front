import { AlertTriangle, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BASE_DOMAIN } from "../lib/domain-config";
import type { SiteStatus } from "../types/api/sitesApiTypes";

interface SubdomainUnavailableProps {
  subdomain: string;
  status: SiteStatus;
}

const statusMessages: Record<SiteStatus, { title: string; description: string }> = {
  ACTIVE: {
    title: "Site disponible",
    description: "Ce site est actif.",
  },
  DRAFT: {
    title: "Site en préparation",
    description: "Ce site est encore en cours de configuration et n'est pas accessible publiquement.",
  },
  DISABLED: {
    title: "Site désactivé",
    description: "Ce site a été désactivé par son propriétaire et n'est plus accessible.",
  },
};

export function SubdomainUnavailable({ subdomain, status }: SubdomainUnavailableProps) {
  const getMainDomainUrl = () => {
    const protocol = window.location.protocol;
    return `${protocol}//${BASE_DOMAIN}`;
  };

  const handleGoToMainDomain = () => {
    window.location.href = getMainDomainUrl();
  };

  const statusMessage = statusMessages[status] ?? statusMessages.DISABLED;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">{statusMessage.title}</CardTitle>
          <CardDescription className="mt-2">
            Le sous-domaine <span className="font-mono font-semibold">{subdomain}</span> est actuellement en{" "}
            <span className="font-semibold">{status === "DRAFT" ? "DRAFT" : "DISABLED"}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>{statusMessage.description}</p>
          </div>
          <Button onClick={handleGoToMainDomain} className="w-full" size="lg">
            <Home className="mr-2 h-4 w-4" />
            Retour à {BASE_DOMAIN}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

