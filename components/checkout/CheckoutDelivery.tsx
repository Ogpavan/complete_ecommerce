const inputClass =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black";

export default function CheckoutDelivery() {
  return (
    <section className="border-b border-gray-200 pb-8">
      <h2 className="mb-4 font-medium text-gray-900">Delivery</h2>

      <div className="grid grid-cols-2 gap-3">
        <label>
          <input type="radio" name="deliveryType" value="ship" defaultChecked className="peer sr-only" />
          <span className="flex h-11 items-center justify-center rounded-md border border-gray-300 text-sm text-gray-700 peer-checked:border-black peer-checked:text-gray-900">
            Ship
          </span>
        </label>
        <label>
          <input type="radio" name="deliveryType" value="pickup" className="peer sr-only" />
          <span className="flex h-11 items-center justify-center rounded-md border border-gray-300 text-sm text-gray-700 peer-checked:border-black peer-checked:text-gray-900">
            Pick up
          </span>
        </label>
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-600" htmlFor="checkout-country">
          Country
        </label>
        <select id="checkout-country" name="country" className={`${inputClass} mt-2`}>
          <option>United States</option>
          <option>Canada</option>
          <option>United Kingdom</option>
          <option>Australia</option>
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm text-gray-600" htmlFor="checkout-first-name">
            First name
          </label>
          <input id="checkout-first-name" name="firstName" type="text" className={`${inputClass} mt-2`} />
        </div>
        <div>
          <label className="text-sm text-gray-600" htmlFor="checkout-last-name">
            Last name
          </label>
          <input id="checkout-last-name" name="lastName" type="text" className={`${inputClass} mt-2`} />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-600" htmlFor="checkout-address">
          Address
        </label>
        <input id="checkout-address" name="address" type="text" className={`${inputClass} mt-2`} />
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-600" htmlFor="checkout-apartment">
          Apartment, suite, etc. (optional)
        </label>
        <input id="checkout-apartment" name="apartment" type="text" className={`${inputClass} mt-2`} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm text-gray-600" htmlFor="checkout-city">
            City
          </label>
          <input id="checkout-city" name="city" type="text" className={`${inputClass} mt-2`} />
        </div>
        <div>
          <label className="text-sm text-gray-600" htmlFor="checkout-state">
            State (optional)
          </label>
          <input id="checkout-state" name="state" type="text" className={`${inputClass} mt-2`} />
        </div>
      </div>

      <div className="mt-4">
        <div>
          <label className="text-sm text-gray-600" htmlFor="checkout-postal-code">
            Postal code
          </label>
          <input id="checkout-postal-code" name="postalCode" type="text" className={`${inputClass} mt-2`} />
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-black" />
        <span>Save this information</span>
      </label>
    </section>
  );
}
