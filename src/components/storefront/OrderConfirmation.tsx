import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { CheckCircle, Home } from "lucide-react";

export function OrderConfirmation({ orderId, onContinue }: { orderId: string; onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#22C55E]/10 p-6 rounded-full">
              <CheckCircle className="h-16 w-16 text-[#22C55E]" />
            </div>
          </div>

          <h1 className="mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          <Card className="bg-muted mb-8">
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Order Number</p>
                  <p className="text-primary">{orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Order Date</p>
                  <p>November 3, 2025</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Estimated Delivery</p>
                  <p>November 8-10, 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 text-sm text-left max-w-md mx-auto mb-8">
            <h3>What happens next?</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  1
                </div>
                <div>
                  <p>We'll send a confirmation email to your inbox</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  2
                </div>
                <div>
                  <p>Your order will be processed and shipped within 1-2 business days</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  3
                </div>
                <div>
                  <p>Track your package using the tracking number we'll send you</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={onContinue} className="bg-primary hover:bg-primary/90">
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
            <Button variant="outline">
              View Order Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
