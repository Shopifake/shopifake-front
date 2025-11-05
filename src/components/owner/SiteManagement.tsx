import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, ExternalLink, Package, Users, BarChart3, Settings, FileText, CreditCard, Calendar, CheckCircle2, Trash2, ShoppingCart } from "lucide-react";
import { mockSites } from "../../lib/mock-data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

interface SiteManagementProps {
  siteId: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export function SiteManagement({ siteId, onBack, onNavigate }: SiteManagementProps) {
  const site = mockSites.find(s => s.id === siteId);
  const [manageBillingOpen, setManageBillingOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  
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

  const maskCardNumber = (cardNumber: string) => {
    const lastFour = cardNumber.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  const maskCvc = (cvc: string) => {
    return "•".repeat(cvc.length);
  };

  const handleManageBillingClick = () => {
    if (site.billing) {
      setCardName(site.billing.cardInfo.name);
      setCardNumber(maskCardNumber(site.billing.cardInfo.number));
      setCardExpiry(site.billing.cardInfo.expiry);
      setCardCvc(maskCvc(site.billing.cardInfo.cvc));
    }
    setManageBillingOpen(true);
  };

  const handleUpdateCard = () => {
    toast.success(`Payment method updated for ${site.name}`);
    setManageBillingOpen(false);
  };

  const handleCancelSubscription = () => {
    toast.success(`Subscription cancelled for ${site.name}`);
    setCancelDialogOpen(false);
    setManageBillingOpen(false);
  };

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
      id: "orders",
      title: "Orders",
      description: "Track and manage orders",
      icon: ShoppingCart,
      count: site.orders,
      color: "text-red-600",
      bgColor: "bg-red-600/10",
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
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Billing Plan</p>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {site.billing.status}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{site.billing.price}</p>
              <p className="text-sm text-muted-foreground">Next: {site.billing.nextBilling}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={handleManageBillingClick}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
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
            const iconColor = option.id === 'orders' ? '#DC2626' : undefined; // red-600 hex
            const bgStyle = option.id === 'orders' ? { backgroundColor: 'rgba(220, 38, 38, 0.1)' } : undefined; // red-600 with 10% opacity
            return (
              <Card key={option.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate(option.id)}>
                <CardContent className="p-6">
                  <div className={`${option.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`} style={bgStyle}>
                    <Icon className={`h-6 w-6 ${option.color}`} style={iconColor ? { color: iconColor } : undefined} />
                  </div>
                  <h3 className="mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Manage Billing Dialog */}
      <Dialog open={manageBillingOpen} onOpenChange={setManageBillingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Billing</DialogTitle>
            <DialogDescription>
              Update payment method for {site.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-semibold">{site.billing.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Billing</span>
                <span className="text-sm">{site.billing.nextBilling}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCvc">CVC</Label>
                <Input
                  id="cardCvc"
                  placeholder="123"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  maxLength={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setManageBillingOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateCard} className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Update Card
              </Button>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => {
                setManageBillingOpen(false);
                setCancelDialogOpen(true);
              }}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your subscription for {site.name}. 
              You will lose access to all features at the end of your current billing period on {site.billing.nextBilling}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
