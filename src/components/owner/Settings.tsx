import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CreditCard, Calendar, Building2, CheckCircle2, ArrowUpCircle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

export function Settings() {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeConfirmDialogOpen, setUpgradeConfirmDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<typeof subscriptions[0] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const subscriptions = [
    {
      id: "1",
      websiteName: "Tech Store Pro",
      plan: "Premium",
      status: "Active",
      price: "$99.99/month",
      billingCycle: "Monthly",
      nextBilling: "Dec 5, 2025",
      features: ["Unlimited products", "Advanced analytics", "Priority support", "Custom domain"],
      cardInfo: {
        name: "John Doe",
        number: "4532123456784242",
        expiry: "12/28",
        cvc: "123",
      },
    },
    {
      id: "2",
      websiteName: "Fashion Boutique",
      plan: "Business",
      status: "Active",
      price: "$49.99/month",
      billingCycle: "Monthly",
      nextBilling: "Dec 12, 2025",
      features: ["Up to 500 products", "Basic analytics", "Email support", "Custom domain"],
      cardInfo: {
        name: "Jane Smith",
        number: "5412987654321098",
        expiry: "09/27",
        cvc: "456",
      },
    },
    {
      id: "3",
      websiteName: "Home Essentials",
      plan: "Starter",
      status: "Active",
      price: "$19.99/month",
      billingCycle: "Monthly",
      nextBilling: "Dec 18, 2025",
      features: ["Up to 100 products", "Basic analytics", "Community support"],
      cardInfo: {
        name: "Robert Johnson",
        number: "4916789012345678",
        expiry: "06/29",
        cvc: "789",
      },
    },
  ];

  const availablePlans = [
    {
      name: "Starter",
      price: "$19.99/month",
      features: ["Up to 100 products", "Basic analytics", "Community support"],
    },
    {
      name: "Business",
      price: "$49.99/month",
      features: ["Up to 500 products", "Basic analytics", "Email support", "Custom domain"],
    },
    {
      name: "Premium",
      price: "$99.99/month",
      features: ["Unlimited products", "Advanced analytics", "Priority support", "Custom domain"],
    },
  ];

  const maskCardNumber = (cardNumber: string) => {
    // Show only last 4 digits, mask the rest
    const lastFour = cardNumber.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  const maskCvc = (cvc: string) => {
    return "•".repeat(cvc.length);
  };

  const handleUpgradeClick = (subscription: typeof subscriptions[0]) => {
    setSelectedSubscription(subscription);
    setSelectedPlan(subscription.plan);
    setUpgradeDialogOpen(true);
  };

  const handleManageClick = (subscription: typeof subscriptions[0]) => {
    setSelectedSubscription(subscription);
    // Pre-fill with masked existing card info
    setCardName(subscription.cardInfo.name);
    setCardNumber(maskCardNumber(subscription.cardInfo.number));
    setCardExpiry(subscription.cardInfo.expiry);
    setCardCvc(maskCvc(subscription.cardInfo.cvc));
    setManageDialogOpen(true);
  };

  const handleUpgradeConfirm = () => {
    setUpgradeDialogOpen(false);
    setUpgradeConfirmDialogOpen(true);
  };

  const handleUpgrade = () => {
    const newPlanPrice = availablePlans.find(p => p.name === selectedPlan)?.price;
    toast.success(`Plan upgraded to ${selectedPlan} for ${selectedSubscription?.websiteName}`);
    setUpgradeConfirmDialogOpen(false);
  };

  const handleUpdateCard = () => {
    toast.success(`Payment method updated for ${selectedSubscription?.websiteName}`);
    setManageDialogOpen(false);
  };

  const handleCancelSubscription = () => {
    toast.success(`Subscription cancelled for ${selectedSubscription?.websiteName}`);
    setCancelDialogOpen(false);
    setManageDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">Manage your subscriptions and billing information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{subscription.websiteName}</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {subscription.status}
                </Badge>
              </div>
              <CardDescription>{subscription.plan} Plan</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Price</span>
                  </div>
                  <span className="font-semibold">{subscription.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Next billing</span>
                  </div>
                  <span className="text-sm">{subscription.nextBilling}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Features included:</p>
                <ul className="space-y-1">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleManageClick(subscription)}>
                  Manage
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleUpgradeClick(subscription)}>
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upgrade Plan</DialogTitle>
            <DialogDescription>
              Choose a new plan for {selectedSubscription?.websiteName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              {availablePlans.map((plan) => (
                <Label 
                  key={plan.name} 
                  htmlFor={plan.name}
                  className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-accent transition-colors"
                >
                  <RadioGroupItem value={plan.name} id={plan.name} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{plan.name}</span>
                      <span className="font-bold text-lg">{plan.price}</span>
                    </div>
                    <ul className="space-y-1 mt-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgradeConfirm} disabled={selectedPlan === selectedSubscription?.plan}>
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Confirmation Dialog */}
      <AlertDialog open={upgradeConfirmDialogOpen} onOpenChange={setUpgradeConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plan Upgrade</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                You are about to upgrade <span className="font-semibold">{selectedSubscription?.websiteName}</span> from{" "}
                <span className="font-semibold">{selectedSubscription?.plan}</span> to{" "}
                <span className="font-semibold">{selectedPlan}</span>.
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  New price: <span className="font-bold">{availablePlans.find(p => p.name === selectedPlan)?.price}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The upgrade will take effect immediately and you'll be charged the prorated amount for the remaining billing period.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpgrade}>
              Confirm Upgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Subscription Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Update payment method for {selectedSubscription?.websiteName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <Button variant="outline" onClick={() => setManageDialogOpen(false)} className="flex-1">
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
                setManageDialogOpen(false);
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
              This will cancel your subscription for {selectedSubscription?.websiteName}. 
              You will lose access to all features at the end of your current billing period on {selectedSubscription?.nextBilling}.
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
