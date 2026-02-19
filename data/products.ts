import rawProducts from "./products.json";

export type StorefrontBadge = "New" | "Sale";

type RawStorefrontProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  images: string[];
  description: string;
};

export type StorefrontProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  badge?: StorefrontBadge;
  image: string;
  images: string[];
  description: string;
  vendor: string;
  collections: string[];
  sku: string;
  colors: string[];
};

const DEFAULT_VENDOR = "Glowing Studio";
const DEFAULT_COLLECTIONS = ["Beauty & Cosmetics", "Skin Care"];
const DEFAULT_COLORS = ["black", "brown", "blue"];

function toSku(slug: string, id: number) {
  return `GLW-${slug.replace(/-/g, "_").toUpperCase()}-${id}`;
}

function toBadge(value: string | undefined): StorefrontBadge | undefined {
  if (value === "New" || value === "Sale") {
    return value;
  }

  return undefined;
}

export const storefrontProducts: StorefrontProduct[] = (rawProducts as RawStorefrontProduct[]).map(
  (product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    oldPrice: product.oldPrice,
    badge: toBadge(product.badge),
    image: product.image,
    images: product.images,
    description: product.description,
    vendor: DEFAULT_VENDOR,
    collections: DEFAULT_COLLECTIONS,
    sku: toSku(product.slug, product.id),
    colors: DEFAULT_COLORS
  })
);

export function getStorefrontProductBySlug(slug: string) {
  return storefrontProducts.find((product) => product.slug === slug);
}
