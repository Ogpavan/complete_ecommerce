import Link from "next/link";

type BreadcrumbProps = {
  productName: string;
};

export default function Breadcrumb({ productName }: BreadcrumbProps) {
  return (
    <div className="mb-2 text-sm text-gray-500">
      <Link href="/" className="transition hover:text-gray-700">
        Home
      </Link>
      <span className="px-2">—</span>
      <span>Beauty & Cosmetics</span>
      <span className="px-2">—</span>
      <span className="text-gray-700">{productName}</span>
    </div>
  );
}
