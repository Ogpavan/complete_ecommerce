import type { ReactNode } from "react";

type CheckoutLayoutProps = {
  children: ReactNode;
  summary: ReactNode;
};

export default function CheckoutLayout({ children, summary }: CheckoutLayoutProps) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1fr_480px]">
      <div className="px-4 py-8 sm:px-6 lg:px-12">{children}</div>

      <aside className="hidden border-l border-gray-200 bg-gray-50 lg:block">
        <div className="sticky top-6 px-8 py-8">{summary}</div>
      </aside>
    </main>
  );
}

