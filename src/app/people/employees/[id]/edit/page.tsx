"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

const PROJECT_ROLES = [
  { value: "ARCHITECT", label: "Architect" }, { value: "ENGINEER", label: "Engineer" },
  { value: "CONSULTANT", label: "Consultant" }, { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "DESIGNER", label: "Designer" }, { value: "OTHER", label: "Other" },
];
const EXIT_TYPES = [
  { value: "", label: "N/A" }, { value: "RESIGNATION", label: "Resignation" },
  { value: "TERMINATION", label: "Termination" }, { value: "RETIREMENT", label: "Retirement" },
  { value: "CONTRACT_END", label: "Contract End" }, { value: "OTHER", label: "Other" },
];

const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4"><h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">{title}</h3>{children}</div>;
}
function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <div><label className="block text-sm font-medium text-zinc-700 mb-1">{label}{required && " *"}</label>{children}</div>;
}

interface Employee {
  [key: string]: unknown;
  id: string; name: string; email: string; personalEmail: string | null;
  phone: string | null; personalMobile: string | null; linkedin: string | null;
  designation: string | null; roleDescription: string | null;
  departmentId: string | null; reportingOffice: string | null;
  reportingManagerId: string | null; reportingManager: string | null; hrLead: string | null;
  joiningDate: string | null; dateOfBirth: string | null; resignationDate: string | null;
  status: string; exitType: string | null;
  yearsOfExperience: number | null; highestQualification: string | null;
  previousOrganisations: string | null; orientation: string | null;
  projectRole: string; scopeExpertise: string | null;
  projectTypeExpertise: string | null; scopeStageExpertise: string | null;
  licenseNumbers: string | null; isPE: boolean; isRA: boolean;
  address: string | null; salaryBand: string | null;
  emergencyContact: string | null; emergencyPhone: string | null;
  aadharNumber: string | null; passportNumber: string | null;
}

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch(`/api/employees/${id}`).then((r) => r.json()).then(setEmp);
    fetch("/api/departments").then((r) => r.json()).then(setDepartments).catch(() => {});
    fetch("/api/employees").then((r) => r.json()).then(setEmployees).catch(() => {});
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get("name"), email: f.get("email"), personalEmail: f.get("personalEmail") || "",
      phone: f.get("phone") || "", personalMobile: f.get("personalMobile") || "",
      linkedin: f.get("linkedin") || "", designation: f.get("designation") || "",
      roleDescription: f.get("roleDescription") || "",
      departmentId: f.get("departmentId") || "", reportingOffice: f.get("reportingOffice") || "",
      reportingManagerId: f.get("reportingManagerId") || "",
      reportingManager: f.get("reportingManager") || "", hrLead: f.get("hrLead") || "",
      joiningDate: f.get("joiningDate") || "", dateOfBirth: f.get("dateOfBirth") || "",
      resignationDate: f.get("resignationDate") || "",
      status: f.get("status"), exitType: f.get("exitType") || "",
      yearsOfExperience: f.get("yearsOfExperience") || "",
      highestQualification: f.get("highestQualification") || "",
      previousOrganisations: f.get("previousOrganisations") || "",
      orientation: f.get("orientation") || "",
      projectRole: f.get("projectRole"),
      scopeExpertise: f.get("scopeExpertise") || "",
      projectTypeExpertise: f.get("projectTypeExpertise") || "",
      scopeStageExpertise: f.get("scopeStageExpertise") || "",
      licenseNumbers: f.get("licenseNumbers") || "",
      isPE: f.get("isPE") === "on", isRA: f.get("isRA") === "on",
      address: f.get("address") || "", salaryBand: f.get("salaryBand") || "",
      emergencyContact: f.get("emergencyContact") || "", emergencyPhone: f.get("emergencyPhone") || "",
      aadharNumber: f.get("aadharNumber") || "", passportNumber: f.get("passportNumber") || "",
    };
    const res = await fetch(`/api/employees/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) router.push(`/people/employees/${id}`);
    else { setSaving(false); alert("Failed to update"); }
  }

  if (!emp) return <div className="p-8 text-zinc-400">Loading...</div>;

  const d = (field: string) => {
    const v = emp[field];
    if (typeof v === "string" && v.includes("T")) return v.slice(0, 10);
    return (v as string) || "";
  };

  return (
    <div className="p-8 max-w-3xl">
      <PeopleSubNav />
      <Link href={`/people/employees/${id}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"><ArrowLeft className="w-4 h-4" /> Back to Details</Link>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Edit Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Official Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" required><input name="name" required defaultValue={emp.name} className={ic} /></Field>
            <Field label="Official Email" required><input name="email" type="email" required defaultValue={emp.email} className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Designation"><input name="designation" defaultValue={emp.designation || ""} className={ic} /></Field>
            <Field label="Department"><select name="departmentId" defaultValue={emp.departmentId || ""} className={ic}><option value="">Select...</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mobile No (Work)"><input name="phone" defaultValue={emp.phone || ""} className={ic} /></Field>
            <Field label="LinkedIn"><input name="linkedin" defaultValue={emp.linkedin || ""} className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Reporting Office"><input name="reportingOffice" defaultValue={emp.reportingOffice || ""} className={ic} /></Field>
            <Field label="Reporting Manager"><select name="reportingManagerId" defaultValue={emp.reportingManagerId || ""} className={ic}><option value="">Select...</option>{employees.filter((e) => e.id !== emp.id).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="HR Lead"><input name="hrLead" defaultValue={emp.hrLead || ""} className={ic} /></Field>
            <Field label="Employee Status"><select name="status" defaultValue={emp.status} className={ic}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field>
          </div>
          <Field label="Role Description"><textarea name="roleDescription" rows={2} defaultValue={emp.roleDescription || ""} className={ic} /></Field>
        </Section>

        <Section title="Dates">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Joining Date"><input name="joiningDate" type="date" defaultValue={d("joiningDate")} className={ic} /></Field>
            <Field label="Date of Birth"><input name="dateOfBirth" type="date" defaultValue={d("dateOfBirth")} className={ic} /></Field>
            <Field label="Resignation Date"><input name="resignationDate" type="date" defaultValue={d("resignationDate")} className={ic} /></Field>
          </div>
          <Field label="Exit Type"><select name="exitType" defaultValue={emp.exitType || ""} className={ic}>{EXIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></Field>
        </Section>

        <Section title="Experience & Education">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Years of Experience"><input name="yearsOfExperience" type="number" step="0.5" defaultValue={emp.yearsOfExperience || ""} className={ic} /></Field>
            <Field label="Highest Qualification"><input name="highestQualification" defaultValue={emp.highestQualification || ""} className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Orientation"><input name="orientation" defaultValue={emp.orientation || ""} className={ic} /></Field>
            <Field label="Previous Organisations"><textarea name="previousOrganisations" rows={2} defaultValue={emp.previousOrganisations || ""} className={ic} /></Field>
          </div>
        </Section>

        <Section title="AEC Profile & Expertise">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Role"><select name="projectRole" defaultValue={emp.projectRole} className={ic}>{PROJECT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></Field>
            <Field label="License Numbers"><input name="licenseNumbers" defaultValue={emp.licenseNumbers || ""} className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Scope Expertise"><input name="scopeExpertise" defaultValue={emp.scopeExpertise || ""} className={ic} /></Field>
            <Field label="Project Type Expertise"><input name="projectTypeExpertise" defaultValue={emp.projectTypeExpertise || ""} className={ic} /></Field>
          </div>
          <Field label="Scope Stage Expertise"><input name="scopeStageExpertise" defaultValue={emp.scopeStageExpertise || ""} className={ic} /></Field>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-zinc-700"><input name="isPE" type="checkbox" defaultChecked={emp.isPE} className="rounded border-zinc-300" /> Professional Engineer (PE)</label>
            <label className="flex items-center gap-2 text-sm text-zinc-700"><input name="isRA" type="checkbox" defaultChecked={emp.isRA} className="rounded border-zinc-300" /> Registered Architect (RA)</label>
          </div>
        </Section>

        <Section title="Personal Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Personal Mobile"><input name="personalMobile" defaultValue={emp.personalMobile || ""} className={ic} /></Field>
            <Field label="Personal Email"><input name="personalEmail" type="email" defaultValue={emp.personalEmail || ""} className={ic} /></Field>
          </div>
          <Field label="Residential Address"><textarea name="address" rows={2} defaultValue={emp.address || ""} className={ic} /></Field>
        </Section>

        <Section title="ID Documents">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Aadhar Number"><input name="aadharNumber" defaultValue={emp.aadharNumber || ""} className={ic} /></Field>
            <Field label="Passport Number"><input name="passportNumber" defaultValue={emp.passportNumber || ""} className={ic} /></Field>
          </div>
        </Section>

        <Section title="HR Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Salary Band"><input name="salaryBand" defaultValue={emp.salaryBand || ""} className={ic} /></Field>
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Emergency Contact"><input name="emergencyContact" defaultValue={emp.emergencyContact || ""} className={ic} /></Field>
            <Field label="Emergency Phone"><input name="emergencyPhone" defaultValue={emp.emergencyPhone || ""} className={ic} /></Field>
          </div>
        </Section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          <Link href={`/people/employees/${id}`} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
