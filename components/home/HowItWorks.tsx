import { Droplets, Sparkles, Sun } from "lucide-react";

const steps = [
  {
    title: "Cleanse",
    detail: "Begin with a gentle cleanse to remove buildup and prep skin.",
    icon: Droplets,
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Treat",
    detail: "Apply targeted serum actives for brightness, texture, and tone.",
    icon: Sparkles,
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Seal",
    detail: "Lock in hydration with moisturizer and daytime SPF protection.",
    icon: Sun,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80"
  }
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs tracking-widest text-gray-500">DAILY ROUTINE</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">How It Works</h2>
          <p className="mt-3 text-sm text-gray-600">
            A simple 3-step ritual built for consistency, visible results, and healthy skin habits.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <article key={step.title} className="overflow-hidden border border-gray-200 bg-white">
              <img src={step.image} alt={step.title} className="h-28 w-full object-cover sm:h-32 lg:h-36" />
              <div className="p-7">
              <div className="flex items-center justify-between">
                <step.icon className="h-5 w-5 text-gray-700" />
                <span className="text-xs font-semibold tracking-[0.18em] text-gray-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{step.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
