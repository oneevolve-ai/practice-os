import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 30, borderBottom: "2px solid #18181b", paddingBottom: 20 },
  company: { fontSize: 20, fontWeight: "bold", color: "#18181b", marginBottom: 4 },
  tagline: { fontSize: 9, color: "#71717a", letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: "bold", color: "#18181b", marginBottom: 6 },
  subtitle: { fontSize: 11, color: "#52525b", marginBottom: 30 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 10, fontWeight: "bold", color: "#71717a", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, borderBottom: "1px solid #e4e4e7", paddingBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 10, color: "#71717a" },
  value: { fontSize: 10, color: "#18181b", fontWeight: "bold" },
  statusBadge: { fontSize: 9, color: "#16a34a", backgroundColor: "#f0fdf4", padding: "3 8", borderRadius: 4 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTop: "1px solid #e4e4e7", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#a1a1aa" },
  valueBox: { backgroundColor: "#f4f4f5", padding: 16, borderRadius: 6, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  valueLabel: { fontSize: 10, color: "#71717a" },
  valueBig: { fontSize: 24, fontWeight: "bold", color: "#18181b" },
});

function ProposalPDF({ proposal, client }: { proposal: any; client: any }) {
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  return createElement(Document, {},
    createElement(Page, { size: "A4", style: styles.page },
      // Header
      createElement(View, { style: styles.header },
        createElement(Text, { style: styles.company }, "OneEvolve.AI"),
        createElement(Text, { style: styles.tagline }, "SPATIAL INTELLIGENCE PLATFORM"),
      ),
      // Title
      createElement(Text, { style: styles.title }, proposal.title),
      createElement(Text, { style: styles.subtitle }, `Prepared for ${client.name} · ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`),

      // Value Box
      proposal.value && createElement(View, { style: styles.valueBox },
        createElement(View, {},
          createElement(Text, { style: styles.valueLabel }, "Proposed Value"),
          createElement(Text, { style: styles.valueBig }, fmt(proposal.value)),
        ),
        createElement(Text, { style: styles.statusBadge }, proposal.status),
      ),

      // Proposal Details
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Proposal Details"),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Proposal ID"),
          createElement(Text, { style: styles.value }, proposal.id.slice(0, 8).toUpperCase()),
        ),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Status"),
          createElement(Text, { style: styles.value }, proposal.status),
        ),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Created"),
          createElement(Text, { style: styles.value }, new Date(proposal.createdAt).toLocaleDateString("en-IN")),
        ),
        proposal.sentDate && createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Sent Date"),
          createElement(Text, { style: styles.value }, new Date(proposal.sentDate).toLocaleDateString("en-IN")),
        ),
      ),

      // Client Details
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Client Details"),
        createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Organisation"),
          createElement(Text, { style: styles.value }, client.name),
        ),
        client.industry && createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Industry"),
          createElement(Text, { style: styles.value }, client.industry),
        ),
        client.headquarters && createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "Headquarters"),
          createElement(Text, { style: styles.value }, client.headquarters),
        ),
        client.gstin && createElement(View, { style: styles.row },
          createElement(Text, { style: styles.label }, "GST Number"),
          createElement(Text, { style: styles.value }, client.gstin),
        ),
      ),

      // Footer
      createElement(View, { style: styles.footer },
        createElement(Text, { style: styles.footerText }, "OneEvolve.AI · oneevolve.in"),
        createElement(Text, { style: styles.footerText }, `Generated ${new Date().toLocaleDateString("en-IN")}`),
      ),
    )
  );
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await prisma.clientProposal.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await renderToBuffer(createElement(ProposalPDF, { proposal, client: proposal.client }));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="proposal-${proposal.id.slice(0,8)}.pdf"`,
    },
  });
}
