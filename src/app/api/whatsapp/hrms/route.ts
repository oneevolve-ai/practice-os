import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp, sendWhatsAppButtons, haversineDistance } from "@/lib/gupshup";

async function getOrCreateSession(phone: string) {
  const session = await prisma.whatsappSession.upsert({
    where: { phone },
    update: {},
    create: { phone, state: "MAIN_MENU", data: {} },
  });
  return session;
}

async function updateSession(phone: string, state: string, data: any) {
  await prisma.whatsappSession.update({
    where: { phone },
    data: { state, data },
  });
}

async function findEmployee(phone: string) {
  const clean = phone.replace(/\D/g, "").slice(-10);
  return prisma.employee.findFirst({
    where: { OR: [{ phone: { endsWith: clean } }, { personalMobile: { endsWith: clean } }] },
    include: { department: true },
  });
}

async function sendMainMenu(phone: string, name: string) {
  await updateSession(phone, "MAIN_MENU", {});
  await sendWhatsAppButtons(phone,
    `👋 Hello *${name}*! Welcome to Practice OS HR.\n\nHow can I help you today?`,
    [
      { id: "LOG_ATTENDANCE", title: "📍 Log Attendance" },
      { id: "LEAVE_MGMT", title: "🗓️ Leave Management" },
    ]
  );
}

