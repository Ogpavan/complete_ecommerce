import type { CartItem } from "@/context/CartContext";

type OrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  className?: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
  className
}: OrderSummaryProps) {
  return (
    <section className={className}>
      <h2 className="mb-4 font-medium text-gray-900">Order summary</h2>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="h-[60px] w-[60px] rounded-md border border-gray-200 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.variantName}</p>
                <p className="text-xs text-gray-500">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {currency.format(item.lineTotal)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="my-6 border-t border-gray-200" />

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-gray-700">
          <span>Subtotal</span>
          <span>{currency.format(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <span>Shipping</span>
          <span>{shipping === 0 ? "FREE" : currency.format(shipping)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <span>Estimated taxes</span>
          <span>{currency.format(tax)}</span>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">{currency.format(total)}</span>
        </div>
      </div>
    </section>
  );
}
