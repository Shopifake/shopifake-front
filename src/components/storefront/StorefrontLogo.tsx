import { cn } from "../ui/utils";
import { useStorefrontConfig } from "../../lib/storefront-config";

export function StorefrontLogo({ className = "" }: { className?: string }) {
  const { branding } = useStorefrontConfig();
  const Icon = branding.Icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {branding.logoUrl ? (
        <img
          src={branding.logoUrl}
          alt={branding.name}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <div className={cn("p-2 rounded-lg shadow-sm", branding.iconGradientClass)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      )}
      <div className="flex flex-col">
        <span className={cn("text-xl leading-none", branding.nameClass)}>{branding.name}</span>
        <span className={cn("text-xs italic", branding.taglineClass)}>{branding.tagline}</span>
      </div>
    </div>
  );
}
