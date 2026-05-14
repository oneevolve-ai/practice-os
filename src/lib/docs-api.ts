import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function tenantOf(req: NextRequest): string {
  return req.headers.get("x-tenant-id") ?? "default";
}

export type AuditContext = {
  ipAddress: string | null;
  userAgent: string | null;
};

export function auditContext(req: NextRequest): AuditContext {
  const fwd = req.headers.get("x-forwarded-for");
  const ipAddress = fwd ? fwd.split(",")[0]!.trim() : req.headers.get("x-real-ip");
  const userAgent = req.headers.get("user-agent");
  return { ipAddress: ipAddress ?? null, userAgent: userAgent ?? null };
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}
