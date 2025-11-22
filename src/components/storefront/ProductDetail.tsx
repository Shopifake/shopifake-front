import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react";
import type { StorefrontProductEntry } from "../../types/storefront";

type ProductDetailProps = {
  productId: string;
  products: StorefrontProductEntry[];
  onBack: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
};

const normalizeEntry = (entry: StorefrontProductEntry) => {
  if (entry.kind === "live") {
    const category = entry.product.categories?.[0]?.name ?? "Uncategorized";
    const images = entry.product.images?.length ? entry.product.images : [];
    return {
      id: entry.product.id,
      name: entry.product.name,
      description: entry.product.description ?? "",
      category,
      images,
      sku: entry.product.sku,
      priceAmount: entry.price?.amount,
      priceCurrency: entry.price?.currency,
      stock: entry.inventory?.availableQuantity ?? 0,
      status: entry.product.status,
      entry,
    };
  }

  return {
    id: entry.product.id,
    name: entry.product.name,
    description: entry.product.description ?? "",
    category: entry.product.category ?? "Uncategorized",
    images: entry.product.imageUrl ? [entry.product.imageUrl] : [],
    sku: entry.product.sku,
    priceAmount: entry.product.price,
    priceCurrency: "USD",
    stock: entry.product.stock,
    status: entry.product.status,
    entry,
  };
};

export function ProductDetail({ productId, products, onBack, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);

  const normalized = useMemo(() => products.map(normalizeEntry), [products]);
  const product = normalized.find((item) => item.id === productId);

  if (!product) return null;

  const priceLabel =
    product.priceAmount !== undefined
      ? `${product.priceAmount.toFixed(2)} ${product.priceCurrency ?? ""}`.trim()
      : "Price unavailable";
  const stockLimit = typeof product.stock === "number" ? Math.max(0, product.stock) : Number.POSITIVE_INFINITY;
  const isOutOfStock = stockLimit === 0;

  const relatedProducts = normalized
    .filter((item) => {
      if (item.id === product.id || item.category !== product.category) {
        return false;
      }
      const status =
        item.entry.kind === "mock" ? item.entry.product.status.toLowerCase() : item.entry.product.status.toLowerCase();
      return status === "published";
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.images[0] ?? "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((image, index) => (
                <div key={`${image}-${index}`} className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 ring-primary">
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl text-primary">{priceLabel}</span>
                {!isOutOfStock ? (
                  <Badge className="bg-[#22C55E] hover:bg-[#22C55E]/90">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Number.isFinite(stockLimit) ? Math.min(stockLimit, quantity + 1) : quantity + 1,
                      )
                    }
                    className="px-4 py-2 hover:bg-muted"
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isOutOfStock}
                  onClick={() => onAddToCart(product.id, quantity)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% Protected</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">30-Day Returns</p>
                <p className="text-xs text-muted-foreground">Easy returns</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="description" className="mb-12">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specifications" className="pt-6">
            <Card>
              <CardContent className="pt-6">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">SKU</dt>
                    <dd>{product.sku}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd>{product.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Stock</dt>
                    <dd>{Number.isFinite(stockLimit) ? `${stockLimit} units` : "Available"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="pt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="cursor-pointer hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                      <img
                        src={
                          relatedProduct.images[0] ??
                          "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2">{relatedProduct.name}</h3>
                      <span className="text-xl text-primary">
                        {relatedProduct.priceAmount !== undefined
                          ? `${relatedProduct.priceAmount.toFixed(2)} ${relatedProduct.priceCurrency ?? ""}`.trim()
                          : "Price unavailable"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
