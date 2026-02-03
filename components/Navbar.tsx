"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <nav className="border-b bg-white dark:bg-gray-950">
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
              className="text-sm font-medium hover:text-blue-600"
            >
              Cart
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
              <div className="text-xs text-gray-500">{session.user.email}</div>
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
