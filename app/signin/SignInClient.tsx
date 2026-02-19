"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/home/Navbar";
import { useQuickAuth } from "@/context/QuickAuthContext";

const DEFAULT_OTP = "123456";

type SignInClientProps = {
  nextPath: string;
  resetRequested: boolean;
};

function normalizePhone(value: string) {
  const compact = value.trim().replace(/\s+/g, "");
  if (compact.startsWith("+")) {
    return `+${compact.slice(1).replace(/\D/g, "")}`;
  }
  return compact.replace(/\D/g, "");
}

function maskPhone(value: string) {
  if (!value) {
    return "";
  }

  const phone = normalizePhone(value);
  if (phone.length <= 4) {
    return phone;
  }

  return `${"*".repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`;
}

export default function SignInClient({ nextPath, resetRequested }: SignInClientProps) {
  const router = useRouter();
  const { loading, isSignedIn, profile, signIn, signOut } = useQuickAuth();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState(resetRequested ? "" : (profile?.name ?? ""));
  const [phone, setPhone] = useState(resetRequested ? "" : (profile?.phone ?? ""));
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (resetRequested && isSignedIn) {
      signOut();
      return;
    }

    if (isSignedIn) {
      router.replace(nextPath);
    }
  }, [isSignedIn, loading, nextPath, resetRequested, router, signOut]);

  useEffect(() => {
    if (!resetRequested && profile) {
      setName(profile.name);
      setPhone(profile.phone);
    }
  }, [profile, resetRequested]);

  if (loading || (isSignedIn && !resetRequested)) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <section className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="text-sm text-gray-600">Preparing your session...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto max-w-xl px-6 py-16">
        <p className="text-sm text-gray-500">Quick sign-in</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Continue to checkout</h1>
        <p className="mt-3 text-sm text-gray-600">
          Use your name and phone number. OTP verification is required before checkout.
        </p>

        <div className="mt-8 rounded-none border border-gray-200 p-6">
          {step === "details" ? (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setError(null);

                const normalizedName = name.trim().replace(/\s+/g, " ");
                const normalizedPhone = normalizePhone(phone);

                if (normalizedName.length < 2) {
                  setError("Please enter a valid name.");
                  return;
                }

                if (normalizedPhone.length < 10) {
                  setError("Please enter a valid phone number.");
                  return;
                }

                setSubmitting(true);
                try {
                  const response = await fetch("/api/auth/otp", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      action: "request",
                      name: normalizedName,
                      phone: normalizedPhone
                    })
                  });

                  const data = (await response.json()) as { error?: string };
                  if (!response.ok) {
                    throw new Error(data.error || "Unable to send OTP.");
                  }

                  setName(normalizedName);
                  setPhone(normalizedPhone);
                  setStep("otp");
                } catch (err) {
                  const message = err instanceof Error ? err.message : "Unable to send OTP.";
                  setError(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div>
                <label htmlFor="quick-auth-name" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="quick-auth-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="mt-2 h-11 w-full rounded-none border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="quick-auth-phone" className="text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="quick-auth-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  className="mt-2 h-11 w-full rounded-none border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                  placeholder="+91 9876543210"
                />
              </div>

              {error ? (
                <p className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-none bg-black text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setError(null);
                setSubmitting(true);

                try {
                  const response = await fetch("/api/auth/otp", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      action: "verify",
                      phone,
                      otp: otp.trim()
                    })
                  });

                  const data = (await response.json()) as { error?: string };
                  if (!response.ok) {
                    throw new Error(data.error || "OTP verification failed.");
                  }

                  signIn({ name, phone });
                  router.replace(nextPath);
                } catch (err) {
                  const message = err instanceof Error ? err.message : "OTP verification failed.";
                  setError(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <p className="text-sm text-gray-600">
                Enter OTP sent to <span className="font-medium text-gray-900">{maskPhone(phone)}</span>.
              </p>
              <p className="rounded-none border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                Demo default OTP: <span className="font-semibold text-gray-900">{DEFAULT_OTP}</span>
              </p>

              <div>
                <label htmlFor="quick-auth-otp" className="text-sm font-medium text-gray-700">
                  OTP
                </label>
                <input
                  id="quick-auth-otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  className="mt-2 h-11 w-full rounded-none border border-gray-300 px-3 text-sm tracking-[0.2em] text-gray-900 outline-none focus:border-gray-500"
                  placeholder="123456"
                />
              </div>

              {error ? (
                <p className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setOtp("");
                    setError(null);
                  }}
                  className="h-11 flex-1 rounded-none border border-gray-300 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Edit details
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 flex-1 rounded-none bg-black text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Need products first?{" "}
          <Link href="/products" className="font-medium text-gray-900 underline underline-offset-2">
            Browse products
          </Link>
        </p>
      </section>
    </main>
  );
}
