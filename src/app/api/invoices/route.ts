import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getNextInvoiceNumber(last: string | null): string {
  const fy = new Date().getMonth() >= 3 ? `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(2)}` : `${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(2)}`;
  if (!last) return `OE/${fy}/001`;
  const num = parseInt(last.split("/").pop() || "0") + 1;
  return `OE/${fy}/${String(num).padStart(3, "0")}`;
}

export async function GET() {
  const invoices = await prisma.invoice.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const last = await prisma.invoice.findFirst({ orderBy: { createdAt: "desc" }, select: { number: true } });
  const number = getNextInvoiceNumber(last?.number || null);
  const items = body.items || [];
  const subtotal = items.reduce((s: number, i: { amount: number }) => s + i.amount, 0);
  const isInterState = body.isInterState || false;
  const gstRate = body.gstRate || 18;
  const gstAmount = (subtotal * gstRate) / 100;
  const cgst = isInterState ? 0 : gstAmount / 2;
  const sgst = isInterState ? 0 : gstAmount / 2;
  const igst = isInterState ? gstAmount : 0;
  const total = subtotal + gstAmount;
  const invoice = await prisma.invoice.create({
    data: {
      number, clientName: body.clientName, clientGstin: body.clientGstin,
      clientEmail: body.clientEmail, clientAddress: body.clientAddress,
      placeOfSupply: body.placeOfSupply, gstRate, subtotal, cgst, sgst, igst, total,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      notes: body.notes, status: "DRAFT",
      items: { create: items.map((i: { description: string; hsnCode: string; quantity: number; unit: string; rate: number; amount: number }) => ({ description: i.description, hsnCode: i.hsnCode, quantity: i.quantity, unit: i.unit, rate: i.rate, amount: i.amount })) },
    },
    include: { items: true },
  });
  return NextResponse.json(invoice);
}
