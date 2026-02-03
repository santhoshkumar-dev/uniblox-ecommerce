"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, TicketPercent, Check } from "lucide-react";
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
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    percentage: number;
  } | null>(null);
  const [publicDiscounts, setPublicDiscounts] = useState<any[]>([]);
  const [discountLoading, setDiscountLoading] = useState(false);
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

  const fetchPublicDiscounts = async () => {
    const res = await fetch("/api/discounts");
    if (res.ok) {
      setPublicDiscounts(await res.json());
    }
  };

  useEffect(() => {
    fetchCart();
    fetchPublicDiscounts();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    await fetch("/api/cart", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    });
    fetchCart();
  };

  const applyDiscount = async (codeOverride?: string) => {
    const code = codeOverride || discountCode;
    if (!code) return;
    setDiscountLoading(true);
    setAppliedDiscount(null); // Reset previous
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedDiscount(data);
        if (codeOverride) setDiscountCode(codeOverride);
        // alert("Discount Applied!");
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Failed to validate discount");
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          discountCode: appliedDiscount ? appliedDiscount.code : undefined,
        }),
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

  const discountAmount = appliedDiscount
    ? (subtotal * appliedDiscount.percentage) / 100
    : 0;
  const total = subtotal - discountAmount;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card
              key={item.productId._id}
              className="flex flex-row items-center p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.productId.name}</h3>
                <p className="text-gray-500">
                  ${item.productId.price} x {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(item.productId._id, item.quantity - 1)
                    }
                  >
                    -
                  </Button>
                  <span className="w-4 text-center">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8"
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
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.productId._id, 0)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span className="flex items-center gap-1">
                    <TicketPercent className="h-4 w-4" /> Discount (
                    {appliedDiscount.code})
                  </span>
                  <span>- ${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Discount Code"
                  value={discountCode}
                  onChange={(e) =>
                    setDiscountCode(e.target.value.toUpperCase())
                  }
                  disabled={!!appliedDiscount}
                />
                {appliedDiscount ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAppliedDiscount(null);
                      setDiscountCode("");
                    }}
                  >
                    Change
                  </Button>
                ) : (
                  <Button
                    onClick={() => applyDiscount()}
                    disabled={discountLoading || !discountCode}
                  >
                    {discountLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                )}
              </div>
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
          </Card>

          {/* Public Discounts List */}
          {publicDiscounts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Available Coupons</h3>
              {publicDiscounts.map((d) => (
                <div
                  key={d._id}
                  onClick={() => {
                    if (!appliedDiscount) {
                      setDiscountCode(d.code);
                      // Optional: Auto-apply on card click too?
                      // User specifically asked for button change, let's keep card click as 'fill'
                      // or make consistent. Let's make card click fill, button apply.
                    }
                  }}
                  className={`border border-dashed border-primary/50 bg-primary/5 p-3 rounded-md cursor-pointer hover:bg-primary/10 transition-colors flex justify-between items-center ${discountCode === d.code ? "ring-2 ring-primary" : ""}`}
                >
                  <div>
                    <p className="font-bold text-primary">{d.code}</p>
                    <p className="text-xs text-gray-500">
                      {d.percentage}% Off • Limited Time
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyDiscount(d.code);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
