"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch Product
  useEffect(() => {
    if (params.id) {
      fetch(`/api/products/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Product not found");
          return res.json();
        })
        .then(setProduct)
        .catch((err) => {
          console.error(err);
          // router.push("/404"); // Optional handling
        })
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  // Fetch User Cart Quantity
  useEffect(() => {
    if (session?.user?.id && product) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((cart) => {
          const item = cart.items?.find(
            (i: any) =>
              (i.productId._id || i.productId).toString() === product._id,
          );
          if (item) setQuantity(item.quantity);
        })
        .catch(console.error);
    }
  }, [session, product]);

  const updateCart = async (newQuantity: number) => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!product) return;

    setCartLoading(true);
    const prevQty = quantity;
    setQuantity(newQuantity);

    try {
      const method = prevQty === 0 && newQuantity > 0 ? "POST" : "PUT";
      const res = await fetch("/api/cart", {
        method,
        body: JSON.stringify({
          productId: product._id,
          quantity: newQuantity,
        }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch (e) {
      setQuantity(prevQty);
      alert("Failed to update cart");
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        Product not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Image Section */}
        <div className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden border">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-8 hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4">
            <Badge
              variant={product.stock > 0 ? "default" : "destructive"}
              className="text-sm px-3 py-1"
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col h-full justify-between space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary">${product.price}</p>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description || "No description available."}
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Availability</span>
              <span className="font-semibold text-gray-900">
                {product.stock} units left
              </span>
            </div>

            <Card className="p-6 bg-gray-50 border-none">
              {quantity > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">In your cart:</span>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCart(quantity - 1)}
                      disabled={cartLoading}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-bold w-8 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCart(quantity + 1)}
                      disabled={cartLoading || quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full text-lg h-12 gap-2"
                  onClick={() => updateCart(1)}
                  disabled={product.stock <= 0 || cartLoading}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
