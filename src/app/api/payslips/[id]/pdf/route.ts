import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, borderBottom: "2px solid #18181b", paddingBottom: 15 },
  company: { fontSize: 18, fontWeight: "bold", color: "#18181b" },
  tagline: { fontSize: 8, color: "#71717a" },
  title: { fontSize: 14, fontWeight: "bold", color: "#18181b", textAlign: "right" },
  period: { fontSize: 10, color: "#52525b", textAlign: "right" },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: "#71717a", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, borderBottom: "1px solid #e4e4e7", paddingBottom: 3 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  label: { color: "#52525b" },
  value: { fontWeight: "bold", color: "#18181b" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderTop: "1px solid #18181b", marginTop: 4 },
  totalLabel: { fontWeight: "bold", color: "#18181b", fontSize: 11 },
  totalValue: { fontWeight: "bold", color: "#18181b", fontSize: 11 },
  netBox: { backgroundColor: "#18181b", padding: 15, borderRadius: 6, marginTop: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  netLabel: { color: "#ffffff", fontSize: 12 },
  netValue: { color: "#ffffff", fontSize: 20, fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTop: "1px solid #e4e4e7", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#a1a1aa" },
  empSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, backgroundColor: "#f4f4f5", padding: 12, borderRadius: 6 },
  empCol: { flex: 1 },
  empLabel: { fontSize: 8, color: "#71717a", marginBottom: 2 },
  empValue: { fontSize: 10, color: "#18181b", fontWeight: "bold" },
});

function PayslipPDF({ payslip }: { payslip: any }) {
  const fmt = (n: number) => `Rs.${Number(n).toLocaleString("en-IN")}`;
  const emp = payslip.employee;
  const period = `${MONTHS[payslip.month - 1]} ${payslip.year}`;

  return createElement(Document, {},
    createElement(Page, { size: "A4", style: styles.page },
      // Header
      createElement(View, { style: styles.header },
        createElement(View, {},
          createElement(Text, { style: styles.company }, "OneEvolve.AI"),
          createElement(Text, { style: styles.tagline }, "CLANCY GLOBAL · PRACTICE OS"),
        ),
        createElement(View, {},
          createElement(Text, { style: styles.title }, "PAYSLIP"),
          createElement(Text, { style: styles.period }, period),
        ),
      ),

      // Employee Info
      createElement(View, { style: styles.empSection },
        createElement(View, { style: styles.empCol },
          createElement(Text, { style: styles.empLabel }, "EMPLOYEE NAME"),
          createElement(Text, { style: styles.empValue }, emp.name),
          createElement(Text, { style: { ...styles.empLabel, marginTop: 6 } }, "DESIGNATION"),
          createElement(Text, { style: styles.empValue }, emp.designation || "—"),
        ),
        createElement(View, { style: styles.empCol },
          createElement(Text, { style: styles.empLabel }, "DEPARTMENT"),
          createElement(Text, { style: styles.empValue }, emp.department?.name || "—"),
          createElement(Text, { style: { ...styles.empLabel, marginTop: 6 } }, "PAY PERIOD"),
          createElement(Text, { style: styles.empValue }, period),
        ),
        createElement(View, { style: styles.empCol },
          createElement(Text, { style: styles.empLabel }, "WORKING DAYS"),
          createElement(Text, { style: styles.empValue }, `${payslip.presentDays} / ${payslip.workingDays}`),
          createElement(Text, { style: { ...styles.empLabel, marginTop: 6 } }, "PF NUMBER"),
          createElement(Text, { style: styles.empValue }, emp.pfNumber || "—"),
        ),
      ),

      // Earnings
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Earnings"),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Basic Salary"),
          createElement(Text, { style: styles.value }, fmt(payslip.basicSalary)),
        ),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "House Rent Allowance (HRA)"),
          createElement(Text, { style: styles.value }, fmt(payslip.hra)),
        ),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Other Allowances"),
          createElement(Text, { style: styles.value }, fmt(payslip.allowances)),
        ),
        createElement(View, { style: styles.totalRow },
          createElement(Text, { style: styles.totalLabel }, "Gross Salary"),
          createElement(Text, { style: styles.totalValue }, fmt(payslip.grossSalary)),
        ),
      ),

      // Deductions
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Deductions"),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Provident Fund (12%)"),
          createElement(Text, { style: styles.value }, fmt(payslip.pfDeduction)),
        ),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "ESI (0.75%)"),
          createElement(Text, { style: styles.value }, fmt(payslip.esiDeduction)),
        ),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Other Deductions"),
          createElement(Text, { style: styles.value }, fmt(payslip.otherDeductions)),
        ),
        createElement(View, { style: styles.totalRow },
          createElement(Text, { style: styles.totalLabel }, "Total Deductions"),
          createElement(Text, { style: styles.totalValue }, fmt(payslip.pfDeduction + payslip.esiDeduction + payslip.otherDeductions)),
        ),
      ),

      // Net Salary
      createElement(View, { style: styles.netBox },
        createElement(Text, { style: styles.netLabel }, "NET SALARY"),
        createElement(Text, { style: styles.netValue }, fmt(payslip.netSalary)),
      ),

      // Footer
      createElement(View, { style: styles.footer },
        createElement(Text, { style: styles.footerText }, "OneEvolve.AI · practice-os.ai"),
        createElement(Text, { style: styles.footerText }, "This is a computer-generated payslip."),
        createElement(Text, { style: styles.footerText }, period),
      ),
    )
  );
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payslip = await prisma.payslip.findUnique({
    where: { id },
    include: { employee: { select: { name: true, designation: true, pfNumber: true, esiNumber: true, department: { select: { name: true } } } } },
  });
  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // @ts-ignore
  const buffer = await renderToBuffer(createElement(PayslipPDF, { payslip }) as any);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="payslip-${payslip.employee.name}-${MONTHS[payslip.month-1]}-${payslip.year}.pdf"`,
    },
  });
}
