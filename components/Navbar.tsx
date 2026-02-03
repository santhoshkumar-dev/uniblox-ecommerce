"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      if (!session) return;
      const res = await fetch("/api/cart");
      if (res.ok) {
        const cart = await res.json();
        const count =
          cart.items?.reduce(
            (acc: number, item: any) => acc + item.quantity,
            0,
          ) || 0;
        setCartCount(count);
      }
    } catch (e) {
      console.error("Failed to fetch cart count", e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCartCount();
      const handleCartUpdate = () => fetchCartCount();
      window.addEventListener("cart-updated", handleCartUpdate);
      return () => window.removeEventListener("cart-updated", handleCartUpdate);
    }
  }, [session]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <nav className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
        >
          Uniblox Store
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:text-blue-600">
            Products
          </Link>
          {session && (
            <Link
              href="/cart"
              className="text-sm font-medium hover:text-blue-600 relative group"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {session ? (
            <div className="flex items-center gap-4">
              {(session.user as any).role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Admin Panel
                </Link>
              ) : (
                <Link
                  href="/orders"
                  className="text-sm font-medium hover:text-blue-600"
                >
                  My Orders
                </Link>
              )}
              <div className="text-xs text-gray-500 hidden md:block">
                {session.user.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
