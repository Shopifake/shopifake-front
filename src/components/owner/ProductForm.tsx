import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { mockProducts } from "../../lib/mock-data";

export function ProductForm({ productId, onBack }: { productId?: string; onBack: () => void }) {
  const existingProduct = productId ? mockProducts.find(p => p.id === productId) : null;
  
  const [formData, setFormData] = useState({
    name: existingProduct?.name || "",
    sku: existingProduct?.sku || "",
    category: existingProduct?.category || "",
    price: existingProduct?.price || 0,
    stock: existingProduct?.stock || 0,
    description: existingProduct?.description || "",
    status: existingProduct?.status || "draft",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1>{productId ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-muted-foreground">
            {productId ? "Update product information" : "Create a new product for your store"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Product Info</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="bg-gray-100 border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="PRD-001"
                      className="bg-gray-100 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="bg-gray-100 border-gray-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Apparel">Apparel</SelectItem>
                        <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={5}
                    className="bg-gray-100 border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="mb-2">Upload Product Images</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop images here or click to browse
                  </p>
                  <Button type="button" variant="outline">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      className="bg-gray-100 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare at Price</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-gray-100 border-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      placeholder="0"
                      className="bg-gray-100 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="bg-gray-100 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {productId ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
