type CheckoutShippingProps = {
  shippingMethod: "standard" | "express";
  onShippingMethodChange: (method: "standard" | "express") => void;
};

export default function CheckoutShipping({
  shippingMethod,
  onShippingMethodChange
}: CheckoutShippingProps) {
  return (
    <section className="border-b border-gray-200 pb-8">
      <h2 className="mb-4 font-medium text-gray-900">Shipping Method</h2>

      <div className="space-y-3">
        <label className="block cursor-pointer">
          <input
            type="radio"
            name="shippingMethod"
            value="standard"
            checked={shippingMethod === "standard"}
            onChange={() => onShippingMethodChange("standard")}
            className="peer sr-only"
          />
          <span className="flex items-center justify-between rounded-md border border-gray-300 p-4 peer-checked:border-black">
            <span>
              <span className="block text-sm font-medium text-gray-900">Standard Shipping</span>
            </span>
            <span className="text-sm font-medium text-gray-900">Free over $75</span>
          </span>
        </label>

        <label className="block cursor-pointer">
          <input
            type="radio"
            name="shippingMethod"
            value="express"
            checked={shippingMethod === "express"}
            onChange={() => onShippingMethodChange("express")}
            className="peer sr-only"
          />
          <span className="flex items-center justify-between rounded-md border border-gray-300 p-4 peer-checked:border-black">
            <span>
              <span className="block text-sm font-medium text-gray-900">Express Shipping</span>
            </span>
            <span className="text-sm font-medium text-gray-900">$15.00</span>
          </span>
        </label>
      </div>
    </section>
  );
}
