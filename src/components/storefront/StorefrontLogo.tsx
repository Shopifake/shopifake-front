import { Flower2 } from "lucide-react";

export function StorefrontLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-gradient-to-br from-[#EC4899] to-[#F43F5E] p-2 rounded-lg shadow-sm">
        <Flower2 className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl text-[#EC4899] leading-none">Petal & Bloom</span>
        <span className="text-xs text-[#10B981] italic">Artisan Florals</span>
      </div>
    </div>
  );
}
