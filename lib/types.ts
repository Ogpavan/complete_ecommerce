export type ProductBadge = "New";

export type CategorySummary = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
};

export type ProductCardSummary = {
  id: number;
  name: string;
  slug: string;
  defaultVariantId: number | null;
  price: number;
  image: string;
  images: string[];
  category: string;
  categorySlug: string;
  inStock: boolean;
  stock: number;
  badge?: ProductBadge;
};

export type ProductVariantSummary = {
  id: number;
  title: string;
  sku: string;
  price: number;
  stock: number;
  inStock: boolean;
  attributes: Record<string, string> | null;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  images: { id: number; url: string; alt: string | null; sortOrder: number }[];
  variants: ProductVariantSummary[];
  inStock: boolean;
  stock: number;
};

export type HomePayload = {
  featured: ProductCardSummary[];
  newest: ProductCardSummary[];
  categories: CategorySummary[];
};

export type ProductsQuery = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  category: string | null;
  search: string | null;
  inStockOnly: boolean;
  sort: ProductsSort;
};

export type ProductsSort =
  | "newest"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export type ProductsPayload = {
  query: ProductsQuery;
  items: ProductCardSummary[];
};

export type CartItemSummary = {
  id: number;
  productId: number;
  productSlug: string;
  variantId: number;
  name: string;
  variantName: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stock: number;
  inStock: boolean;
};

export type CartSummary = {
  id: number;
  currency: string;
  subtotal: number;
  itemCount: number;
  items: CartItemSummary[];
};

export type AddCartItemInput = {
  productId: number;
  variantId: number;
  quantity?: number;
};

export type UpdateCartItemInput = {
  quantity: number;
};

export type CheckoutInput = {
  fullName?: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  shippingMethod: string;
  paymentMethod?: "upi" | "card";
  upiId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardName?: string;
  notes?: string;
};

export type OrderItemSummary = {
  id: number;
  productId: number;
  variantId: number;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string | null;
};

export type OrderSummary = {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  currency: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  email: string;
  customerFirstName: string;
  customerLastName: string;
  shippingAddress1: string;
  shippingAddress2: string | null;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingMethod: string;
  createdAt: string;
  items: OrderItemSummary[];
};
