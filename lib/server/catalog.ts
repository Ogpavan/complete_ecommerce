import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isFrontendOnly } from "@/lib/server/frontendOnly";
import { storefrontProducts } from "@/data/products";
import type {
  CategorySummary,
  HomePayload,
  ProductCardSummary,
  ProductDetail,
  ProductVariantSummary,
  ProductsPayload,
  ProductsSort
} from "@/lib/types";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 200;
const FRONTEND_ONLY_STOCK = 20;
const FRONTEND_ONLY_VARIANT_TITLE = "Default";

const productInclude = {
  category: true,
  images: {
    orderBy: { sortOrder: "asc" }
  },
  variants: {
    where: { isActive: true },
    orderBy: { price: "asc" }
  }
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toFrontendVariantId(productId: number) {
  return productId * 10;
}

function getFrontendCategorySummaries(): CategorySummary[] {
  const counts = new Map<string, { name: string; slug: string; count: number }>();

  for (const product of storefrontProducts) {
    const collections = product.collections?.length ? product.collections : ["Catalog"];
    for (const collection of collections) {
      const slug = slugify(collection);
      const entry = counts.get(slug);
      if (entry) {
        entry.count += 1;
      } else {
        counts.set(slug, { name: collection, slug, count: 1 });
      }
    }
  }

  const entries = Array.from(counts.values());
  if (entries.length === 0) {
    entries.push({ name: "Catalog", slug: "catalog", count: storefrontProducts.length });
  }

  return entries.map((entry, index) => ({
    id: index + 1,
    name: entry.name,
    slug: entry.slug,
    description: null,
    imageUrl: null,
    productCount: entry.count
  }));
}

function toFrontendProductCard(product: (typeof storefrontProducts)[number]): ProductCardSummary {
  const category = product.collections?.[0] ?? "Catalog";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    defaultVariantId: toFrontendVariantId(product.id),
    price: product.price,
    image: product.image,
    images: product.images,
    category,
    categorySlug: slugify(category),
    inStock: true,
    stock: FRONTEND_ONLY_STOCK,
    badge: product.badge === "New" ? "New" : undefined
  };
}

function toFrontendProductDetail(product: (typeof storefrontProducts)[number]): ProductDetail {
  const categoryName = product.collections?.[0] ?? "Catalog";
  const categorySlug = slugify(categoryName);
  const variantId = toFrontendVariantId(product.id);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: null,
    description: product.description,
    category: {
      id: 1,
      name: categoryName,
      slug: categorySlug
    },
    images: product.images.map((url, index) => ({
      id: index + 1,
      url,
      alt: product.name,
      sortOrder: index
    })),
    variants: [
      {
        id: variantId,
        title: FRONTEND_ONLY_VARIANT_TITLE,
        sku: `ST-${product.slug.replace(/-/g, "_").toUpperCase()}-${product.id}`,
        price: product.price,
        stock: FRONTEND_ONLY_STOCK,
        inStock: true,
        attributes: null
      }
    ],
    inStock: true,
    stock: FRONTEND_ONLY_STOCK
  };
}

function getFrontendOnlyHomePayload(): HomePayload {
  const featured = storefrontProducts.slice(0, 8).map(toFrontendProductCard);
  const newest = [...storefrontProducts].sort((a, b) => b.id - a.id).slice(0, 8).map(toFrontendProductCard);

  return {
    featured,
    newest,
    categories: getFrontendCategorySummaries()
  };
}

function parseAttributes(value: string | null): Record<string, string> | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const entries = Object.entries(parsed as Record<string, unknown>).flatMap(([key, entry]) =>
      typeof entry === "string" ? ([[key, entry]] as Array<[string, string]>) : []
    );

    return entries.length > 0 ? (Object.fromEntries(entries) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

function pickPrimaryPrice(product: ProductWithRelations) {
  const variant = product.variants[0];
  return variant ? toNumber(variant.price) : toNumber(product.basePrice);
}

function toProductCardSummary(product: ProductWithRelations): ProductCardSummary {
  const price = pickPrimaryPrice(product);
  const stock = product.variants.reduce((sum, variant) => sum + Math.max(variant.stock, 0), 0);
  const images = product.images.map((image) => image.url);
  const badge = product.featured ? "New" : undefined;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    defaultVariantId: product.variants[0]?.id ?? null,
    price,
    image: images[0] ?? "",
    images,
    category: product.category.name,
    categorySlug: product.category.slug,
    inStock: stock > 0,
    stock,
    badge
  };
}

function toVariantSummary(variant: ProductWithRelations["variants"][number]): ProductVariantSummary {
  return {
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    price: toNumber(variant.price),
    stock: Math.max(0, variant.stock),
    inStock: variant.stock > 0,
    attributes: parseAttributes(variant.attributes)
  };
}

