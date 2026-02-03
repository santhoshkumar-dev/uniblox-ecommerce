import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getDiscounts,
  checkAndGenerateDiscount,
  createDiscount,
} from "@/services/discountService";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const discounts = await getDiscounts(true);
  return NextResponse.json(discounts);
}

// Manual trigger for testing or Custom Creation
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json().catch(() => null);

    if (body && body.code) {
      // Custom creation
      const discount = await createDiscount({
        code: body.code,
        percentage: body.percentage || 10,
        isPublic: body.isPublic || false,
        maxUses: body.maxUses || 1,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      });
      return NextResponse.json(discount);
    } else {
      // Fallback to auto-gen logic (existing behavior for testing)
      const code = await checkAndGenerateDiscount();
      // Note: checkAndGenerateDiscount only generates if threshold met, so it returns null often.
      // Forcing a generation might be desired if this was "Generate Random", but the original was "Check and Generate".
      // If the user wants to FORCE a random one, we might need a different flag.
      // For now, preserving exact original behavior if no body logic.
      return NextResponse.json({ generatedCode: code });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
