import Link from "next/link";
import Navbar from "@/components/home/Navbar";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="mx-auto max-w-[920px] px-6 py-20">
        <h1 className="text-4xl font-semibold text-gray-900">Blog</h1>
        <p className="mt-4 text-gray-600">
          Editorial content is coming soon. Browse the full catalog in the meantime.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex h-11 items-center border border-black bg-black px-6 text-sm font-medium text-white transition hover:opacity-90"
        >
          Shop products
        </Link>
      </section>
    </main>
  );
}
