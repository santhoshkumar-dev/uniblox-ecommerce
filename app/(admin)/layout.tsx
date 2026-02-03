import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 border-r p-6 hidden md:block">
        <h2 className="text-lg font-bold mb-6">Admin Console</h2>
        <nav className="space-y-2">
          <Link
            href="/admin"
            className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Products
          </Link>
          <Link
            href="/admin/discounts"
            className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Discounts
          </Link>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
