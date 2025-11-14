import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertTriangle, Package, ArrowLeft } from "lucide-react";
import { mockProducts, mockSites } from "../../lib/mock-data";

export function StockManagement({ siteId, onBack }: { siteId: string; onBack?: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(0);
  const [open, setOpen] = useState(false);

  const site = mockSites.find(s => s.id === siteId);
  const siteProducts = mockProducts.filter(p => p.siteId === siteId);
  const lowStockProducts = siteProducts.filter(p => p.stock < 20);

  const handleRestock = (product: any) => {
    setSelectedProduct(product);
    setQuantity(0);
    setOpen(true);
  };

  const handleSave = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to {site?.name || 'Site Management'}
        </Button>
      )}
      <div>
        <h1>Stock Management - {site?.name}</h1>
        <p className="text-muted-foreground">Monitor and adjust product inventory levels for this site</p>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-[#F59E0B]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
              <CardTitle className="text-[#F59E0B]">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {lowStockProducts.length} product(s) are running low on stock. Consider restocking soon.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>
                      <span className={
                        product.stock === 0 ? "text-destructive" : 
                        product.stock < 20 ? "text-[#F59E0B]" : 
                        "text-[#22C55E]"
                      }>
                        {product.stock} units
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : product.stock < 20 ? (
                        <Badge className="bg-[#F59E0B] hover:bg-[#F59E0B]/90">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-[#22C55E] hover:bg-[#22C55E]/90">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestock(product)}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Adjust Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Update the inventory level for this product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl">{selectedProduct?.stock} units</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Adjust Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity to add or remove"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground">
                Use positive numbers to add stock, negative to remove
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">New Stock Level</p>
              <p className="text-2xl">{(selectedProduct?.stock || 0) + quantity} units</p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
