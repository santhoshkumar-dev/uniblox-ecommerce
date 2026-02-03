"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">
                    Order #{order._id.slice(-6)}
                  </CardTitle>
                  <Badge
                    variant={order.status === "PAID" ? "default" : "secondary"}
                  >
                    {order.status}
                  </Badge>
                </div>
                <CardDescription>
                  {new Date(order.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between">
                      <span>
                        {item.productName} x {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.finalAmount.toFixed(2)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 text-xs">
                      <span>Discount Applied ({order.discountCode})</span>
                      <span>-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
