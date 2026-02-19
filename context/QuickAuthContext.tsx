"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type QuickAuthProfile = {
  name: string;
  phone: string;
  verifiedAt: string;
};

type QuickAuthContextValue = {
  loading: boolean;
  profile: QuickAuthProfile | null;
  isSignedIn: boolean;
  signIn: (input: { name: string; phone: string }) => void;
  signOut: () => void;
};

const STORAGE_KEY = "ecommerce:quick-auth:v1";

const QuickAuthContext = createContext<QuickAuthContextValue | null>(null);

function isQuickAuthProfile(value: unknown): value is QuickAuthProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<QuickAuthProfile>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.phone === "string" &&
    typeof candidate.verifiedAt === "string"
  );
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizePhone(value: string) {
  const compact = value.trim().replace(/\s+/g, "");
  if (compact.startsWith("+")) {
    return `+${compact.slice(1).replace(/\D/g, "")}`;
  }
  return compact.replace(/\D/g, "");
}

function readStoredProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isQuickAuthProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function QuickAuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<QuickAuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProfile(readStoredProfile());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading || typeof window === "undefined") {
      return;
    }

    if (!profile) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile, loading]);

  const signIn = useCallback((input: { name: string; phone: string }) => {
    setProfile({
      name: normalizeName(input.name),
      phone: normalizePhone(input.phone),
      verifiedAt: new Date().toISOString()
    });
  }, []);

  const signOut = useCallback(() => {
    setProfile(null);
  }, []);

  const value = useMemo<QuickAuthContextValue>(
    () => ({
      loading,
      profile,
      isSignedIn: Boolean(profile),
      signIn,
      signOut
    }),
    [loading, profile, signIn, signOut]
  );

  return <QuickAuthContext.Provider value={value}>{children}</QuickAuthContext.Provider>;
}

export function useQuickAuth() {
  const context = useContext(QuickAuthContext);
  if (!context) {
    throw new Error("useQuickAuth must be used within QuickAuthProvider");
  }
  return context;
}
