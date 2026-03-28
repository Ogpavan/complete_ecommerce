import { existsSync, readFileSync } from "fs";
import path from "path";

function hasGeneratedPrismaClient() {
  const prismaClientPath = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.js");
  if (!existsSync(prismaClientPath)) {
    return false;
  }

  try {
    const contents = readFileSync(prismaClientPath, "utf8");
    if (contents.includes("did not initialize yet")) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

export function isFrontendOnly() {
  const rawFlag =
    process.env.NEXT_PUBLIC_FRONTEND_ONLY ??
    process.env.FRONTEND_ONLY ??
    process.env.DISABLE_PRISMA ??
    "";

  const normalized = String(rawFlag).trim().toLowerCase();
  if (normalized.length > 0) {
    return ["1", "true", "yes", "on"].includes(normalized);
  }

  return !hasGeneratedPrismaClient();
}