async function sendLeaveMenu(phone: string) {
  await updateSession(phone, "LEAVE_MENU", {});
  await sendWhatsAppButtons(phone,
    "🗓️ *Leave Management*\n\nWhat would you like to do?",
    [
      { id: "APPLY_LEAVE", title: "✏️ Apply Leave" },
      { id: "LEAVE_STATUS", title: "📋 Leave Status" },
      { id: "LEAVE_BALANCE", title: "📊 Leave Balance" },
      { id: "MAIN_MENU", title: "🔙 Main Menu" },
    ]
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WhatsApp HRMS]", JSON.stringify(body));

    // Parse Gupshup v2 payload
    const payload = body.payload || body;
    const phone = payload.source || payload.payload?.source || "";
    const msgType = payload.type || payload.payload?.type || "";
    const msgText = (payload.payload?.text || payload.payload?.postbackText || "").trim().toUpperCase();
    const locationData = payload.payload?.location || null;

    if (!phone) return NextResponse.json({ status: "no phone" });

    const session = await getOrCreateSession(phone);
    const employee = await findEmployee(phone);

    // If employee not found
    if (!employee) {
      await sendWhatsApp(phone, "❌ Your number is not registered in Practice OS. Please contact HR.");
      return NextResponse.json({ status: "unknown employee" });
    }

    const name = employee.name.split(" ")[0];

    // Handle location message (for attendance)
    if (msgType === "location" && locationData && session.state === "AWAITING_LOCATION") {
      const { latitude, longitude } = locationData;
      const offices = await prisma.officeLocation.findMany({ where: { active: true } });
      let nearestOffice = null;
      let minDistance = Infinity;

      for (const office of offices) {
        const dist = haversineDistance(latitude, longitude, office.lat, office.lng);
        if (dist < minDistance) { minDistance = dist; nearestOffice = office; }
      }

      if (nearestOffice && minDistance <= nearestOffice.radiusMeters) {
        // Mark attendance
        const now = new Date();
        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: now,
            checkIn: now,
            status: "PRESENT",
            notes: `WhatsApp check-in — ${nearestOffice.name}`,
          },
        });
        await updateSession(phone, "MAIN_MENU", {});
        await sendWhatsApp(phone,
          `✅ *Attendance Logged!*\n\n📍 *${nearestOffice.name}*\n🕐 Check-in: ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}\n📅 ${now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n\nHave a great day! 🌟`
        );
      } else {
        await updateSession(phone, "MAIN_MENU", {});
        const distKm = (minDistance / 1000).toFixed(1);
        await sendWhatsApp(phone,
          `❌ *Location Not Recognised*\n\nYou are *${distKm}km* away from ${nearestOffice?.name}.\n\nPlease log attendance from office premises.\n\nWorking remotely? Contact HR to mark WFH.`
        );
      }
      return NextResponse.json({ status: "location processed" });
    }

    // State machine
    switch (session.state) {
      case "MAIN_MENU":
      default:
        if (msgText === "LOG_ATTENDANCE") {
          await updateSession(phone, "AWAITING_LOCATION", {});
          await sendWhatsApp(phone,
            `📍 *Log Attendance*\n\nPlease share your *live location* to verify you're at the office.\n\nTap the 📎 attachment icon → Location → Send Current Location`
          );
        } else if (msgText === "LEAVE_MGMT") {
          await sendLeaveMenu(phone);
        } else {
          await sendMainMenu(phone, name);
        }
        break;

      case "LEAVE_MENU":
        if (msgText === "APPLY_LEAVE") {
          await updateSession(phone, "LEAVE_TYPE", {});
          await sendWhatsAppButtons(phone,
            "✏️ *Apply Leave*\n\nStep 1/4: Select leave type",
            [
              { id: "CASUAL", title: "Casual Leave" },
              { id: "SICK", title: "Sick Leave" },
              { id: "PRIVILEGE", title: "Privilege Leave" },
            ]
          );
        } else if (msgText === "LEAVE_STATUS") {
          const leaves = await prisma.leaveRequest.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: "desc" },
            take: 5,
          });
          if (leaves.length === 0) {
            await sendWhatsApp(phone, "📋 *Leave Status*\n\nNo leave requests found.");
          } else {
            const statusEmoji: Record<string, string> = { PENDING: "⏳", APPROVED: "✅", REJECTED: "❌" };
            const list = leaves.map(l =>
              `${statusEmoji[l.status] || "⏳"} ${l.leaveType} — ${new Date(l.startDate).toLocaleDateString("en-IN")} to ${new Date(l.endDate).toLocaleDateString("en-IN")} — *${l.status}*`
            ).join("\n");
            await sendWhatsApp(phone, `📋 *Your Recent Leave Requests:*\n\n${list}`);
          }
          await sendLeaveMenu(phone);
        } else if (msgText === "LEAVE_BALANCE") {
          const year = new Date().getFullYear();
          const approved = await prisma.leaveRequest.findMany({
            where: { employeeId: employee.id, status: "APPROVED" },
          });
          const used = (type: string) => approved.filter(l => l.leaveType === type).reduce((s, l) => {
            const days = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1;
            return s + days;
          }, 0);
          await sendWhatsApp(phone,
            `📊 *Leave Balance (${year})*\n\n` +
            `🟢 Casual Leave: *${12 - used("CASUAL")} / 12* remaining\n` +
            `🔴 Sick Leave: *${10 - used("SICK")} / 10* remaining\n` +
            `🔵 Privilege Leave: *${15 - used("PRIVILEGE")} / 15* remaining`
          );
          await sendLeaveMenu(phone);
        } else if (msgText === "MAIN_MENU") {
          await sendMainMenu(phone, name);
        } else {
          await sendLeaveMenu(phone);
        }
        break;

      case "LEAVE_TYPE":
        if (["CASUAL","SICK","PRIVILEGE"].includes(msgText)) {
          await updateSession(phone, "LEAVE_FROM", { leaveType: msgText });
          await sendWhatsApp(phone, `✏️ *Apply ${msgText} Leave*\n\nStep 2/4: Enter *from date*\nFormat: DD/MM/YYYY\n\nExample: 15/04/2026`);
        } else {
          await sendWhatsApp(phone, "Please select a valid leave type.");
        }
        break;

      case "LEAVE_FROM": {
        const parts = msgText.split("/");
        if (parts.length === 3) {
          const fromDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(fromDate.getTime())) {
            await updateSession(phone, "LEAVE_TO", { ...(session.data as any), fromDate: fromDate.toISOString() });
            await sendWhatsApp(phone, `✏️ Step 3/4: Enter *to date*\nFormat: DD/MM/YYYY`);
          } else {
            await sendWhatsApp(phone, "❌ Invalid date. Please use DD/MM/YYYY format.");
          }
        } else {
          await sendWhatsApp(phone, "❌ Invalid format. Please use DD/MM/YYYY (e.g. 15/04/2026)");
        }
        break;
      }

      case "LEAVE_TO": {
        const parts = msgText.split("/");
        if (parts.length === 3) {
          const toDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(toDate.getTime())) {
            await updateSession(phone, "LEAVE_REASON", { ...(session.data as any), toDate: toDate.toISOString() });
            await sendWhatsApp(phone, `✏️ Step 4/4: Enter *reason* for leave`);
          } else {
            await sendWhatsApp(phone, "❌ Invalid date. Please use DD/MM/YYYY format.");
          }
        } else {
          await sendWhatsApp(phone, "❌ Invalid format. Please use DD/MM/YYYY");
        }
        break;
      }

      case "LEAVE_REASON": {
        const data = session.data as any;
        const reason = (payload.payload?.text || "").trim();
        const fromDate = new Date(data.fromDate);
        const toDate = new Date(data.toDate);
        const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;

        // Create leave request
        const leave = await prisma.leaveRequest.create({
          data: {
            employeeId: employee.id,
            leaveType: data.leaveType,
            startDate: fromDate,
            endDate: toDate,
            reason,
            status: "PENDING",
          },
        });

        await updateSession(phone, "MAIN_MENU", {});
        await sendWhatsApp(phone,
          `✅ *Leave Application Submitted!*\n\n` +
          `📝 Type: ${data.leaveType} Leave\n` +
          `📅 From: ${fromDate.toLocaleDateString("en-IN")}\n` +
          `📅 To: ${toDate.toLocaleDateString("en-IN")}\n` +
          `📆 Days: ${days}\n` +
          `📋 Reason: ${reason}\n\n` +
          `⏳ Pending manager approval`
        );

        // Notify reporting manager
        if (employee.reportingManager) {
          const manager = await prisma.employee.findFirst({
            where: { name: { contains: employee.reportingManager } },
          });
          if (manager?.phone) {
            await sendWhatsApp(manager.phone,
              `🔔 *Leave Request*\n\n` +
              `👤 *${employee.name}*\n` +
              `📝 ${data.leaveType} Leave\n` +
              `📅 ${fromDate.toLocaleDateString("en-IN")} → ${toDate.toLocaleDateString("en-IN")} (${days} days)\n` +
              `💬 ${reason}\n\n` +
              `Reply:\n` +
              `✅ APPROVE ${leave.id.slice(0,8)}\n` +
              `❌ REJECT ${leave.id.slice(0,8)}`
            );
          }
        }
        break;
      }

      case "AWAITING_LOCATION":
        await sendWhatsApp(phone, "📍 Please share your live location to log attendance.\n\nTap 📎 → Location → Send Current Location");
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    console.error("[WhatsApp HRMS error]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "WhatsApp HRMS webhook active" });
}
