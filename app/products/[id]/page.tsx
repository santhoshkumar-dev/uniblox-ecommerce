import { getProductById } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import * as CartService from "@/services/cartService";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let initialQuantity = 0;

  if (session?.user?.id) {
    try {
      const cart = await CartService.getCart(session.user.id);
      const cartItem = cart?.items?.find((item: any) => {
        const pId = item.productId._id
          ? item.productId._id.toString()
          : item.productId.toString();
        return pId === id;
      });
      if (cartItem) {
        initialQuantity = cartItem.quantity;
      }
    } catch (e) {
      console.error("Failed to fetch cart item", e);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex justify-center items-start">
            <ProductCard
              product={JSON.parse(JSON.stringify(product))}
              initialQuantity={initialQuantity}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-primary">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-gray-700">
                ${product.price}
              </p>
            </div>

            <div className="prose max-w-none text-gray-600">
              <h3 className="text-lg font-semibold text-gray-900">
                Description
              </h3>
              <p>
                {product.description ||
                  "No description available for this product."}
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-500">
                Product ID:{" "}
                <span className="font-mono">{product._id.toString()}</span>
              </p>
              <p className="text-sm text-gray-500">
                Stock:{" "}
                <span className="font-medium text-gray-900">
                  {product.stock} available
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
