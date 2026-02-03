import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { validateDiscount } from "@/services/discountService";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code } = await req.json();
    if (!code)
      return NextResponse.json({ error: "Code required" }, { status: 400 });

    const discount = await validateDiscount(code, session.user.id);

    if (!discount) {
      return NextResponse.json(
        { error: "Invalid or expired discount code" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      code: discount.code,
      percentage: discount.percentage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
