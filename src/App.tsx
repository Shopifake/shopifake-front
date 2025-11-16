import { useState, useRef, useEffect, type RefObject } from "react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import shopifakeLogo from "./assets/2647669fc3033d478bbf4d08d352d49682ddc623.png";
import heroBackgroundGif from "./assets/9f21b4732eaea2b41aaff531ba55412e69a2df1e.png";
import storefrontPreview from "./assets/eaa98f8d3efebb1e4bda3e1f803aded55c5d8d2b.png";
import VariableProximity from "./components/VariableProximity";
import BlobCursor from "./components/BlobCursor";

// Owner Dashboard Components
import { DashboardOverview } from "./components/owner/DashboardOverview";
import { ProductList } from "./components/owner/ProductList";
import { ProductForm } from "./components/owner/ProductForm";
import { StockManagement } from "./components/owner/StockManagement";
import { UserManagement } from "./components/owner/UserManagement";
import { SitesList } from "./components/owner/SitesList";
import { SiteManagement } from "./components/owner/SiteManagement";
import { SiteSettings } from "./components/owner/SiteSettings";
import { AuditLog } from "./components/owner/AuditLog";
import { Settings } from "./components/owner/Settings";
import { SiteCreation } from "./components/owner/SiteCreation";
import { OwnerDashboardLayout } from "./components/owner/OwnerDashboardLayout";
import { OwnerLogin } from "./components/owner/OwnerLogin";
import { OwnerSignup } from "./components/owner/OwnerSignup";
import { mockStorefrontConfig, type StorefrontConfig } from "./lib/storefront-config";
import { buildStorefrontConfigFromDraft, demoSiteDraft, type SiteDraft } from "./lib/site-preview";
import { getSubdomain } from "./lib/subdomain-utils";
import { useGetSiteBySlug } from "./hooks/sites";
import { buildStorefrontConfigFromSiteConfig } from "./lib/site-config-to-storefront";
import type { SiteConfig } from "./types/api/sitesApiTypes";

// Storefront Components
import { StorefrontExperience } from "./components/storefront/StorefrontExperience";

type AppMode = "landing" | "owner" | "storefront" | "preview";
type OwnerView = "login" | "signup" | "dashboard";
type OwnerPage = "overview" | "products" | "product-form" | "stock" | "users" | "sites" | "site-management" | "site-settings" | "site-create" | "audit" | "settings";

