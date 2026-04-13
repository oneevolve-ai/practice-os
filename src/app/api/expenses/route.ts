import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const expense = await prisma.expense.create({ data: { category: body.category, description: body.description, amount: body.amount, gstAmount: body.gstAmount || 0, projectName: body.projectName, date: body.date ? new Date(body.date) : new Date() } });
  return NextResponse.json(expense);
}
