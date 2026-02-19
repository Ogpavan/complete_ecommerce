"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type MessageType = "success" | "error";
type AdminView = "overview" | "catalog" | "products" | "orders" | "categories";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function readRequiredText(formData: FormData, field: string, label: string) {
  const value = readText(formData, field);
  if (!value) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function parseNumberValue(
  value: string,
  label: string,
  options: { min?: number; max?: number; integer?: boolean; required?: boolean } = {}
) {
  if (!value) {
    if (options.required) {
      throw new Error(`${label} is required.`);
    }
    return null;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${label} must be a valid number.`);
  }

  if (options.integer && !Number.isInteger(number)) {
    throw new Error(`${label} must be a whole number.`);
  }

  if (options.min !== undefined && number < options.min) {
    throw new Error(`${label} must be at least ${options.min}.`);
  }

  if (options.max !== undefined && number > options.max) {
    throw new Error(`${label} must be at most ${options.max}.`);
  }

  return number;
}

function readRequiredNumber(
  formData: FormData,
  field: string,
  label: string,
  options: { min?: number; max?: number; integer?: boolean } = {}
) {
  const value = readText(formData, field);
  return parseNumberValue(value, label, { ...options, required: true }) as number;
}

function readOptionalNumber(
  formData: FormData,
  field: string,
  label: string,
  options: { min?: number; max?: number; integer?: boolean } = {}
) {
  const value = readText(formData, field);
  return parseNumberValue(value, label, { ...options, required: false });
}

function readBoolean(formData: FormData, field: string, fallback = false) {
  const value = formData.get(field);
  if (value === null) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeView(value: string): AdminView | null {
  const allowed: AdminView[] = ["overview", "catalog", "products", "orders", "categories"];
  return allowed.includes(value as AdminView) ? (value as AdminView) : null;
}

function toAdminUrl(type: MessageType, message: string, view: AdminView | null) {
  const params = new URLSearchParams();
  params.set(type, message.slice(0, 180));
  if (view) {
    params.set("view", view);
  }
  return `/admin?${params.toString()}`;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A unique value already exists. Please use a different slug or SKU.";
    }
    if (error.code === "P2003") {
      return "This record is linked to cart or order history and cannot be deleted.";
    }
    if (error.code === "P2025") {
      return "The selected record was not found.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected admin action error.";
}

async function runAdminAction(viewRaw: string, work: () => Promise<string>) {
  const view = normalizeView(viewRaw);
  let type: MessageType = "success";
  let message = "Action completed.";

  try {
    message = await work();
    revalidatePath("/admin");
  } catch (error) {
    type = "error";
    message = toErrorMessage(error);
  }

  redirect(toAdminUrl(type, message, view));
}

export async function createCategoryAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "catalog", async () => {
    const name = readRequiredText(formData, "name", "Category name");
    const slugInput = readText(formData, "slug");
    const slug = slugify(slugInput || name);
    const description = readText(formData, "description");
    const imageUrl = readText(formData, "imageUrl");

    if (!slug) {
      throw new Error("Category slug is invalid.");
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null
      }
    });

    return `Category "${name}" created.`;
  });
}

export async function createProductAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "catalog", async () => {
    const name = readRequiredText(formData, "name", "Product name");
    const slugInput = readText(formData, "slug");
    const slug = slugify(slugInput || name);
    const description = readRequiredText(formData, "description", "Description");
    const shortDescription = readText(formData, "shortDescription");
    const categoryId = readRequiredNumber(formData, "categoryId", "Category", {
      min: 1,
      integer: true
    });
    const basePrice = readRequiredNumber(formData, "basePrice", "Base price", { min: 0.01 });
    const variantTitle = readText(formData, "variantTitle") || "Default";
    const variantSku = readRequiredText(formData, "variantSku", "Variant SKU");
    const variantPriceInput = readOptionalNumber(formData, "variantPrice", "Variant price", {
      min: 0.01
    });
    const variantStock = readRequiredNumber(formData, "variantStock", "Variant stock", {
      min: 0,
      integer: true
    });
    const imageUrl = readText(formData, "imageUrl");
    const featured = readBoolean(formData, "featured", false);
    const isActive = readBoolean(formData, "isActive", false);

    if (!slug) {
      throw new Error("Product slug is invalid.");
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true }
    });
    if (!categoryExists) {
      throw new Error("Selected category does not exist.");
    }

    const variantPrice = variantPriceInput ?? basePrice;

    await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        description,
        featured,
        basePrice,
        isActive,
        categoryId,
        images: imageUrl
          ? {
              create: [
                {
                  url: imageUrl,
                  alt: name,
                  sortOrder: 0
                }
              ]
            }
          : undefined,
        variants: {
          create: [
            {
              title: variantTitle,
              sku: variantSku,
              price: variantPrice,
              stock: variantStock,
              isActive: true
            }
          ]
        }
      }
    });

    return `Product "${name}" created.`;
  });
}

export async function updateProductFlagsAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "products", async () => {
    const productId = readRequiredNumber(formData, "productId", "Product", {
      min: 1,
      integer: true
    });
    const featured = readBoolean(formData, "featured", false);
    const isActive = readBoolean(formData, "isActive", false);

    await prisma.product.update({
      where: { id: productId },
      data: {
        featured,
        isActive
      }
    });

    return "Product flags updated.";
  });
}

export async function updateProductDetailsAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "products", async () => {
    const productId = readRequiredNumber(formData, "productId", "Product", {
      min: 1,
      integer: true
    });
    const name = readRequiredText(formData, "name", "Product name");
    const slugInput = readText(formData, "slug");
    const slug = slugify(slugInput || name);
    const description = readRequiredText(formData, "description", "Description");
    const shortDescription = readText(formData, "shortDescription");
    const categoryId = readRequiredNumber(formData, "categoryId", "Category", {
      min: 1,
      integer: true
    });
    const basePrice = readRequiredNumber(formData, "basePrice", "Base price", { min: 0.01 });
    const featured = readBoolean(formData, "featured", false);
    const isActive = readBoolean(formData, "isActive", false);

    if (!slug) {
      throw new Error("Product slug is invalid.");
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true }
    });
    if (!categoryExists) {
      throw new Error("Selected category does not exist.");
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        description,
        categoryId,
        basePrice,
        featured,
        isActive
      }
    });

    return `Product "${name}" updated.`;
  });
}

export async function updateVariantStockAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "products", async () => {
    const variantId = readRequiredNumber(formData, "variantId", "Variant", {
      min: 1,
      integer: true
    });
    const stock = readRequiredNumber(formData, "stock", "Stock", {
      min: 0,
      integer: true
    });

    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock
      }
    });

    return "Inventory updated.";
  });
}

export async function createProductVariantAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "products", async () => {
    const productId = readRequiredNumber(formData, "productId", "Product", {
      min: 1,
      integer: true
    });
    const title = readRequiredText(formData, "title", "Variant title");
    const sku = readRequiredText(formData, "sku", "SKU");
    const price = readRequiredNumber(formData, "price", "Variant price", {
      min: 0.01
    });
    const stock = readRequiredNumber(formData, "stock", "Stock", {
      min: 0,
      integer: true
    });
    const isActive = readBoolean(formData, "isActive", false);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    });
    if (!product) {
      throw new Error("Product not found.");
    }

    await prisma.productVariant.create({
      data: {
        productId,
        title,
        sku,
        price,
        stock,
        isActive
      }
    });

    return `Variant "${title}" added to ${product.name}.`;
  });
}

export async function updateProductVariantAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "products", async () => {
    const variantId = readRequiredNumber(formData, "variantId", "Variant", {
      min: 1,
      integer: true
    });
    const title = readRequiredText(formData, "title", "Variant title");
    const sku = readRequiredText(formData, "sku", "SKU");
    const price = readRequiredNumber(formData, "price", "Variant price", {
      min: 0.01
    });
    const stock = readRequiredNumber(formData, "stock", "Stock", {
      min: 0,
      integer: true
    });
    const isActive = readBoolean(formData, "isActive", false);

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        title,
        sku,
        price,
        stock,
        isActive
      }
    });

    return `Variant "${updated.title}" updated.`;
  });
}

export async function deleteProductVariantAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "products", async () => {
    const variantId = readRequiredNumber(formData, "variantId", "Variant", {
      min: 1,
      integer: true
    });

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, title: true }
    });
    if (!variant) {
      throw new Error("Variant not found.");
    }

    const [cartUsageCount, orderUsageCount] = await Promise.all([
      prisma.cartItem.count({ where: { variantId } }),
      prisma.orderItem.count({ where: { variantId } })
    ]);

    if (cartUsageCount > 0 || orderUsageCount > 0) {
      throw new Error("Cannot delete this variant because it is already used in cart or order records.");
    }

    await prisma.productVariant.delete({
      where: { id: variantId }
    });

    return `Variant "${variant.title}" deleted.`;
  });
}

export async function deleteProductAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "products", async () => {
    const productId = readRequiredNumber(formData, "productId", "Product", {
      min: 1,
      integer: true
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    });
    if (!product) {
      throw new Error("Product not found.");
    }

    const [cartUsageCount, orderUsageCount] = await Promise.all([
      prisma.cartItem.count({ where: { productId } }),
      prisma.orderItem.count({ where: { productId } })
    ]);

    if (cartUsageCount > 0 || orderUsageCount > 0) {
      throw new Error("Cannot delete this product because it is already used in cart or order records.");
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    return `Product "${product.name}" deleted.`;
  });
}

export async function updateOrderStatusesAction(formData: FormData) {
  await runAdminAction(readText(formData, "view") || "orders", async () => {
    const orderId = readRequiredNumber(formData, "orderId", "Order", {
      min: 1,
      integer: true
    });
    const status = readRequiredText(formData, "status", "Order status");
    const paymentStatus = readRequiredText(formData, "paymentStatus", "Payment status");
    const fulfillmentStatus = readRequiredText(formData, "fulfillmentStatus", "Fulfillment status");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        paymentStatus,
        fulfillmentStatus
      }
    });

    return "Order status updated.";
  });
}
