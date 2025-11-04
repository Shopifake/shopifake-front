import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { mockProducts } from "../../lib/mock-data";

interface CartItem {
  productId: string;
  quantity: number;
}

export function Cart({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout, 
  onContinueShopping 
}: { 
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}) {
  const cartItems = items.map(item => ({
    ...item,
    product: mockProducts.find(p => p.id === item.productId)!
  })).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8">Shopping Cart</h1>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some products to get started</p>
              <Button onClick={onContinueShopping} className="bg-[#EC4899] hover:bg-[#EC4899]/90 text-white">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.productId}>
                      <div className="flex gap-4">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="mb-1">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{item.product.category}</p>
                          <p className="text-primary">${item.product.price}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(item.productId)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-muted"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-1 border-x">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-muted"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-6" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              onClick={onContinueShopping}
              className="mt-4"
            >
              Continue Shopping
            </Button>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                {shipping > 0 && subtotal < 50 && (
                  <div className="bg-[#22C55E]/10 border border-[#22C55E] rounded-lg p-3 text-sm">
                    Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={onCheckout}
                >
                  Proceed to Checkout
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  Secure checkout powered by Shopifake
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
