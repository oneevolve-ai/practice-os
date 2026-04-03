import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { pendingApprovalEmail, approvedEmail, rejectedEmail } from "@/lib/email-templates";
import { format } from "date-fns";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, comment, changedBy } = body;

    const current = await prisma.travelRequest.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.travelRequest.update({
        where: { id },
        data: { status },
      }),
      prisma.statusHistory.create({
        data: {
          requestId: id,
          fromStatus: current.status,
          toStatus: status,
          comment: comment || null,
          changedBy: changedBy || "User",
        },
      }),
    ]);

    // Send email notification
    const reqData = {
      title: current.title,
      travelerName: current.travelerName,
      destination: current.destination,
      departureDate: format(current.departureDate, "MMM d, yyyy"),
      returnDate: format(current.returnDate, "MMM d, yyyy"),
      estimatedCost: current.estimatedCost,
    };

    const approverEmail = process.env.APPROVER_EMAIL;
    const requesterEmail = process.env.SMTP_USER; // Fallback to sender for now

    if (status === "PENDING" && approverEmail) {
      const email = pendingApprovalEmail(reqData);
      sendEmail(approverEmail, email.subject, email.html);
    } else if (status === "APPROVED" && requesterEmail) {
      const email = approvedEmail(reqData, comment);
      sendEmail(requesterEmail, email.subject, email.html);
    } else if (status === "REJECTED" && requesterEmail) {
      const email = rejectedEmail(reqData, comment);
      sendEmail(requesterEmail, email.subject, email.html);
    }

    const result = await prisma.travelRequest.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { changedAt: "asc" } },
        attachments: { orderBy: { uploadedAt: "desc" } },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/travel/[id]/status error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