export async function getCategoriesSummary(): Promise<CategorySummary[]> {
  if (isFrontendOnly()) {
    return getFrontendCategorySummaries();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { isActive: true },
        select: { id: true }
      }
    }
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    imageUrl: category.imageUrl ?? null,
    productCount: category.products.length
  }));
}

export async function getHomePayload(): Promise<HomePayload> {
  if (isFrontendOnly()) {
    return getFrontendOnlyHomePayload();
  }

  const featuredBase = await prisma.product.findMany({
    where: { isActive: true, featured: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 8
  });

  let featured = featuredBase;
  if (featuredBase.length < 8) {
    const existingIds = featuredBase.map((product) => product.id);
    const missing = 8 - featuredBase.length;
    const fallback = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: existingIds.length > 0 ? existingIds : [-1] }
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: missing
    });
    featured = [...featuredBase, ...fallback];
  }

  const newest = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 8
  });

  const categories = await getCategoriesSummary();

  return {
    featured: featured.map(toProductCardSummary),
    newest: newest.map(toProductCardSummary),
    categories
  };
}

type GetProductsParams = {
  page?: number;
  pageSize?: number;
  category?: string | null;
  search?: string | null;
  inStockOnly?: boolean;
  sort?: ProductsSort;
};

function normalizePage(value: number | undefined) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }
  return Math.floor(value);
}

function normalizePageSize(value: number | undefined) {
  if (!value || Number.isNaN(value) || value < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(value), MAX_PAGE_SIZE);
}

function normalizeSort(value: ProductsSort | undefined): ProductsSort {
  const allowed: ProductsSort[] = ["newest", "name-asc", "name-desc", "price-asc", "price-desc"];
  return value && allowed.includes(value) ? value : "newest";
}

function toOrderBy(sort: ProductsSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "name-asc":
      return [{ name: "asc" }, { id: "asc" }];
    case "name-desc":
      return [{ name: "desc" }, { id: "desc" }];
    case "price-asc":
      return [{ basePrice: "asc" }, { id: "asc" }];
    case "price-desc":
      return [{ basePrice: "desc" }, { id: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }, { id: "desc" }];
  }
}

export async function getProductsPayload(params: GetProductsParams): Promise<ProductsPayload> {
  const page = normalizePage(params.page);
  const pageSize = normalizePageSize(params.pageSize);
  const sort = normalizeSort(params.sort);
  const category = params.category ? String(params.category).trim() : null;
  const search = params.search ? String(params.search).trim() : null;
  const inStockOnly = params.inStockOnly === true;

  if (isFrontendOnly()) {
    const normalizedCategory = category ? slugify(category) : null;
    const normalizedSearch = search ? search.toLowerCase() : null;

    const filtered = storefrontProducts.filter((product) => {
      const collections = product.collections?.length ? product.collections : ["Catalog"];
      if (normalizedCategory) {
        const matchesCategory = collections.some((collection) => slugify(collection) === normalizedCategory);
        if (!matchesCategory) {
          return false;
        }
      }

      if (normalizedSearch) {
        const haystack = `${product.name} ${product.description}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
        default:
          return b.id - a.id;
      }
    });

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const items = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return {
      query: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
        category,
        search,
        inStockOnly,
        sort
      },
      items: items.map(toFrontendProductCard)
    };
  }

  const where: Prisma.ProductWhereInput = {
    isActive: true
  };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ];
  }

  if (inStockOnly) {
    where.variants = {
      some: {
        isActive: true,
        stock: { gt: 0 }
      }
    };
  }

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: toOrderBy(sort),
    skip: (currentPage - 1) * pageSize,
    take: pageSize
  });

  return {
    query: {
      page: currentPage,
      pageSize,
      total,
      totalPages,
      category,
      search,
      inStockOnly,
      sort
    },
    items: products.map(toProductCardSummary)
  };
}

export type ProductDetailPayload = {
  product: ProductDetail;
  related: ProductCardSummary[];
};

export async function getProductDetailPayload(slugInput: string): Promise<ProductDetailPayload | null> {
  const slug = String(slugInput || "").trim();
  if (!slug) {
    return null;
  }

  if (isFrontendOnly()) {
    const product = storefrontProducts.find((entry) => entry.slug === slug);
    if (!product) {
      return null;
    }

    const related = storefrontProducts
      .filter((entry) => entry.slug !== slug)
      .slice(0, 4)
      .map(toFrontendProductCard);

    return {
      product: toFrontendProductDetail(product),
      related
    };
  }

  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: productInclude
  });

  if (!product) {
    return null;
  }

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 4
  });

  const variants = product.variants.map(toVariantSummary);
  const stock = variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);

  return {
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription ?? null,
      description: product.description,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      },
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt ?? null,
        sortOrder: image.sortOrder
      })),
      variants,
      inStock: stock > 0,
      stock
    },
    related: related.map(toProductCardSummary)
  };
}
