import { getAllProducts } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getAllProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Featured Collection
        </h1>
        <p className="text-lg text-gray-600">
          Explore our premium selection of products.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-500">
            No products found.
          </h2>
          <p className="text-gray-400">
            Please seed the database via Admin Panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            // @ts-ignore
            <ProductCard
              key={p._id.toString()}
              product={JSON.parse(JSON.stringify(p))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
