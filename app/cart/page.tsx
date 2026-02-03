"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ICartItem {
  productId: { _id: string; name: string; price: number };
  quantity: number;
}

interface ICart {
  items: ICartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<ICart | null>(null);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    await fetch("/api/cart", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    });
    fetchCart();
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ discountCode }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Order Placed! ID: ${data._id}`);
        router.push("/orders");
      } else {
        alert(`Error: ${data.error}`);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!cart || cart.items.length === 0)
    return <div className="p-10 text-center">Your cart is empty.</div>;

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
    0,
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid gap-6">
        {cart.items.map((item) => (
          <Card
            key={item.productId._id}
            className="flex flex-row items-center p-4"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.productId.name}</h3>
              <p className="text-gray-500">
                ${item.productId.price} x {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuantity(item.productId._id, item.quantity - 1)
                  }
                >
                  -
                </Button>
                <span>{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuantity(item.productId._id, item.quantity + 1)
                  }
                >
                  +
                </Button>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => updateQuantity(item.productId._id, 0)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Discount Code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              "Checkout Now"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
