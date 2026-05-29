import ProductDetailClient from './ProductDetailClient';

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/products?limit=100`);
    if (!res.ok) return [{ slug: '_' }];
    const data = await res.json();
    const products: { slug: string }[] = data.data || [];
    if (products.length > 0) {
      return products.map((product) => ({ slug: product.slug }));
    }
  } catch {
    // backend unreachable at build time
  }
  // fallback: emit a placeholder shell so the build succeeds;
  // actual product data is always fetched client-side at runtime
  return [{ slug: '_' }];
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient slug={params.slug} />;
}
