import { NextResponse } from "next/server";
import { getPublicDiscounts } from "@/services/discountService";

export const dynamic = "force-dynamic";

export async function GET() {
  const discounts = await getPublicDiscounts();
  return NextResponse.json(discounts);
}
