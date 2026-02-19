import type { Prisma } from "@prisma/client";
import Link from "next/link";
import {
  type LucideIcon,
  AlertTriangle,
  DollarSign,
  Folder,
  LayoutDashboard,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tags,
  Trash2,
  X
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  createCategoryAction,
  createProductAction,
  createProductVariantAction,
  deleteProductAction,
  deleteProductVariantAction,
  updateOrderStatusesAction,
  updateProductDetailsAction,
  updateProductFlagsAction,
  updateProductVariantAction,
  updateVariantStockAction
} from "./actions";

export const dynamic = "force-dynamic";

const ORDER_STATUS_OPTIONS = ["PLACED", "CONFIRMED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUS_OPTIONS = ["PAID", "PENDING", "FAILED", "REFUNDED"];
const FULFILLMENT_STATUS_OPTIONS = ["UNFULFILLED", "PROCESSING", "FULFILLED", "CANCELLED"];

type AdminView = "overview" | "catalog" | "products" | "orders" | "categories";

const SIDEBAR_LINKS: Array<{ label: string; view: AdminView; icon: LucideIcon }> = [
  { label: "Overview", view: "overview", icon: LayoutDashboard },
  { label: "Catalog Setup", view: "catalog", icon: Folder },
  { label: "Product Service", view: "products", icon: Package },
  { label: "Order Service", view: "orders", icon: ShoppingCart },
  { label: "Category Service", view: "categories", icon: Tags }
];

const fieldClass =
  "w-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-900";
const labelClass = "flex flex-col gap-2 text-[11px] font-semibold tracking-[0.16em] text-gray-500 uppercase";
const buttonClass =
  "inline-flex h-11 items-center justify-center border border-gray-900 bg-white px-5 text-sm font-medium text-gray-900 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white";
const buttonSmClass =
  "inline-flex h-9 items-center justify-center border border-gray-900 bg-white px-3 text-xs font-medium text-gray-900 transition hover:bg-black hover:text-white";
const panelClass = "border border-gray-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]";
const productActiveBadgeClass =
  "inline-flex border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-medium tracking-wide text-emerald-700 uppercase";
const productPausedBadgeClass =
  "inline-flex border border-rose-300 bg-rose-50 px-2 py-1 text-[10px] font-medium tracking-wide text-rose-700 uppercase";
const productFeaturedBadgeClass =
  "inline-flex border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-medium tracking-wide text-amber-700 uppercase";
const productStandardBadgeClass =
  "inline-flex border border-slate-300 bg-slate-50 px-2 py-1 text-[10px] font-medium tracking-wide text-slate-600 uppercase";
const activateButtonClass =
  "inline-flex h-9 w-full items-center justify-center border border-emerald-600 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white";
const pauseButtonClass =
  "inline-flex h-9 w-full items-center justify-center border border-rose-600 bg-rose-50 px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-600 hover:text-white";
const markFeaturedButtonClass =
  "inline-flex h-9 w-full items-center justify-center border border-amber-600 bg-amber-50 px-3 text-xs font-medium text-amber-700 transition hover:bg-amber-600 hover:text-white";
const removeFeaturedButtonClass =
  "inline-flex h-9 w-full items-center justify-center border border-slate-500 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-700 hover:text-white";
const saveStockButtonClass =
  "inline-flex h-9 items-center justify-center border border-sky-600 bg-sky-50 px-3 text-xs font-medium text-sky-700 transition hover:bg-sky-600 hover:text-white";
const addVariantButtonClass =
  "inline-flex h-9 items-center justify-center border border-indigo-600 bg-indigo-50 px-3 text-xs font-medium text-indigo-700 transition hover:bg-indigo-600 hover:text-white";
const editButtonClass =
  "inline-flex h-9 items-center justify-center border border-indigo-600 bg-indigo-50 px-3 text-xs font-medium text-indigo-700 transition hover:bg-indigo-600 hover:text-white";
const deleteButtonClass =
  "inline-flex h-9 items-center justify-center border border-rose-600 bg-rose-50 px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-600 hover:text-white";
const overviewSectionClass = "space-y-4 rounded-sm border border-[#dfe7df] bg-[#fbfdfb] p-4";
const catalogSectionClass = "space-y-4 rounded-sm border border-[#ebe7d8] bg-[#fffdf7] p-4";
const productsSectionClass = "space-y-4 rounded-sm border border-[#dbe6f5] bg-[#f8fbff] p-4";
const ordersSectionClass = "space-y-4 rounded-sm border border-[#e6dcf3] bg-[#fcf9ff] p-4";
const categoriesSectionClass = "space-y-4 rounded-sm border border-[#dcebe2] bg-[#f8fcf9] p-4";
const statCardClasses = [
  "border border-[#dbe4f5] bg-[#f9fbff] p-5",
  "border border-[#dce7df] bg-[#f8fcf9] p-5",
  "border border-[#ede1d8] bg-[#fffaf7] p-5",
  "border border-[#e3dff0] bg-[#fbf9ff] p-5",
  "border border-[#dce7df] bg-[#f5faf7] p-5",
  "border border-[#f0e6d6] bg-[#fffdf7] p-5"
];

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function pickFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function normalizeView(value: string | null): AdminView {
  const allowed: AdminView[] = ["overview", "catalog", "products", "orders", "categories"];
  if (!value) {
    return "overview";
  }
  return allowed.includes(value as AdminView) ? (value as AdminView) : "overview";
}

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function formatDateTime(value: Date) {
  const iso = value.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

function navClass(active: boolean) {
  if (active) {
    return "flex items-center gap-2 border border-gray-900 bg-black px-4 py-2.5 text-sm font-medium tracking-wide text-white";
  }
  return "flex items-center gap-2 border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium tracking-wide text-gray-800 transition hover:border-gray-900";
}

function badgeClass(active: boolean) {
  if (active) {
    return "inline-flex border border-gray-900 bg-black px-2 py-1 text-[10px] font-medium tracking-wide text-white uppercase";
  }
  return "inline-flex border border-gray-300 bg-white px-2 py-1 text-[10px] font-medium tracking-wide text-gray-600 uppercase";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const success = pickFirst(params.success);
  const error = pickFirst(params.error);
  const activeView = normalizeView(pickFirst(params.view));
  const activeModal = pickFirst(params.modal);
  const modalProductId = pickFirst(params.productId);
  const modalVariantId = pickFirst(params.variantId);
  const showCategoryModal = activeView === "catalog" && activeModal === "category";

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    lowStockVariants,
    totalOrders,
    openOrders,
    revenueAggregate,
    categories,
    products,
    orders
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { featured: true } }),
    prisma.productVariant.count({ where: { isActive: true, stock: { lte: 5 } } }),
    prisma.order.count(),
    prisma.order.count({ where: { fulfillmentStatus: { not: "FULFILLED" } } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } }
    }),
    prisma.product.findMany({
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: 25,
      include: {
        category: { select: { name: true } },
        variants: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            title: true,
            sku: true,
            stock: true,
            isActive: true,
            price: true
          }
        }
      }
    }),
    prisma.order.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 25,
      include: { items: { select: { quantity: true } } }
    })
  ]);

  const hasCategories = categories.length > 0;
  const selectedModalProductId = modalProductId ? Number(modalProductId) : NaN;
  const modalProduct = Number.isInteger(selectedModalProductId)
    ? products.find((product) => product.id === selectedModalProductId)
    : undefined;
  const selectedModalVariantId = modalVariantId ? Number(modalVariantId) : NaN;
  const modalVariantRecord = Number.isInteger(selectedModalVariantId)
    ? products
        .flatMap((product) => product.variants.map((variant) => ({ product, variant })))
        .find((entry) => entry.variant.id === selectedModalVariantId)
    : undefined;
  const showAddVariantModal = activeView === "products" && activeModal === "variant" && Boolean(modalProduct);
  const showEditProductModal =
    activeView === "products" && activeModal === "edit-product" && Boolean(modalProduct);
  const showEditVariantModal =
    activeView === "products" && activeModal === "edit-variant" && Boolean(modalVariantRecord);
  const totalRevenue = toNumber(revenueAggregate._sum.total);
  const stats = [
    { label: "Total Products", value: String(totalProducts) },
    { label: "Active Products", value: String(activeProducts) },
    { label: "Featured", value: String(featuredProducts) },
    { label: "Total Orders", value: String(totalOrders) },
    { label: "Open Orders", value: String(openOrders) },
    { label: "Revenue", value: formatCurrency(totalRevenue) }
  ];

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-gray-900">
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-[#e7ede8]">
        <div className="px-4 py-2 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-medium tracking-wide text-gray-700 sm:text-xs">
            Store Admin Panel
          </p>
        </div>
      </div>

      <section className="w-full px-3 py-6 sm:px-4 lg:px-5">
        <div className="relative">
          <aside className="md:fixed md:top-12 md:left-3 md:w-[240px] md:max-h-[calc(100vh-4rem)] md:overflow-auto lg:left-4">
            <div className="border border-gray-200 bg-[#fcfdfb] p-3">
              <div className="border-b border-gray-200 pb-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-500 uppercase">Admin Dashboard</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">Services</h2>
              </div>

              <nav className="mt-4 space-y-2">
                {SIDEBAR_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.view} href={`/admin?view=${link.view}`} className={navClass(activeView === link.view)}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-gray-500 uppercase">Quick Stats</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <ShoppingCart className="h-4 w-4 text-[#4a5f7f]" aria-hidden="true" />
                  <span>Open Orders: {openOrders}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <AlertTriangle className="h-4 w-4 text-[#a56b2b]" aria-hidden="true" />
                  <span>Low Stock: {lowStockVariants}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <DollarSign className="h-4 w-4 text-[#3f7b52]" aria-hidden="true" />
                  <span>Revenue: {formatCurrency(totalRevenue)}</span>
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <Link href="/" className="flex items-center justify-center gap-2 border border-gray-900 px-4 py-2.5 text-center text-sm font-medium text-gray-900 transition hover:bg-black hover:text-white">
                  <Store className="h-4 w-4" aria-hidden="true" />
                  <span>View Storefront</span>
                </Link>
                <Link href="/products" className="flex items-center justify-center gap-2 border border-gray-900 bg-black px-4 py-2.5 text-center text-sm font-medium text-white transition hover:opacity-90">
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  <span>Open Product Catalog</span>
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-6 md:ml-[256px]">
            {success ? <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{success}</div> : null}
            {error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div> : null}

            {activeView === "overview" ? (
              <section className={overviewSectionClass}>
                <h2 className="text-xs font-semibold tracking-[0.2em] text-[#4d5f53] uppercase">Overview Service</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {stats.map((stat, index) => (
                    <div key={stat.label} className={statCardClasses[index] ?? statCardClasses[0]}>
                      <p className="text-[11px] tracking-[0.15em] text-gray-500 uppercase">{stat.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === "catalog" ? (
              <section className={catalogSectionClass}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-[#6b6047] uppercase">Catalog Setup Service</h2>
                  <Link
                    href="/admin?view=catalog&modal=category"
                    className="inline-flex items-center gap-2 border border-gray-900 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-black hover:text-white"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Add Category</span>
                  </Link>
                </div>

                <div className={panelClass}>
                  <h3 className="text-lg font-semibold text-gray-900">Create Product</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Product creation stays here. Use the <span className="font-semibold">Add Category</span> button when needed.
                  </p>

                  <form action={createProductAction} className="mt-5 grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="view" value="catalog" />
                    <label className={labelClass}>Product Name<input className={fieldClass} name="name" required /></label>
                    <label className={labelClass}>Slug (optional)<input className={fieldClass} name="slug" /></label>
                    <label className={labelClass}>Category<select className={fieldClass} name="categoryId" required disabled={!hasCategories} defaultValue={hasCategories ? String(categories[0].id) : ""}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                    <label className={labelClass}>Image URL (optional)<input className={fieldClass} name="imageUrl" /></label>
                    <label className={labelClass}>Base Price<input className={fieldClass} name="basePrice" type="number" min="0.01" step="0.01" required /></label>
                    <label className={labelClass}>Variant Title<input className={fieldClass} name="variantTitle" placeholder="Default" /></label>
                    <label className={labelClass}>Variant SKU<input className={fieldClass} name="variantSku" required /></label>
                    <label className={labelClass}>Variant Price<input className={fieldClass} name="variantPrice" type="number" min="0.01" step="0.01" /></label>
                    <label className={labelClass}>Variant Stock<input className={fieldClass} name="variantStock" type="number" min="0" defaultValue={10} required /></label>
                    <label className={labelClass}>Short Description<input className={fieldClass} name="shortDescription" /></label>
                    <label className={`${labelClass} md:col-span-2`}>Description<textarea className={`${fieldClass} min-h-[100px] resize-y`} name="description" required /></label>
                    <div className="flex flex-wrap items-center gap-6 md:col-span-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input name="featured" type="checkbox" value="true" className="h-4 w-4" />Featured</label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input name="isActive" type="checkbox" value="true" defaultChecked className="h-4 w-4" />Active</label>
                    </div>
                    <div className="md:col-span-2"><button type="submit" className={`${buttonClass} w-full`} disabled={!hasCategories}>Create Product</button></div>
                    {!hasCategories ? (
                      <div className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 md:col-span-2">
                        No category found. Click <span className="font-semibold">Add Category</span> above.
                      </div>
                    ) : null}
                  </form>
                </div>
              </section>
            ) : null}

            {showCategoryModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="w-full max-w-xl border border-gray-200 bg-white p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-gray-500 uppercase">Catalog Setup</p>
                      <h3 className="mt-1 text-xl font-semibold text-gray-900">Add Category</h3>
                      <p className="mt-1 text-sm text-gray-600">Create a new category for product assignment.</p>
                    </div>
                    <Link
                      href="/admin?view=catalog"
                      className="inline-flex h-9 w-9 items-center justify-center border border-gray-300 text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      aria-label="Close category popup"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <form action={createCategoryAction} className="mt-5 space-y-4">
                    <input type="hidden" name="view" value="catalog" />
                    <label className={labelClass}>
                      Name
                      <input className={fieldClass} name="name" required />
                    </label>
                    <label className={labelClass}>
                      Slug (optional)
                      <input className={fieldClass} name="slug" />
                    </label>
                    <label className={labelClass}>
                      Description (optional)
                      <textarea className={`${fieldClass} min-h-[90px] resize-y`} name="description" />
                    </label>
                    <label className={labelClass}>
                      Image URL (optional)
                      <input className={fieldClass} name="imageUrl" />
                    </label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button type="submit" className={buttonClass}>
                        Create Category
                      </button>
                      <Link
                        href="/admin?view=catalog"
                        className="inline-flex h-11 items-center justify-center border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}

            {activeView === "products" ? (
              <section className={productsSectionClass}>
                <h2 className="text-xs font-semibold tracking-[0.2em] text-[#4a5f7f] uppercase">Product Service</h2>
                <div className={panelClass}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[940px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-[11px] tracking-[0.16em] text-gray-500 uppercase">
                          <th className="pb-3 pr-4 font-semibold">Product</th>
                          <th className="pb-3 pr-4 font-semibold">Price</th>
                          <th className="pb-3 pr-4 font-semibold">Flags</th>
                          <th className="pb-3 pr-4 font-semibold">Actions</th>
                          <th className="pb-3 pr-4 font-semibold">Variants</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b border-gray-100 align-top">
                            <td className="py-4 pr-4"><p className="font-semibold text-gray-900">{product.name}</p><p className="text-xs text-gray-500">{product.category.name}</p></td>
                            <td className="py-4 pr-4 font-medium text-gray-900">{formatCurrency(toNumber(product.basePrice))}</td>
                            <td className="space-y-2 py-4 pr-4">
                              <span className={product.isActive ? productActiveBadgeClass : productPausedBadgeClass}>
                                {product.isActive ? "Active" : "Paused"}
                              </span>
                              <span className={product.featured ? productFeaturedBadgeClass : productStandardBadgeClass}>
                                {product.featured ? "Featured" : "Standard"}
                              </span>
                            </td>
                            <td className="space-y-2 py-4 pr-4">
                              <Link
                                href={`/admin?view=products&modal=edit-product&productId=${product.id}`}
                                className={`${editButtonClass} w-full gap-2`}
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Edit Product</span>
                              </Link>
                              <form action={updateProductFlagsAction}>
                                <input type="hidden" name="view" value="products" />
                                <input type="hidden" name="productId" value={product.id} />
                                <input type="hidden" name="featured" value={String(product.featured)} />
                                <input type="hidden" name="isActive" value={String(!product.isActive)} />
                                <button
                                  type="submit"
                                  className={product.isActive ? pauseButtonClass : activateButtonClass}
                                >
                                  {product.isActive ? "Pause" : "Activate"}
                                </button>
                              </form>
                              <form action={updateProductFlagsAction}>
                                <input type="hidden" name="view" value="products" />
                                <input type="hidden" name="productId" value={product.id} />
                                <input type="hidden" name="featured" value={String(!product.featured)} />
                                <input type="hidden" name="isActive" value={String(product.isActive)} />
                                <button
                                  type="submit"
                                  className={product.featured ? removeFeaturedButtonClass : markFeaturedButtonClass}
                                >
                                  {product.featured ? "Remove Featured" : "Mark Featured"}
                                </button>
                              </form>
                              <form action={deleteProductAction}>
                                <input type="hidden" name="view" value="products" />
                                <input type="hidden" name="productId" value={product.id} />
                                <button type="submit" className={`${deleteButtonClass} w-full gap-2`}>
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>Delete Product</span>
                                </button>
                              </form>
                            </td>
                            <td className="space-y-2 py-4 pr-4">
                              {product.variants.map((variant) => (
                                <div key={variant.id} className="space-y-2 border border-sky-100 bg-sky-50/60 p-2">
                                  <form action={updateVariantStockAction} className="flex items-center gap-2">
                                    <input type="hidden" name="view" value="products" />
                                    <input type="hidden" name="variantId" value={variant.id} />
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-semibold text-gray-700">{variant.title}</p>
                                      <p className="truncate text-[11px] text-gray-500">{variant.sku}</p>
                                      <p className="text-[11px] text-gray-500">{formatCurrency(toNumber(variant.price))}</p>
                                    </div>
                                    <input className="w-20 border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-900" name="stock" type="number" min="0" defaultValue={variant.stock} />
                                    <button type="submit" className={saveStockButtonClass}>Save</button>
                                  </form>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Link
                                      href={`/admin?view=products&modal=edit-variant&variantId=${variant.id}`}
                                      className={`${editButtonClass} gap-2`}
                                    >
                                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                      <span>Edit</span>
                                    </Link>
                                    <form action={deleteProductVariantAction}>
                                      <input type="hidden" name="view" value="products" />
                                      <input type="hidden" name="variantId" value={variant.id} />
                                      <button type="submit" className={`${deleteButtonClass} w-full gap-2`}>
                                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        <span>Delete</span>
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              ))}
                              <Link
                                href={`/admin?view=products&modal=variant&productId=${product.id}`}
                                className={`${addVariantButtonClass} mt-1 w-full gap-2`}
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Add Variant</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            ) : null}

            {showEditProductModal && modalProduct ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="w-full max-w-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-gray-500 uppercase">Product Service</p>
                      <h3 className="mt-1 text-xl font-semibold text-gray-900">Edit Product</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Update details for <span className="font-semibold">{modalProduct.name}</span>.
                      </p>
                    </div>
                    <Link
                      href="/admin?view=products"
                      className="inline-flex h-9 w-9 items-center justify-center border border-gray-300 text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      aria-label="Close edit product popup"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <form action={updateProductDetailsAction} className="mt-5 grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="view" value="products" />
                    <input type="hidden" name="productId" value={modalProduct.id} />
                    <label className={labelClass}>
                      Product Name
                      <input className={fieldClass} name="name" defaultValue={modalProduct.name} required />
                    </label>
                    <label className={labelClass}>
                      Slug
                      <input className={fieldClass} name="slug" defaultValue={modalProduct.slug} required />
                    </label>
                    <label className={labelClass}>
                      Category
                      <select className={fieldClass} name="categoryId" defaultValue={String(modalProduct.categoryId)} required>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Base Price
                      <input
                        className={fieldClass}
                        name="basePrice"
                        type="number"
                        min="0.01"
                        step="0.01"
                        defaultValue={toNumber(modalProduct.basePrice)}
                        required
                      />
                    </label>
                    <label className={labelClass}>
                      Short Description
                      <input
                        className={fieldClass}
                        name="shortDescription"
                        defaultValue={modalProduct.shortDescription ?? ""}
                      />
                    </label>
                    <label className={`${labelClass} md:col-span-2`}>
                      Description
                      <textarea
                        className={`${fieldClass} min-h-[100px] resize-y`}
                        name="description"
                        defaultValue={modalProduct.description}
                        required
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-6 md:col-span-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          name="featured"
                          type="checkbox"
                          value="true"
                          className="h-4 w-4"
                          defaultChecked={modalProduct.featured}
                        />
                        Featured
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          name="isActive"
                          type="checkbox"
                          value="true"
                          className="h-4 w-4"
                          defaultChecked={modalProduct.isActive}
                        />
                        Active
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button type="submit" className={buttonClass}>
                        Save Product
                      </button>
                      <Link
                        href="/admin?view=products"
                        className="inline-flex h-11 items-center justify-center border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}

            {showEditVariantModal && modalVariantRecord ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="w-full max-w-xl border border-gray-200 bg-white p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-gray-500 uppercase">Product Service</p>
                      <h3 className="mt-1 text-xl font-semibold text-gray-900">Edit Variant</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {modalVariantRecord.product.name} /{" "}
                        <span className="font-semibold">{modalVariantRecord.variant.title}</span>
                      </p>
                    </div>
                    <Link
                      href="/admin?view=products"
                      className="inline-flex h-9 w-9 items-center justify-center border border-gray-300 text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      aria-label="Close edit variant popup"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <form action={updateProductVariantAction} className="mt-5 grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="view" value="products" />
                    <input type="hidden" name="variantId" value={modalVariantRecord.variant.id} />
                    <label className={labelClass}>
                      Variant Title
                      <input
                        className={fieldClass}
                        name="title"
                        defaultValue={modalVariantRecord.variant.title}
                        required
                      />
                    </label>
                    <label className={labelClass}>
                      SKU
                      <input
                        className={fieldClass}
                        name="sku"
                        defaultValue={modalVariantRecord.variant.sku}
                        required
                      />
                    </label>
                    <label className={labelClass}>
                      Price
                      <input
                        className={fieldClass}
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        defaultValue={toNumber(modalVariantRecord.variant.price)}
                        required
                      />
                    </label>
                    <label className={labelClass}>
                      Stock
                      <input
                        className={fieldClass}
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={modalVariantRecord.variant.stock}
                        required
                      />
                    </label>
                    <div className="flex items-center md:col-span-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          name="isActive"
                          type="checkbox"
                          value="true"
                          defaultChecked={modalVariantRecord.variant.isActive}
                          className="h-4 w-4"
                        />
                        Active
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button type="submit" className={buttonClass}>
                        Save Variant
                      </button>
                      <Link
                        href="/admin?view=products"
                        className="inline-flex h-11 items-center justify-center border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}

            {showAddVariantModal && modalProduct ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="w-full max-w-xl border border-gray-200 bg-white p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-gray-500 uppercase">Product Service</p>
                      <h3 className="mt-1 text-xl font-semibold text-gray-900">Add Variant</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Add a new variant for <span className="font-semibold">{modalProduct.name}</span>.
                      </p>
                    </div>
                    <Link
                      href="/admin?view=products"
                      className="inline-flex h-9 w-9 items-center justify-center border border-gray-300 text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      aria-label="Close variant popup"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <form action={createProductVariantAction} className="mt-5 grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="view" value="products" />
                    <input type="hidden" name="productId" value={modalProduct.id} />
                    <label className={labelClass}>
                      Variant Title
                      <input className={fieldClass} name="title" required />
                    </label>
                    <label className={labelClass}>
                      SKU
                      <input className={fieldClass} name="sku" required />
                    </label>
                    <label className={labelClass}>
                      Price
                      <input className={fieldClass} name="price" type="number" min="0.01" step="0.01" required />
                    </label>
                    <label className={labelClass}>
                      Stock
                      <input className={fieldClass} name="stock" type="number" min="0" defaultValue={0} required />
                    </label>
                    <div className="flex items-center md:col-span-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          name="isActive"
                          type="checkbox"
                          value="true"
                          defaultChecked
                          className="h-4 w-4"
                        />
                        Active
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button type="submit" className={buttonClass}>
                        Create Variant
                      </button>
                      <Link
                        href="/admin?view=products"
                        className="inline-flex h-11 items-center justify-center border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}

            {activeView === "orders" ? (
              <section className={ordersSectionClass}>
                <h2 className="text-xs font-semibold tracking-[0.2em] text-[#625080] uppercase">Order Service</h2>
                <div className={panelClass}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[940px] border-collapse text-left text-sm">
                      <thead><tr className="border-b border-gray-200 text-[11px] tracking-[0.16em] text-gray-500 uppercase"><th className="pb-3 pr-4 font-semibold">Order</th><th className="pb-3 pr-4 font-semibold">Total</th><th className="pb-3 pr-4 font-semibold">Placed</th><th className="pb-3 pr-4 font-semibold">Status</th></tr></thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-100 align-top">
                            <td className="py-4 pr-4"><p className="font-semibold text-gray-900">{order.orderNumber}</p><p className="text-xs text-gray-500">{order.customerFirstName} {order.customerLastName}</p></td>
                            <td className="py-4 pr-4 font-medium text-gray-900">{formatCurrency(toNumber(order.total))}</td>
                            <td className="py-4 pr-4 text-gray-700">{formatDateTime(order.createdAt)}</td>
                            <td className="py-4 pr-4">
                              <form action={updateOrderStatusesAction} className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                                <input type="hidden" name="view" value="orders" />
                                <input type="hidden" name="orderId" value={order.id} />
                                <select className={fieldClass} name="status" defaultValue={order.status}>{ORDER_STATUS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                                <select className={fieldClass} name="paymentStatus" defaultValue={order.paymentStatus}>{PAYMENT_STATUS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                                <select className={fieldClass} name="fulfillmentStatus" defaultValue={order.fulfillmentStatus}>{FULFILLMENT_STATUS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                                <button type="submit" className={buttonSmClass}>Update</button>
                              </form>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            ) : null}

            {activeView === "categories" ? (
              <section className={categoriesSectionClass}>
                <h2 className="text-xs font-semibold tracking-[0.2em] text-[#4e6b59] uppercase">Category Service</h2>
                <div className={panelClass}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                      <thead><tr className="border-b border-gray-200 text-[11px] tracking-[0.16em] text-gray-500 uppercase"><th className="pb-3 pr-4 font-semibold">Name</th><th className="pb-3 pr-4 font-semibold">Slug</th><th className="pb-3 pr-4 font-semibold">Products</th><th className="pb-3 pr-4 font-semibold">Description</th></tr></thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={category.id} className="border-b border-gray-100">
                            <td className="py-4 pr-4 font-medium text-gray-900">{category.name}</td>
                            <td className="py-4 pr-4 text-gray-600">{category.slug}</td>
                            <td className="py-4 pr-4 text-gray-900">{category._count.products}</td>
                            <td className="py-4 pr-4 text-gray-600">{category.description ?? "No description"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
