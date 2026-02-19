import { Suspense } from "react";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
    reset?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextParam = resolvedSearchParams.next;
  const nextPath = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/checkout";
  const resetRequested = resolvedSearchParams.reset === "1";

  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <SignInClient nextPath={nextPath} resetRequested={resetRequested} />
    </Suspense>
  );
}
