import Announcement from "@/components/home/Announcement";
import BrandStrip from "@/components/home/BrandStrip";
import Discover from "@/components/home/Discover";
import Favorites from "@/components/home/Favorites";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import Navbar from "@/components/home/Navbar";
import PromoSplit from "@/components/home/PromoSplit";
import TrustRow from "@/components/home/TrustRow";
import { getHomePayload } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await getHomePayload();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Announcement />
      <Navbar />
      <Hero />
      <FeaturedProducts products={home.featured} />
      <PromoSplit />
      <TrustRow />
      <BrandStrip />
      <Favorites products={home.newest} />
      <Discover />
    </main>
  );
}
