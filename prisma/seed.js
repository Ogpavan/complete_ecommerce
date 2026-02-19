const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "products.json"), "utf8")
);

const CATEGORY_RULES = [
  { slug: "hair-care", name: "Hair Care", test: /(shampoo|conditioner|scalp|spray|hair)/i },
  { slug: "body-care", name: "Body Care", test: /(body|hand\s*&\s*body|wash)/i },
  { slug: "skin-care", name: "Skin Care", test: /(serum|facial|mask|eye|oil|moistur|cleansing|duo|treatment)/i }
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferCategory(productName) {
  const rule = CATEGORY_RULES.find((entry) => entry.test.test(productName));
  if (rule) {
    return rule;
  }

  return { slug: "essentials", name: "Essentials" };
}

function shortDescription(value) {
  const trimmed = String(value || "").trim();
  if (trimmed.length <= 150) {
    return trimmed;
  }
  return `${trimmed.slice(0, 147)}...`;
}

function normalizeImages(product) {
  const list = [product.image, ...(Array.isArray(product.images) ? product.images : [])]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);

  return Array.from(new Set(list));
}

function uniqueSlug(baseSlug, used) {
  if (!used.has(baseSlug)) {
    used.add(baseSlug);
    return baseSlug;
  }

  let index = 2;
  while (used.has(`${baseSlug}-${index}`)) {
    index += 1;
  }
  const next = `${baseSlug}-${index}`;
  used.add(next);
  return next;
}

async function wipeDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

async function main() {
  await wipeDatabase();

  const categoryCache = new Map();
  const usedSlugs = new Set();

  for (let index = 0; index < products.length; index += 1) {
    const raw = products[index];
    const name = String(raw.name || raw.title || "").trim();
    if (!name) {
      continue;
    }

    const basePrice = Number(raw.price || 0);
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      continue;
    }

    const categoryShape = inferCategory(name);
    if (!categoryCache.has(categoryShape.slug)) {
      const category = await prisma.category.create({
        data: {
          name: categoryShape.name,
          slug: categoryShape.slug,
          description: `Curated ${categoryShape.name.toLowerCase()} products.`
        }
      });
      categoryCache.set(categoryShape.slug, category);
    }

    const category = categoryCache.get(categoryShape.slug);
    const slugInput = raw.slug ? String(raw.slug) : name;
    const slug = uniqueSlug(slugify(slugInput), usedSlugs);
    const images = normalizeImages(raw);

    const standardStock = 10 + ((index * 7) % 35);
    const bundleStock = 5 + ((index * 11) % 20);

    await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription: shortDescription(raw.description || name),
        description: String(raw.description || name),
        featured: index < 8,
        basePrice,
        isActive: true,
        categoryId: category.id,
        images: {
          create: (images.length > 0 ? images : [raw.image || ""]).filter(Boolean).map((url, imageIndex) => ({
            url,
            alt: name,
            sortOrder: imageIndex
          }))
        },
        variants: {
          create: [
            {
              title: "Standard",
              sku: `SKU-${slug.toUpperCase()}-STD`,
              price: basePrice,
              stock: standardStock,
              attributes: JSON.stringify({ pack: "1 unit" })
            },
            {
              title: "Bundle",
              sku: `SKU-${slug.toUpperCase()}-BND`,
              price: Number((basePrice * 1.8).toFixed(2)),
              stock: bundleStock,
              attributes: JSON.stringify({ pack: "2 units" })
            }
          ]
        }
      }
    });
  }

  const counts = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count()
  ]);

  console.log(
    `[seed] categories=${counts[0]} products=${counts[1]} variants=${counts[2]} images=${counts[3]}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