export default function App() {
  const [mode, setMode] = useState<AppMode>("landing");
  const [ownerView, setOwnerView] = useState<OwnerView>("login");
  const [ownerPage, setOwnerPage] = useState<OwnerPage>("overview");
  const [ownerSelectedProductId, setOwnerSelectedProductId] = useState<string | undefined>();
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>();
  const [storefrontConfig, setStorefrontConfig] = useState<StorefrontConfig>(mockStorefrontConfig);
  const [previewDraft, setPreviewDraft] = useState<SiteDraft | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const heroProximityContainerRef = heroContainerRef as unknown as RefObject<HTMLElement | null>;

  // Fetch site by subdomain
  const { site: subdomainSite, isLoading: isLoadingSubdomainSite } = useGetSiteBySlug(subdomain);

  const clearPreviewDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("shopifake.previewDraft");
    }
    setPreviewDraft(null);
  };

  // Check for subdomain on mount and when hostname changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const detectedSubdomain = getSubdomain();
    setSubdomain(detectedSubdomain);

    // If subdomain is detected, we'll handle it in the subdomainSite effect
  }, []);

  // Handle subdomain site loading
  useEffect(() => {
    if (subdomain && subdomainSite) {
      // Check if site is active
      if (subdomainSite.status !== "ACTIVE") {
        setMode("landing");
        return;
      }

      // Parse site config
      let siteConfig: SiteConfig;
      try {
        siteConfig = JSON.parse(subdomainSite.config);
      } catch (error) {
        console.error("Failed to parse site config", error);
        setMode("landing");
        return;
      }

      // Build storefront config from site config
      const config = buildStorefrontConfigFromSiteConfig(siteConfig, subdomainSite.name);
      setStorefrontConfig(config);
      setMode("storefront");
    } else if (subdomain && !isLoadingSubdomainSite && !subdomainSite) {
      // Subdomain detected but site not found
      setMode("landing");
    }
  }, [subdomain, subdomainSite, isLoadingSubdomainSite]);

  // Handle preview mode
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Don't check for preview if we're on a subdomain
    if (subdomain) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "1") {
      const storedDraft = localStorage.getItem("shopifake.previewDraft");
      if (storedDraft) {
        try {
          const parsedDraft = JSON.parse(storedDraft) as SiteDraft;
          setPreviewDraft(parsedDraft);
          setMode("preview");
        } catch (error) {
          console.error("Failed to parse preview draft", error);
        }
      } else {
        setMode("preview");
      }
    }
  }, [subdomain]);

  // Owner Dashboard Handlers
  const handleOwnerLogin = () => {
    setOwnerView("dashboard");
    toast.success("Welcome back!");
  };

  const handleOwnerSignup = () => {
    setOwnerView("dashboard");
    toast.success("Account created successfully!");
  };

  const handleOwnerLogout = () => {
    setOwnerView("login");
    setMode("landing");
    clearPreviewDraft();
    toast.success("Logged out successfully");
  };

  const handleReturnToMain = () => {
    setMode("landing");
    setOwnerView("login");
    clearPreviewDraft();
  };

  const handleNavigate = (page: string) => {
    setOwnerPage(page as OwnerPage);
  };

  const handleCreateSite = () => {
    setSelectedSiteId(undefined);
    setOwnerPage("site-create");
  };

  const handlePreviewSite = (draft: SiteDraft) => {
    setPreviewDraft({ ...draft, values: [...draft.values] });
    localStorage.setItem("shopifake.previewDraft", JSON.stringify(draft));
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const previewUrl = `${baseUrl}?preview=1`;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleAddProduct = () => {
    setOwnerSelectedProductId(undefined);
    setOwnerPage("product-form");
  };

  const handleEditProduct = (id: string) => {
    setOwnerSelectedProductId(id);
    setOwnerPage("product-form");
  };

  const handleProductFormBack = () => {
    setOwnerPage("products");
    setOwnerSelectedProductId(undefined);
    toast.success("Product saved successfully!");
  };

  const handleManageSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    setOwnerPage("site-management");
  };

  const handleBackToSites = () => {
    setSelectedSiteId(undefined);
    setOwnerPage("sites");
  };

  const handleBackToSiteManagement = () => {
    setOwnerPage("site-management");
  };

  const handleSiteNavigate = (page: string) => {
    setOwnerPage(page as OwnerPage);
  };

  // Landing Page
  if (mode === "landing") {
    return (
      <div className="min-h-screen bg-background">
        <Toaster />
        
        {/* Dark Background Container */}
        <div className="bg-black">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Inner container with rounded corners */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 rounded-b-[6rem] overflow-hidden">
                <img 
                  src={heroBackgroundGif} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-4 h-screen flex flex-col justify-between text-center">
              {/* Logo */}
              <div className="flex items-center justify-center gap-6 pt-20 mb-12">
                <div className="bg-white px-8 rounded-[4rem] shadow-lg flex items-center gap-7">
                  <img src={shopifakeLogo} alt="Shopifake" className="h-44 w-44" />
                  <span className="text-6xl font-bold text-black">Shopifake</span>
                </div>
              </div>

              {/* Hero Text */}
              <div ref={heroContainerRef} className="bg-white/10 backdrop-blur-sm rounded-[3rem] px-8 py-6 mb-20 max-w-4xl mx-auto inline-block border border-white/20">
                <h1 className="text-3xl lg:text-5xl text-white mb-4">
                  <VariableProximity
                    label="The easier way to sell online"
                    fromFontVariationSettings="'wght' 400, 'opsz' 9"
                    toFontVariationSettings="'wght' 1000, 'opsz' 40"
                    containerRef={heroProximityContainerRef}
                    radius={150}
                    falloff="exponential"
                  />
                </h1>
                
                <p className="text-lg lg:text-xl text-white/90">
                  <VariableProximity
                    label="Start a business or grow an existing one with Shopifake. Get more than ecommerce software with tools to manage every part of your business."
                    fromFontVariationSettings="'wght' 400, 'opsz' 9"
                    toFontVariationSettings="'wght' 900, 'opsz' 35"
                    containerRef={heroProximityContainerRef}
                    radius={120}
                    falloff="exponential"
                  />
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <BlobCursor
            fillColor="#7C3AED"
            trailCount={3}
            sizes={[120, 125, 75]}
            innerSizes={[35, 35, 25]}
            innerColor="rgba(255,255,255,0.8)"
            opacities={[0.6, 0.6, 0.6]}
            shadowColor="rgba(0,0,0,0.75)"
            shadowBlur={5}
            shadowOffsetX={10}
            shadowOffsetY={10}
            filterStdDeviation={30}
            useFilter={true}
            fastDuration={0.1}
            slowDuration={0.5}
            zIndex={1}
          >
          <section className="relative px-4 py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl mb-4 text-white text-[48px]">Everything you need to start selling</h2>
              <p className="text-xl text-white/70">
                From your first sale to full scale, Shopifake is the only platform you'll ever need
              </p>
            </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-card border hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="bg-black/10 p-3 rounded-lg inline-block">
                  <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl mb-2">Online store</h3>
              <p className="text-muted-foreground">
                Build a beautiful, customizable online store with our intuitive design tools
              </p>
            </div>

            <div className="p-8 rounded-xl bg-card border hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="bg-black/10 p-3 rounded-lg inline-block">
                  <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl mb-2">Analytics & reporting</h3>
              <p className="text-muted-foreground">
                Get detailed insights into your sales, customers, and inventory in real-time
              </p>
            </div>

            <div className="p-8 rounded-xl bg-card border hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="bg-black/10 p-3 rounded-lg inline-block">
                  <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl mb-2">Secure payments</h3>
              <p className="text-muted-foreground">
                Accept all major payment methods with our secure, PCI-compliant checkout
              </p>
            </div>

            <div className="p-8 rounded-xl bg-card border hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="bg-black/10 p-3 rounded-lg inline-block">
                  <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl mb-2">Inventory management</h3>
              <p className="text-muted-foreground">
                Track stock levels, manage variants, and never oversell with automatic updates
              </p>
            </div>

            <div className="p-8 rounded-xl bg-card border hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="bg-black/10 p-3 rounded-lg inline-block">
                  <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl mb-2">Team collaboration</h3>
              <p className="text-muted-foreground">
                Invite team members with custom roles and permissions to manage your store
              </p>
            </div>

            <div className="p-8 rounded-xl bg-card border hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="bg-black/10 p-3 rounded-lg inline-block">
                  <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl mb-2">Marketing tools</h3>
              <p className="text-muted-foreground">
                Reach more customers with built-in email marketing and SEO tools
              </p>
            </div>
          </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 py-20 lg:py-32">
          <div className="container mx-auto">
            <h2 className="text-4xl lg:text-5xl mb-16 text-white text-center">
              Start your business journey today
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text & Buttons */}
              <div className="text-center lg:text-left">
                <p className="text-xl mb-12 text-white/70">
                  Get started with Shopifake, explore all the tools and features, and get the support you need to succeed
                </p>
                <div className="flex flex-col gap-6 items-center">
                  <button
                    onClick={() => setMode("owner")}
                    className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-colors w-64 text-center"
                  >
                    Get started now
                  </button>
                  <button
                    onClick={() => setMode("storefront")}
                    className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-colors w-64 text-center"
                  >
                    View demo storefront
                  </button>
                </div>
              </div>

              {/* Right side - Preview Image */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                  <img 
                    src={storefrontPreview}
                    alt="Petal & Bloom Storefront Preview" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </BlobCursor>

        {/* Footer */}
        <footer className="border-t border-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-white px-3 py-2 rounded-3xl shadow-lg flex items-center gap-2">
                  <img src={shopifakeLogo} alt="Shopifake" className="h-8 w-8" />
                  <span className="text-black">Shopifake</span>
                </div>
              </div>
              <p className="text-sm text-white/60">
                © 2025 Shopifake. Build your online store with confidence.
              </p>
            </div>
          </div>
        </footer>
        </div>
      </div>
    );
  }

  // Owner Dashboard
  if (mode === "owner") {
    if (ownerView === "login") {
      return (
        <>
          <Toaster />
          <OwnerLogin
            onLogin={handleOwnerLogin}
            onSwitchToSignup={() => setOwnerView("signup")}
            onReturnToMain={handleReturnToMain}
          />
        </>
      );
    }

    if (ownerView === "signup") {
      return (
        <>
          <Toaster />
          <OwnerSignup
            onSignup={handleOwnerSignup}
            onSwitchToLogin={() => setOwnerView("login")}
            onReturnToMain={handleReturnToMain}
          />
        </>
      );
    }

    return (
      <>
        <Toaster />
        <OwnerDashboardLayout
          currentPage={ownerPage}
          onNavigate={handleNavigate}
          onLogout={handleOwnerLogout}
          onReturnToMain={handleReturnToMain}
        >
          {ownerPage === "overview" && <DashboardOverview />}
          {ownerPage === "sites" && (
            <SitesList 
              onCreateSite={handleCreateSite} 
              onManageSite={handleManageSite}
            />
          )}
          {ownerPage === "site-create" && (
            <SiteCreation
              onBack={handleBackToSites}
              onPreview={handlePreviewSite}
              onSiteCreated={handleBackToSites}
              initialDraft={previewDraft ?? demoSiteDraft}
            />
          )}
          {ownerPage === "site-management" && selectedSiteId && (
            <SiteManagement 
              siteId={selectedSiteId}
              onBack={handleBackToSites}
              onNavigate={handleSiteNavigate}
            />
          )}
          {ownerPage === "site-settings" && selectedSiteId && (
            <SiteSettings 
              siteId={selectedSiteId}
              onBack={handleBackToSiteManagement}
              onSiteDeleted={handleBackToSites}
            />
          )}
          {ownerPage === "products" && selectedSiteId && (
            <ProductList
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              siteId={selectedSiteId}
              onBack={handleBackToSiteManagement}
            />
          )}
          {ownerPage === "product-form" && selectedSiteId && (
            <ProductForm
              productId={ownerSelectedProductId}
              onBack={handleProductFormBack}
            />
          )}
          {ownerPage === "stock" && selectedSiteId && (
            <StockManagement 
              siteId={selectedSiteId}
              onBack={handleBackToSiteManagement}
            />
          )}
          {ownerPage === "users" && selectedSiteId && (
            <UserManagement 
              siteId={selectedSiteId}
              onBack={handleBackToSiteManagement}
            />
          )}
          {ownerPage === "audit" && selectedSiteId && (
            <AuditLog 
              siteId={selectedSiteId}
              onBack={handleBackToSiteManagement}
            />
          )}
          {ownerPage === "settings" && (
            <Settings />
          )}
        </OwnerDashboardLayout>
      </>
    );
  }

  // Loading state for subdomain site
  if (subdomain && isLoadingSubdomainSite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading site...</p>
        </div>
      </div>
    );
  }

  // Storefront
  if (mode === "storefront") {
    return (
      <>
        <StorefrontExperience
          config={storefrontConfig}
          onReturnToMain={subdomain ? undefined : handleReturnToMain}
        />
      </>
    );
  }

  if (mode === "preview") {
    const config = previewDraft ? buildStorefrontConfigFromDraft(previewDraft) : null;

    if (!config) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <h1 className="text-2xl font-semibold">Preview unavailable</h1>
          <p className="text-muted-foreground max-w-md">
            We could not find a site draft to preview. Return to the dashboard and launch a preview again.
          </p>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => {
              clearPreviewDraft();
              window.location.href = window.location.origin;
            }}
          >
            Back to Shopifake
          </button>
        </div>
      );
    }

    return (
      <StorefrontExperience
        config={config}
        onReturnToMain={() => {
          clearPreviewDraft();
          window.location.href = window.location.origin;
        }}
      />
    );
  }

  return null;
}
