import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import * as OrderService from "@/services/orderService";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const analytics = await OrderService.getAnalytics();
  return NextResponse.json(analytics);
}
