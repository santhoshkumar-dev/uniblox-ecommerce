import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getDiscounts,
  checkAndGenerateDiscount,
} from "@/services/discountService";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const discounts = await getDiscounts();
  return NextResponse.json(discounts);
}

// Manual trigger for testing
export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const code = await checkAndGenerateDiscount();
  return NextResponse.json({ generatedCode: code });
}
