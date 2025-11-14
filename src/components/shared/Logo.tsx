import shopifakeLogo from "../../assets/2647669fc3033d478bbf4d08d352d49682ddc623.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-white px-3 py-2 rounded-3xl shadow-lg flex items-center gap-2">
        <img src={shopifakeLogo} alt="Shopifake" className="h-8 w-8" />
        <span className="text-black">Shopifake</span>
      </div>
    </div>
  );
}
