import { NextResponse } from "next/server";

export async function GET() {
  const csv = [
    "name,code,description",
    "Architecture,ARC,Architecture and design team",
    "MEP Engineering,MEP,Mechanical electrical and plumbing",
    "BIM,BIM,Building information modelling",
    "Administration,ADMIN,Admin and operations",
  ].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=departments-template.csv",
    },
  });
}
