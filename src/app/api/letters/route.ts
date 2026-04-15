import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 60, fontFamily: "Helvetica", fontSize: 10, color: "#18181b" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, borderBottom: "2px solid #18181b", paddingBottom: 15 },
  company: { fontSize: 20, fontWeight: "bold" },
  tagline: { fontSize: 8, color: "#71717a", marginTop: 2 },
  date: { fontSize: 9, color: "#71717a", textAlign: "right" },
  ref: { fontSize: 9, color: "#71717a", textAlign: "right", marginTop: 2 },
  title: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 20, marginTop: 10 },
  section: { marginBottom: 12 },
  label: { fontSize: 9, color: "#71717a", marginBottom: 3 },
  value: { fontSize: 10, fontWeight: "bold" },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 10, color: "#3f3f46" },
  table: { marginBottom: 12 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #e4e4e7", paddingVertical: 5 },
  tableLabel: { width: "40%", color: "#71717a", fontSize: 9 },
  tableValue: { width: "60%", fontWeight: "bold", fontSize: 9 },
  footer: { position: "absolute", bottom: 40, left: 60, right: 60 },
  footerLine: { borderTop: "1px solid #e4e4e7", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#a1a1aa" },
  signSection: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  signBox: { width: "45%" },
  signLine: { borderTop: "1px solid #18181b", marginTop: 40, marginBottom: 5 },
  signLabel: { fontSize: 9, color: "#71717a" },
});

function OfferLetterPDF({ emp, date, refNo }: { emp: any; date: string; refNo: string }) {
  const joiningDate = emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "To be confirmed";
  const basic = emp.basicSalary || 0;
  const hra = emp.hra || Math.round(basic * 0.4);
  const allowances = emp.allowances || 0;
  const gross = basic + hra + allowances;

  return createElement(Document, {},
    createElement(Page, { size: "A4", style: styles.page },
      createElement(View, { style: styles.header },
        createElement(View, {},
          createElement(Text, { style: styles.company }, "OneEvolve.AI"),
          createElement(Text, { style: styles.tagline }, "CLANCY GLOBAL · PRACTICE OS"),
        ),
        createElement(View, {},
          createElement(Text, { style: styles.date }, date),
          createElement(Text, { style: styles.ref }, `Ref: ${refNo}`),
        ),
      ),

      createElement(Text, { style: styles.title }, "OFFER LETTER"),

      createElement(Text, { style: styles.body },
        `Dear ${emp.name},\n\nWe are pleased to offer you the position of ${emp.designation || "Team Member"} at OneEvolve.AI (Clancy Global). After careful consideration, we believe you will be a valuable addition to our team.`
      ),

      createElement(View, { style: styles.table },
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Position"),
          createElement(Text, { style: styles.tableValue }, emp.designation || "—"),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Department"),
          createElement(Text, { style: styles.tableValue }, emp.department?.name || "—"),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Date of Joining"),
          createElement(Text, { style: styles.tableValue }, joiningDate),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Basic Salary"),
          createElement(Text, { style: styles.tableValue }, `Rs.${basic.toLocaleString("en-IN")} per month`),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "HRA"),
          createElement(Text, { style: styles.tableValue }, `Rs.${hra.toLocaleString("en-IN")} per month`),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Other Allowances"),
          createElement(Text, { style: styles.tableValue }, `Rs.${allowances.toLocaleString("en-IN")} per month`),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Gross CTC"),
          createElement(Text, { style: styles.tableValue }, `Rs.${gross.toLocaleString("en-IN")} per month`),
        ),
      ),

      createElement(Text, { style: styles.body },
        "This offer is subject to:\n• Verification of your educational qualifications and previous employment details\n• Satisfactory reference checks\n• Submission of all required documents on or before your joining date\n• Signing of the company's Non-Disclosure Agreement (NDA)"
      ),

      createElement(Text, { style: styles.body },
        "Please confirm your acceptance of this offer by signing and returning a copy of this letter within 7 days. We look forward to welcoming you to our team."
      ),

      createElement(View, { style: styles.signSection },
        createElement(View, { style: styles.signBox },
          createElement(View, { style: styles.signLine }),
          createElement(Text, { style: styles.signLabel }, "Authorised Signatory"),
          createElement(Text, { style: { fontSize: 9, fontWeight: "bold" } }, "OneEvolve.AI / Clancy Global"),
        ),
        createElement(View, { style: styles.signBox },
          createElement(View, { style: styles.signLine }),
          createElement(Text, { style: styles.signLabel }, "Candidate Acceptance"),
          createElement(Text, { style: { fontSize: 9, fontWeight: "bold" } }, emp.name),
        ),
      ),

      createElement(View, { style: styles.footer },
        createElement(View, { style: styles.footerLine },
          createElement(Text, { style: styles.footerText }, "OneEvolve.AI · practice-os.ai"),
          createElement(Text, { style: styles.footerText }, "Confidential — Not for circulation"),
        ),
      ),
    )
  );
}

