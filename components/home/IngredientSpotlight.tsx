import Link from "next/link";

const ingredients = [
  {
    name: "Niacinamide",
    benefit: "Helps visibly refine pores and improve overall tone balance.",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Hyaluronic Acid",
    benefit: "Boosts hydration retention so skin looks smoother and bouncier.",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Vitamin C",
    benefit: "Supports brightness and helps reduce the look of dullness.",
    image:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=900&q=80"
  }
];

export default function IngredientSpotlight() {
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-gray-500">FORMULA FOCUS</p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-900">Ingredient Spotlight</h2>
            <p className="mt-3 max-w-2xl text-sm text-gray-600">
              Meet the ingredients behind the glow, hydration, and barrier support in our best sellers.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-10 items-center border border-gray-900 px-4 text-xs font-medium tracking-wide text-gray-900 uppercase transition hover:bg-black hover:text-white"
          >
            View all products
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {ingredients.map((ingredient) => (
            <article key={ingredient.name} className="overflow-hidden border border-gray-200 bg-white">
              <img src={ingredient.image} alt={ingredient.name} className="h-52 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900">{ingredient.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{ingredient.benefit}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
