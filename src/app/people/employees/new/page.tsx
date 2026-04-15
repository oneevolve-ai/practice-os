"use client";
import { BackButton } from "@/components/back-button";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">{label}{required && " *"}</label>
      {children}
    </div>
  );
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/departments").then((r) => r.json()).then(setDepartments).catch(() => {});
    fetch("/api/employees").then((r) => r.json()).then(setEmployees).catch(() => {});
  }, []);

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
      status: f.get("status") || "ACTIVE", exitType: f.get("exitType") || "",
      yearsOfExperience: f.get("yearsOfExperience") || "",
      highestQualification: f.get("highestQualification") || "",
      previousOrganisations: f.get("previousOrganisations") || "",
      orientation: f.get("orientation") || "",
      projectRole: f.get("projectRole") || "OTHER",
      scopeExpertise: f.get("scopeExpertise") || "",
      projectTypeExpertise: f.get("projectTypeExpertise") || "",
      scopeStageExpertise: f.get("scopeStageExpertise") || "",
      licenseNumbers: f.get("licenseNumbers") || "",
      isPE: f.get("isPE") === "on", isRA: f.get("isRA") === "on",
      address: f.get("address") || "", salaryBand: f.get("salaryBand") || "",
      emergencyContact: f.get("emergencyContact") || "", emergencyPhone: f.get("emergencyPhone") || "",
      aadharNumber: f.get("aadharNumber") || "", passportNumber: f.get("passportNumber") || "",
    };

    const res = await fetch("/api/employees", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) router.push("/people/employees");
    else { setSaving(false); alert("Failed to create employee"); }
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/people/employees" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Add Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Official Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" required><input name="name" required placeholder="Full name" className={ic} /></Field>
            <Field label="Official Email" required><input name="email" type="email" required placeholder="email@oneevolve.ai" className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Designation"><input name="designation" placeholder="e.g. Senior Architect" className={ic} /></Field>
            <Field label="Department">
              <select name="departmentId" className={ic}><option value="">Select...</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mobile No (Work)"><input name="phone" placeholder="+91..." className={ic} /></Field>
            <Field label="LinkedIn"><input name="linkedin" placeholder="https://linkedin.com/in/..." className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Reporting Office"><select name="reportingOffice" className={ic}><option value="">Select Office</option><option value="Bengaluru">Bengaluru</option><option value="Mumbai">Mumbai</option><option value="Pune">Pune</option><option value="Bhubaneswar">Bhubaneswar</option></select></Field>
            <Field label="Reporting Manager">
              <select name="reportingManagerId" className={ic}><option value="">Select...</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="HR Lead"><input name="hrLead" placeholder="HR Lead name" className={ic} /></Field>
            <Field label="Employee Status">
              <select name="status" className={ic}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
            </Field>
          </div>
          <Field label="Role Description"><textarea name="roleDescription" rows={2} placeholder="Brief description of role & responsibilities" className={ic} /></Field>
        </Section>

        <Section title="Dates">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Joining Date"><input name="joiningDate" type="date" className={ic} /></Field>
            <Field label="Date of Birth"><input name="dateOfBirth" type="date" className={ic} /></Field>
            <Field label="Resignation Date"><input name="resignationDate" type="date" className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Exit Type">
              <select name="exitType" className={ic}>{EXIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
            </Field>
          </div>
        </Section>

        <Section title="Experience & Education">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Years of Experience"><input name="yearsOfExperience" type="number" step="0.5" min="0" placeholder="e.g. 8.5" className={ic} /></Field>
            <Field label="Highest Qualification"><input name="highestQualification" placeholder="e.g. M.Arch, B.Tech" className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Orientation"><input name="orientation" placeholder="e.g. Design, Technical, Management" className={ic} /></Field>
            <Field label="Previous Organisations"><textarea name="previousOrganisations" rows={2} placeholder="Previous companies (one per line)" className={ic} /></Field>
          </div>
        </Section>

        <Section title="AEC Profile & Expertise">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Role">
              <select name="projectRole" className={ic}>{PROJECT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
            </Field>
            <Field label="License Numbers"><input name="licenseNumbers" placeholder="e.g. PE-12345" className={ic} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Scope Expertise"><input name="scopeExpertise" placeholder="e.g. Structural, MEP, Facade" className={ic} /></Field>
            <Field label="Project Type Expertise"><input name="projectTypeExpertise" placeholder="e.g. Commercial, Residential, Healthcare" className={ic} /></Field>
          </div>
          <Field label="Scope Stage Expertise"><input name="scopeStageExpertise" placeholder="e.g. Concept, DD, CD, CA" className={ic} /></Field>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-zinc-700"><input name="isPE" type="checkbox" className="rounded border-zinc-300" /> Professional Engineer (PE)</label>
            <label className="flex items-center gap-2 text-sm text-zinc-700"><input name="isRA" type="checkbox" className="rounded border-zinc-300" /> Registered Architect (RA)</label>
          </div>
        </Section>

        <Section title="Personal Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Personal Mobile"><input name="personalMobile" placeholder="+91..." className={ic} /></Field>
            <Field label="Personal Email"><input name="personalEmail" type="email" placeholder="personal@email.com" className={ic} /></Field>
          </div>
          <Field label="Residential Address"><textarea name="address" rows={2} placeholder="Full residential address" className={ic} /></Field>
        </Section>

        <Section title="ID Documents">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Aadhar Number"><input name="aadharNumber" placeholder="XXXX XXXX XXXX" className={ic} /></Field>
            <Field label="Passport Number"><input name="passportNumber" placeholder="Passport number" className={ic} /></Field>
          </div>
        </Section>

        <Section title="HR Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Salary Band"><input name="salaryBand" placeholder="e.g. L5, Band A" className={ic} /></Field>
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Emergency Contact"><input name="emergencyContact" placeholder="Contact name" className={ic} /></Field>
            <Field label="Emergency Phone"><input name="emergencyPhone" placeholder="+91..." className={ic} /></Field>
          </div>
        </Section>

        <p className="text-xs text-zinc-400">Documents (CV, Experience Docs, Educational Docs, Exit Docs) can be uploaded after creating the employee from the detail page.</p>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "Creating..." : "Create Employee"}</button>
          <Link href="/people/employees" className="px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