function AppointmentLetterPDF({ emp, date, refNo }: { emp: any; date: string; refNo: string }) {
  const joiningDate = emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "To be confirmed";
  const basic = emp.basicSalary || 0;
  const hra = emp.hra || Math.round(basic * 0.4);
  const allowances = emp.allowances || 0;
  const gross = basic + hra + allowances;

  return createElement(Document, {},
    createElement(Page, { size: "A4", style: styles.page },
      createElement(View, { style: styles.header },
        createElement(View, {},
          createElement(Text, { style: styles.company }, "OneEvolve.AI"),
          createElement(Text, { style: styles.tagline }, "CLANCY GLOBAL · PRACTICE OS"),
        ),
        createElement(View, {},
          createElement(Text, { style: styles.date }, date),
          createElement(Text, { style: styles.ref }, `Ref: ${refNo}`),
        ),
      ),

      createElement(Text, { style: styles.title }, "APPOINTMENT LETTER"),

      createElement(Text, { style: styles.body },
        `Dear ${emp.name},\n\nWith reference to your application and subsequent interview, we are pleased to appoint you as ${emp.designation || "Team Member"} in our organisation with effect from ${joiningDate}.`
      ),

      createElement(View, { style: styles.table },
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Employee Name"),
          createElement(Text, { style: styles.tableValue }, emp.name),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Designation"),
          createElement(Text, { style: styles.tableValue }, emp.designation || "—"),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Department"),
          createElement(Text, { style: styles.tableValue }, emp.department?.name || "—"),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Date of Joining"),
          createElement(Text, { style: styles.tableValue }, joiningDate),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Reporting Manager"),
          createElement(Text, { style: styles.tableValue }, emp.reportingManager || "—"),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "Gross CTC"),
          createElement(Text, { style: styles.tableValue }, `Rs.${gross.toLocaleString("en-IN")} per month`),
        ),
        createElement(View, { style: styles.tableRow },
          createElement(Text, { style: styles.tableLabel }, "PF Number"),
          createElement(Text, { style: styles.tableValue }, emp.pfNumber || "To be allotted"),
        ),
      ),

      createElement(Text, { style: styles.body },
        "Terms & Conditions:\n• Your appointment is subject to a probation period of 6 months\n• Notice period: 30 days during probation, 60 days after confirmation\n• You will be bound by the company's policies and code of conduct\n• This appointment is subject to your continued satisfactory performance\n• Unauthorised absence for more than 3 consecutive days may result in termination"
      ),

      createElement(Text, { style: styles.body },
        "Please sign and return the duplicate copy of this letter as a token of your acceptance."
      ),

      createElement(View, { style: styles.signSection },
        createElement(View, { style: styles.signBox },
          createElement(View, { style: styles.signLine }),
          createElement(Text, { style: styles.signLabel }, "Authorised Signatory"),
          createElement(Text, { style: { fontSize: 9, fontWeight: "bold" } }, "OneEvolve.AI / Clancy Global"),
        ),
        createElement(View, { style: styles.signBox },
          createElement(View, { style: styles.signLine }),
          createElement(Text, { style: styles.signLabel }, "Employee Acceptance"),
          createElement(Text, { style: { fontSize: 9, fontWeight: "bold" } }, emp.name),
        ),
      ),

      createElement(View, { style: styles.footer },
        createElement(View, { style: styles.footerLine },
          createElement(Text, { style: styles.footerText }, "OneEvolve.AI · practice-os.ai"),
          createElement(Text, { style: styles.footerText }, "Confidential — Not for circulation"),
        ),
      ),
    )
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const type = searchParams.get("type") || "offer";

  if (!employeeId) return NextResponse.json({ error: "employeeId required" }, { status: 400 });

  const emp = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { department: { select: { name: true } } },
  });
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const refNo = `OE/${type.toUpperCase().slice(0,3)}/${emp.id.slice(0,6).toUpperCase()}/${new Date().getFullYear()}`;

  // @ts-ignore
  const buffer = await renderToBuffer(createElement(
    type === "appointment" ? AppointmentLetterPDF : OfferLetterPDF,
    { emp, date, refNo }
  ) as any);

  const filename = type === "appointment"
    ? `appointment-letter-${emp.name.replace(/\s+/g, "-")}.pdf`
    : `offer-letter-${emp.name.replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
