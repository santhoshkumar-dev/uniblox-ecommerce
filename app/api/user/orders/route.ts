import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/services/orderService";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await getUserOrders(session.user.id);
  return NextResponse.json(orders);
}
