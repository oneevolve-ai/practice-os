import { NextResponse } from "next/server";

export async function GET() {
  const headers = ["name","uin","industry","businessType","businessScale","engagementLevel","established","accountManager","website","linkedIn","instagram","email","phone","headquarters","officesInCities","gstin","pan","notes"];
  const sample = ["Tata Projects Ltd","","Infrastructure","Pvt Ltd","Enterprise","Hot","1868","AKG","https://tataprojects.com","","","info@tataprojects.com","","Mumbai","Mumbai; Delhi; Bengaluru","27AABCT0215H1ZO","","Large infrastructure company"];
  const csv = [headers.join(","), sample.join(",")].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=organisations-template.csv",
    },
  });
}
