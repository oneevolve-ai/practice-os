import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true, industry: true } } },
  });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}
