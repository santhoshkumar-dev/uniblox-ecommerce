import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import * as CartService from "@/services/cartService";

async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await CartService.getCart(userId);
  return NextResponse.json(cart);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity } = await req.json();
  try {
    const cart = await CartService.addToCart(userId, productId, quantity);
    return NextResponse.json(cart);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity } = await req.json();
  const cart = await CartService.updateCartItem(userId, productId, quantity);
  return NextResponse.json(cart);
}
