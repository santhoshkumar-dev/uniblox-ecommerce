"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IProduct } from "@/models/Product";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface ProducCardProps {
  product: IProduct & { _id: string };
  initialQuantity?: number;
}

export function ProductCard({ product, initialQuantity = 0 }: ProducCardProps) {
  const { data: session } = authClient.useSession();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If initialQuantity is not provided (e.g. client navigation), we might want to fetch it
  // For now, we rely on the parent passing it or starting at 0.
  // We can add a specialized effect here if needed, but the page.tsx prop is preferred.

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const updateCart = async (newQuantity: number) => {
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);

    // Optimistic update
    const previousQuantity = quantity;
    setQuantity(newQuantity);

    try {
      let res;
      if (previousQuantity === 0 && newQuantity > 0) {
        // First add -> POST
        res = await fetch("/api/cart", {
          method: "POST",
          body: JSON.stringify({
            productId: product._id,
            quantity: newQuantity,
          }),
        });
      } else {
        // Update -> PUT (handles removal if quantity is 0)
        res = await fetch("/api/cart", {
          method: "PUT",
          body: JSON.stringify({
            productId: product._id,
            quantity: newQuantity,
          }),
        });
      }

      if (!res.ok) {
        throw new Error("Failed to update cart");
      }
    } catch (error) {
      console.error(error);
      // Revert on error
      setQuantity(previousQuantity);
      // Optional: show toast error here
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => {
    if (product.stock > quantity) {
      updateCart(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateCart(quantity - 1);
    }
  };

  return (
    <Card
      onClick={() => router.push(`/product/${product._id}`)}
      className="hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group h-full flex flex-col cursor-pointer"
    >
      <CardHeader className="p-0 relative">
        <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-2 right-2">
          <Badge
            variant={product.stock > 0 ? "default" : "destructive"}
            className="shadow-sm"
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grow pt-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle
            className="text-lg font-bold line-clamp-1"
            title={product.name}
          >
            {product.name}
          </CardTitle>
          <span className="text-lg font-bold text-primary">
            ${product.price}
          </span>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 min-h-10">
          {product.description || "No description available."}
        </p>
      </CardContent>

      <CardFooter className="pt-0 pb-4" onClick={(e) => e.stopPropagation()}>
        {quantity > 0 ? (
          <div className="flex items-center justify-between w-full bg-secondary/20 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={handleDecrement}
              disabled={loading}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={handleIncrement}
              disabled={loading || quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            className="w-full gap-2 shadow-sm hover:shadow-md transition-all"
            onClick={() => updateCart(1)}
            disabled={product.stock <= 0 || loading}
          >
            <ShoppingCart className="h-4 w-4" />
            {loading ? "Adding..." : "Add to Cart"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
