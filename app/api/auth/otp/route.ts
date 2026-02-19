import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_OTP = "123456";

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizePhone(value: unknown) {
  const compact = normalizeString(value).replace(/\s+/g, "");
  if (compact.startsWith("+")) {
    return `+${compact.slice(1).replace(/\D/g, "")}`;
  }
  return compact.replace(/\D/g, "");
}

function maskPhone(value: string) {
  if (value.length <= 4) {
    return value;
  }
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

type OtpRequestPayload = {
  action?: "request" | "verify";
  name?: string;
  phone?: string;
  otp?: string;
};

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as OtpRequestPayload;
  const action = payload.action || "verify";
  const phone = normalizePhone(payload.phone);

  if (phone.length < 10) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }

  if (action === "request") {
    const name = normalizeString(payload.name).replace(/\s+/g, " ");
    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
    }

    return NextResponse.json({
      message: "OTP sent successfully.",
      maskedPhone: maskPhone(phone),
      defaultOtp: DEFAULT_OTP
    });
  }

  if (action === "verify") {
    const otp = normalizeString(payload.otp);
    if (otp !== DEFAULT_OTP) {
      return NextResponse.json({ error: "Invalid OTP. Use the default OTP for demo." }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified successfully." });
  }

  return NextResponse.json({ error: "Unsupported OTP action." }, { status: 400 });
}
