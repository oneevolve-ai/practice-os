import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp, sendWhatsAppButtons, haversineDistance } from "@/lib/gupshup";

async function getOrCreateSession(phone: string) {
  return prisma.whatsappSession.upsert({
    where: { phone },
    update: {},
    create: { phone, state: "MAIN_MENU", data: {} },
  });
}

async function updateSession(phone: string, state: string, data: any) {
  await prisma.whatsappSession.update({ where: { phone }, data: { state, data } });
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

async function handleLocation(phone: string, latitude: number, longitude: number, employee: any) {
  const offices = await prisma.officeLocation.findMany({ where: { isActive: true } });
  let nearestOffice = null;
  let minDistance = Infinity;

  for (const office of offices) {
    const dist = haversineDistance(latitude, longitude, office.latitude, office.longitude);
    if (dist < minDistance) { minDistance = dist; nearestOffice = office; }
  }

  if (nearestOffice && minDistance <= nearestOffice.radius) {
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.attendance.findFirst({
      where: { employeeId: employee.id, date: { gte: today } },
    });

    if (existing?.checkIn) {
      await updateSession(phone, "MAIN_MENU", {});
      await sendWhatsApp(phone,
        `ℹ️ You have already checked in today at ${new Date(existing.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} at *${nearestOffice.name}*.`
      );
      return;
    }

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
      `✅ *Attendance Logged Successfully!*\n\n` +
      `👤 ${employee.name}\n` +
      `📍 *${nearestOffice.name}*\n` +
      `🕐 Check-in: *${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}*\n` +
      `📅 ${now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n\n` +
      `Have a productive day! 🌟`
    );
  } else {
    await updateSession(phone, "MAIN_MENU", {});
    const distKm = (minDistance / 1000).toFixed(1);
    await sendWhatsApp(phone,
      `❌ *Location Not Recognised*\n\n` +
      `You are *${distKm} km* away from *${nearestOffice?.name || "nearest office"}*.\n\n` +
      `📍 Please log attendance from office premises.\n\n` +
      `Working remotely? Contact HR to mark WFH attendance.`
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WhatsApp HRMS webhook]", JSON.stringify(body).slice(0, 200));

    // Parse Gupshup v2 payload
    const payload = body.payload || body;
    const phone = payload.source || "";
    const msgType = payload.type || "";
    const msgText = (payload.payload?.text || payload.payload?.postbackText || "").trim().toUpperCase();
    const locationData = payload.payload?.location || null;

    if (!phone) return NextResponse.json({ status: "no phone" });

    const session = await getOrCreateSession(phone);
    const employee = await findEmployee(phone);

    if (!employee) {
      await sendWhatsApp(phone,
        `❌ Your number is not registered in Practice OS.\n\nPlease contact HR to register your number.`
      );
      return NextResponse.json({ status: "unknown employee" });
    }

    const firstName = employee.name.split(" ")[0];

    // Handle location message
    if ((msgType === "location" || locationData) && session.state === "AWAITING_LOCATION") {
      const lat = locationData?.latitude || locationData?.lat;
      const lng = locationData?.longitude || locationData?.lng;
      if (lat && lng) {
        await handleLocation(phone, parseFloat(lat), parseFloat(lng), employee);
        return NextResponse.json({ status: "location processed" });
      }
    }

    // State machine
    switch (session.state) {
      case "AWAITING_LOCATION":
        await sendWhatsApp(phone,
          `📍 Please share your *live location* to log attendance.\n\nTap the 📎 icon → Location → *Send Current Location*`
        );
        break;

      case "LEAVE_MENU":
        if (msgText === "APPLY_LEAVE") {
          await updateSession(phone, "LEAVE_TYPE", {});
          await sendWhatsAppButtons(phone,
            `✏️ *Apply Leave*\n\nStep 1 of 4: Select leave type`,
            [
              { id: "CASUAL", title: "🌴 Casual Leave" },
              { id: "SICK", title: "🤒 Sick Leave" },
              { id: "PRIVILEGE", title: "⭐ Privilege Leave" },
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
            const emoji: Record<string, string> = { PENDING: "⏳", APPROVED: "✅", REJECTED: "❌" };
            const list = leaves.map(l =>
              `${emoji[l.status] || "⏳"} *${l.leaveType}* — ${new Date(l.startDate).toLocaleDateString("en-IN")} to ${new Date(l.endDate).toLocaleDateString("en-IN")} — ${l.status}`
            ).join("\n");
            await sendWhatsApp(phone, `📋 *Your Recent Leave Requests:*\n\n${list}`);
          }
          await sendLeaveMenu(phone);
        } else if (msgText === "LEAVE_BALANCE") {
          const approved = await prisma.leaveRequest.findMany({
            where: { employeeId: employee.id, status: "APPROVED" },
          });
          const used = (type: string) => approved
            .filter(l => l.leaveType === type)
            .reduce((s, l) => s + Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1, 0);
          await sendWhatsApp(phone,
            `📊 *Leave Balance (${new Date().getFullYear()})*\n\n` +
            `🌴 Casual Leave: *${12 - used("CASUAL")} / 12* remaining\n` +
            `🤒 Sick Leave: *${10 - used("SICK")} / 10* remaining\n` +
            `⭐ Privilege Leave: *${15 - used("PRIVILEGE")} / 15* remaining`
          );
          await sendLeaveMenu(phone);
        } else if (msgText === "MAIN_MENU") {
          await sendMainMenu(phone, firstName);
        } else {
          await sendLeaveMenu(phone);
        }
        break;

      case "LEAVE_TYPE":
        if (["CASUAL","SICK","PRIVILEGE"].includes(msgText)) {
          await updateSession(phone, "LEAVE_FROM", { leaveType: msgText });
          await sendWhatsApp(phone,
            `✏️ *Apply ${msgText} Leave*\n\nStep 2 of 4: Enter *from date*\n\nFormat: DD/MM/YYYY\nExample: 20/04/2026`
          );
        } else {
          await sendWhatsApp(phone, "Please select a valid leave type by tapping one of the options.");
        }
        break;

      case "LEAVE_FROM": {
        const raw = (payload.payload?.text || "").trim();
        const parts = raw.split("/");
        if (parts.length === 3) {
          const fromDate = new Date(`${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`);
          if (!isNaN(fromDate.getTime())) {
            await updateSession(phone, "LEAVE_TO", { ...(session.data as any), fromDate: fromDate.toISOString() });
            await sendWhatsApp(phone, `✏️ Step 3 of 4: Enter *to date*\n\nFormat: DD/MM/YYYY`);
          } else {
            await sendWhatsApp(phone, "❌ Invalid date. Please use DD/MM/YYYY format.\nExample: 20/04/2026");
          }
        } else {
          await sendWhatsApp(phone, "❌ Invalid format. Please use DD/MM/YYYY\nExample: 20/04/2026");
        }
        break;
      }

      case "LEAVE_TO": {
        const raw = (payload.payload?.text || "").trim();
        const parts = raw.split("/");
        if (parts.length === 3) {
          const toDate = new Date(`${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`);
          if (!isNaN(toDate.getTime())) {
            await updateSession(phone, "LEAVE_REASON", { ...(session.data as any), toDate: toDate.toISOString() });
            await sendWhatsApp(phone, `✏️ Step 4 of 4: Enter *reason* for your leave`);
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
          `📝 Type: *${data.leaveType} Leave*\n` +
          `📅 From: *${fromDate.toLocaleDateString("en-IN")}*\n` +
          `📅 To: *${toDate.toLocaleDateString("en-IN")}*\n` +
          `📆 Duration: *${days} day${days > 1 ? "s" : ""}*\n` +
          `💬 Reason: ${reason}\n\n` +
          `⏳ Awaiting manager approval`
        );

        // Notify reporting manager
        if (employee.reportingManager) {
          const manager = await prisma.employee.findFirst({
            where: { name: { contains: employee.reportingManager } },
          });
          if (manager?.phone || manager?.personalMobile) {
            const managerPhone = manager.phone || manager.personalMobile || "";
            await sendWhatsApp(managerPhone,
              `🔔 *New Leave Request*\n\n` +
              `👤 *${employee.name}*\n` +
              `🏢 ${employee.department?.name || "—"}\n` +
              `📝 ${data.leaveType} Leave\n` +
              `📅 ${fromDate.toLocaleDateString("en-IN")} → ${toDate.toLocaleDateString("en-IN")} (${days} day${days > 1 ? "s" : ""})\n` +
              `💬 ${reason}\n\n` +
              `Reply with:\n` +
              `✅ *APPROVE ${leave.id.slice(0,8).toUpperCase()}*\n` +
              `❌ *REJECT ${leave.id.slice(0,8).toUpperCase()}*`
            );
          }
        }
        break;
      }

      default:
        // Handle manager approval/rejection
        if (msgText.startsWith("APPROVE ") || msgText.startsWith("REJECT ")) {
          const parts = msgText.split(" ");
          const action = parts[0];
          const shortId = parts[1];

          // Find leave request by short ID
          const leaves = await prisma.leaveRequest.findMany({
            where: { status: "PENDING" },
            include: { employee: true },
          });
          const leave = leaves.find(l => l.id.slice(0,8).toUpperCase() === shortId);

          if (!leave) {
            await sendWhatsApp(phone, `❌ Leave request *${shortId}* not found or already processed.`);
          } else {
            const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
            await prisma.leaveRequest.update({
              where: { id: leave.id },
              data: { status: newStatus },
            });

            // Notify manager
            await sendWhatsApp(phone,
              `${action === "APPROVE" ? "✅" : "❌"} Leave request for *${leave.employee.name}* has been *${newStatus}*.`
            );

            // Notify employee
            const empPhone = leave.employee.phone || leave.employee.personalMobile;
            if (empPhone) {
              const days = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / 86400000) + 1;
              await sendWhatsApp(empPhone,
                action === "APPROVE"
                  ? `✅ *Leave Approved!*

` +
                    `Your *${leave.leaveType} Leave* request has been approved.

` +
                    `📅 ${new Date(leave.startDate).toLocaleDateString("en-IN")} → ${new Date(leave.endDate).toLocaleDateString("en-IN")}
` +
                    `📆 ${days} day${days > 1 ? "s" : ""}

` +
                    `Enjoy your leave! 🌴`
                  : `❌ *Leave Rejected*

` +
                    `Your *${leave.leaveType} Leave* request for ${new Date(leave.startDate).toLocaleDateString("en-IN")} → ${new Date(leave.endDate).toLocaleDateString("en-IN")} has been rejected.

` +
                    `Please contact your manager for more details.`
              );
            }
          }
          return NextResponse.json({ status: "approval processed" });
        }

        // MAIN_MENU or any unrecognised state
        if (msgText === "LOG_ATTENDANCE") {
          await updateSession(phone, "AWAITING_LOCATION", {});
          await sendWhatsApp(phone,
            `📍 *Log Attendance*\n\n` +
            `Please share your *live location* to verify you're at the office.\n\n` +
            `👉 Tap 📎 (attachment) → Location → *Send Current Location*`
          );
        } else if (msgText === "LEAVE_MGMT") {
          await sendLeaveMenu(phone);
        } else {
          await sendMainMenu(phone, firstName);
        }
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
