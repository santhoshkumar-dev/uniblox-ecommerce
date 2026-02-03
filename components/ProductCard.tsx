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
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProducCardProps {
  product: IProduct & { _id: string }; // Adjust generic
}

export function ProductCard({ product }: ProducCardProps) {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addToCart = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      if (res.ok) {
        alert("Added to cart!"); // Replace with toast
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg flex justify-between">
          <span>{product.name}</span>
          <span className="text-green-600">${product.price}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-sm h-12 overflow-hidden">
          {product.description || "No description."}
        </p>
        <div className="mt-4 flex gap-2">
          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={addToCart}
          disabled={product.stock <= 0 || loading}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
