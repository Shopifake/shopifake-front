import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { mockOrders, mockSites } from "../../lib/mock-data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

interface OrderManagementProps {
  siteId: string;
  onBack: () => void;
}

type OrderStatus = "ready-to-ship" | "shipped";

export function OrderManagement({ siteId, onBack }: OrderManagementProps) {
  const site = mockSites.find(s => s.id === siteId);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, OrderStatus>>(() => {
    const filtered = mockOrders.filter(o => o.siteId === siteId);
    return Object.fromEntries(filtered.map(o => [o.id, o.status as OrderStatus]));
  });
  const [expandedSummary, setExpandedSummary] = useState(true);
  const [activeView, setActiveView] = useState<"to-ship" | "shipped">("to-ship");

  // Calculate late orders first for sorting
  const getIsLateOrder = (order: typeof mockOrders[0]) => {
    const orderDate = new Date(order.orderDate);
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    return orderStatuses[order.id] === "ready-to-ship" && daysSinceOrder > 5;
  };

  // Sort orders: late orders first, then by date (latest first)
  const orders = mockOrders
    .filter(o => o.siteId === siteId)
    .sort((a, b) => {
      const aIsLate = getIsLateOrder(a);
      const bIsLate = getIsLateOrder(b);
      
      // Late orders come first
      if (aIsLate && !bIsLate) return -1;
      if (!aIsLate && bIsLate) return 1;
      
      // Within same late/not-late category, sort by date (latest first)
      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    });

  if (!site) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Site not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "ready-to-ship":
        return "bg-amber-500 hover:bg-amber-500/90";
      case "shipped":
        return "bg-blue-500 hover:bg-blue-500/90";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "ready-to-ship":
        return <Clock className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrderStatuses(prev => ({ ...prev, [orderId]: newStatus }));
    toast.success(`Order ${orderId} status updated to ${newStatus.replace("-", " ")}`);
  };

  const handleShipOrder = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleStatusChange(orderId, "shipped");
  };

  const handleOrderClick = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
  };

  // Daily summary calculations
  const today = new Date().toISOString().split('T')[0];
  const readyToShipOrders = orders.filter(o => orderStatuses[o.id] === "ready-to-ship");
  const shippedOrders = orders.filter(o => orderStatuses[o.id] === "shipped");
  const lateOrders = orders.filter(o => {
    const expectedDate = new Date(o.expectedDelivery);
    const orderDate = new Date(o.orderDate);
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    return orderStatuses[o.id] === "ready-to-ship" && daysSinceOrder > 5;
  });

  // Get orders for current view
  const displayedOrders = activeView === "to-ship" ? readyToShipOrders : shippedOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Site Management
          </Button>
          <div className="h-8 w-px bg-border" />
          <div>
            <h1>Order Management</h1>
            <p className="text-sm text-muted-foreground">{site.name}</p>
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Daily Summary</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedSummary(!expandedSummary)}
            >
              {expandedSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {expandedSummary && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Priority Orders */}
              <Card className="border-amber-200 dark:border-amber-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ready to Ship</p>
                      <p className="text-2xl font-bold">{readyToShipOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Late Orders */}
              <Card className="border-red-200 dark:border-red-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 p-3 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Late Shipments</p>
                      <p className="text-2xl font-bold">{lateOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Warnings and Alerts */}
            {lateOrders.length > 0 && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Late Shipments Detected</AlertTitle>
                  <AlertDescription>
                    {lateOrders.length} order(s) are delayed and need immediate attention: {lateOrders.map(o => o.id).join(", ")}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders</CardTitle>
            <Select value={activeView} onValueChange={(value: "to-ship" | "shipped") => setActiveView(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="to-ship">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    To Ship ({readyToShipOrders.length})
                  </div>
                </SelectItem>
                <SelectItem value="shipped">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipped ({shippedOrders.length})
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayedOrders.length === 0 ? (
              <div className="text-center py-12">
                {activeView === "to-ship" ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">All orders have been shipped!</p>
                  </>
                ) : (
                  <>
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No shipped orders yet</p>
                  </>
                )}
              </div>
            ) : (
              displayedOrders.map((order) => {
                const isLate = getIsLateOrder(order);
                const isToShip = activeView === "to-ship";
                return (
                  <Card 
                    key={order.id} 
                    className="transition-shadow hover:shadow-md cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{order.id}</h3>
                            <Badge className={getStatusColor(orderStatuses[order.id])}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(orderStatuses[order.id])}
                                {orderStatuses[order.id].replace("-", " ")}
                              </span>
                            </Badge>
                            {isLate && isToShip && (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Late
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Items</p>
                              <p className="font-medium">{order.items.length} product(s)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open: boolean) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  Order {selectedOrder.id}
                  <Badge className={getStatusColor(orderStatuses[selectedOrder.id])}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(orderStatuses[selectedOrder.id])}
                      {orderStatuses[selectedOrder.id].replace("-", " ")}
                    </span>
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="customer">Customer Info</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Products */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Products
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <Card key={idx}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">Variant: {item.variant}</p>
                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <p className="font-semibold">Total</p>
                        <p className="text-xl font-bold">${selectedOrder.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {selectedOrder.customerNotes && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Customer Notes
                      </h4>
                      <Card>
                        <CardContent className="p-3">
                          <p className="text-sm italic">{selectedOrder.customerNotes}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Expected Delivery */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Expected Delivery
                    </h4>
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-sm">{new Date(selectedOrder.expectedDelivery).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="customer" className="space-y-4">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedOrder.customerEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedOrder.customerPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h4>
                    <Card>
                      <CardContent className="p-4">
                        <p className="font-medium">{selectedOrder.customerName}</p>
                        <p className="text-sm mt-2">{selectedOrder.shippingAddress.street}</p>
                        <p className="text-sm">
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                        </p>
                        <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Ship Button */}
              <div className="mt-6">
                {orderStatuses[selectedOrder.id] === "ready-to-ship" ? (
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={() => handleShipOrder(selectedOrder.id, {} as React.MouseEvent)}
                  >
                    <Truck className="h-5 w-5 mr-2" />
                    Ship Order
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    variant="secondary"
                    size="lg"
                    disabled
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Already Shipped
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
