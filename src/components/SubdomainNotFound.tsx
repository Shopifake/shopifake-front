import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, Home } from "lucide-react";
import { BASE_DOMAIN } from "../lib/domain-config";

interface SubdomainNotFoundProps {
  subdomain: string;
}

export function SubdomainNotFound({ subdomain }: SubdomainNotFoundProps) {
  const getMainDomainUrl = () => {
    const protocol = window.location.protocol;
    return `${protocol}//${BASE_DOMAIN}`;
  };

  const handleGoToMainDomain = () => {
    window.location.href = getMainDomainUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Site introuvable</CardTitle>
          <CardDescription className="mt-2">
            Le sous-domaine <span className="font-mono font-semibold">{subdomain}</span> n'existe pas ou n'est pas disponible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="mb-2">Ce site n'a pas été trouvé. Cela peut signifier que :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Le site n'existe pas encore</li>
              <li>Le site a été supprimé</li>
              <li>Le site n'est pas encore activé</li>
            </ul>
          </div>
          <Button 
            onClick={handleGoToMainDomain}
            className="w-full"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Retour à {BASE_DOMAIN}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

