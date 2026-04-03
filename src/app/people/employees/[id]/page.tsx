"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Upload, Download, Paperclip, X } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

interface Doc { id: string; docType: string; fileName: string; filePath: string; fileSize: number; uploadedAt: string; }
interface Reportee { id: string; name: string; designation: string | null; }
interface Employee {
  id: string; name: string; photo: string | null; email: string; personalEmail: string | null;
  phone: string | null; personalMobile: string | null; linkedin: string | null;
  designation: string | null; roleDescription: string | null;
  department: { name: string } | null; reportingOffice: string | null;
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
  createdAt: string; documents: Doc[]; directReportees: Reportee[];
}

const statusColors: Record<string, string> = { ACTIVE: "bg-green-100 text-green-700", INACTIVE: "bg-zinc-200 text-zinc-500" };
const roleLabels: Record<string, string> = { ARCHITECT: "Architect", ENGINEER: "Engineer", CONSULTANT: "Consultant", PROJECT_MANAGER: "Project Manager", DESIGNER: "Designer", OTHER: "Other" };
const docTypeLabels: Record<string, string> = { PHOTO: "Photo", CV: "CV", EXPERIENCE_DOC: "Experience Doc", EDUCATIONAL_DOC: "Educational Doc", EXIT_DOC: "Exit Doc", ID_DOC: "ID Doc", OTHER: "Other" };
const DOC_TYPES = ["CV", "EXPERIENCE_DOC", "EDUCATIONAL_DOC", "EXIT_DOC", "ID_DOC", "OTHER"];

function F({ label, value }: { label: string; value: string | number | null | undefined }) {
  return <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">{label}</p><p className="text-zinc-900 text-sm">{value || "—"}</p></div>;
}

function formatSize(b: number) { return b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`; }

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("CV");

  const fetchEmp = useCallback(() => {
    fetch(`/api/employees/${id}`).then((r) => r.json()).then(setEmp).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchEmp(); }, [fetchEmp]);

  async function handleDelete() {
    if (!confirm("Delete this employee?")) return;
    if (await fetch(`/api/employees/${id}`, { method: "DELETE" }).then((r) => r.ok)) router.push("/people/employees");
  }

  async function handleDocUpload(files: FileList | null) {
    if (!files || !files[0]) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", files[0]);
    fd.append("docType", uploadType);
    await fetch(`/api/employees/${id}/documents`, { method: "POST", body: fd });
    setUploading(false);
    fetchEmp();
  }

  async function handleDocDelete(docId: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/employees/${id}/documents/${docId}`, { method: "DELETE" });
    fetchEmp();
  }

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;
  if (!emp) return <div className="p-8 text-red-500">Employee not found</div>;

  const age = emp.dateOfBirth ? differenceInYears(new Date(), new Date(emp.dateOfBirth)) : null;
  const ageGroup = age ? (age < 25 ? "< 25" : age < 35 ? "25-34" : age < 45 ? "35-44" : age < 55 ? "45-54" : "55+") : null;

  return (
    <div className="p-8 max-w-3xl">
      <PeopleSubNav />
      <Link href="/people/employees" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"><ArrowLeft className="w-4 h-4" /> Back to Employees</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{emp.name}</h1>
          <p className="text-zinc-500 mt-1">{emp.designation || "No designation"} {emp.department ? `· ${emp.department.name}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/people/employees/${id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-600 hover:bg-zinc-50"><Pencil className="w-3.5 h-3.5" /> Edit</Link>
          <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
        </div>
      </div>

      {/* Official */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${statusColors[emp.status]}`}>{emp.status}</span>
          <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">{roleLabels[emp.projectRole]}</span>
          {emp.isPE && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">PE</span>}
          {emp.isRA && <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">RA</span>}
        </div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <F label="Official Email" value={emp.email} />
          <F label="Mobile (Work)" value={emp.phone} />
          <F label="Reporting Office" value={emp.reportingOffice} />
          <F label="Reporting Manager" value={emp.reportingManager} />
          <F label="HR Lead" value={emp.hrLead} />
          <F label="LinkedIn" value={emp.linkedin} />
        </div>
        {emp.roleDescription && <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Role Description</p><p className="text-zinc-700 text-sm">{emp.roleDescription}</p></div>}
      </div>

      {/* Dates */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
        <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">Dates</h3>
        <div className="grid grid-cols-3 gap-y-4 gap-x-8 text-sm">
          <F label="Joining Date" value={emp.joiningDate ? format(new Date(emp.joiningDate), "MMM d, yyyy") : null} />
          <F label="Date of Birth" value={emp.dateOfBirth ? format(new Date(emp.dateOfBirth), "MMM d, yyyy") : null} />
          <F label="Age" value={age ? `${age} yrs (${ageGroup})` : null} />
          <F label="Resignation Date" value={emp.resignationDate ? format(new Date(emp.resignationDate), "MMM d, yyyy") : null} />
          <F label="Exit Type" value={emp.exitType} />
        </div>
      </div>

      {/* Experience & Education */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
        <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">Experience & Education</h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <F label="Years of Experience" value={emp.yearsOfExperience} />
          <F label="Highest Qualification" value={emp.highestQualification} />
          <F label="Orientation" value={emp.orientation} />
          <F label="Previous Organisations" value={emp.previousOrganisations} />
        </div>
      </div>

      {/* AEC Profile */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
        <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">AEC Profile & Expertise</h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <F label="Project Role" value={roleLabels[emp.projectRole]} />
          <F label="Scope Expertise" value={emp.scopeExpertise} />
          <F label="Project Type Expertise" value={emp.projectTypeExpertise} />
          <F label="Scope Stage Expertise" value={emp.scopeStageExpertise} />
          <F label="License Numbers" value={emp.licenseNumbers} />
          <F label="PE / RA" value={`PE: ${emp.isPE ? "Yes" : "No"} · RA: ${emp.isRA ? "Yes" : "No"}`} />
        </div>
      </div>

      {/* Personal */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
        <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">Personal Information</h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <F label="Personal Mobile" value={emp.personalMobile} />
          <F label="Personal Email" value={emp.personalEmail} />
          <F label="Residential Address" value={emp.address} />
          <F label="Aadhar Number" value={emp.aadharNumber} />
          <F label="Passport Number" value={emp.passportNumber} />
          <F label="Salary Band" value={emp.salaryBand} />
          <F label="Emergency Contact" value={emp.emergencyContact} />
          <F label="Emergency Phone" value={emp.emergencyPhone} />
        </div>
      </div>

      {/* Reportees */}
      {emp.directReportees && emp.directReportees.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
          <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">Direct Reportees ({emp.directReportees.length})</h3>
          <div className="space-y-2">
            {emp.directReportees.map((r) => (
              <Link key={r.id} href={`/people/employees/${r.id}`} className="block bg-zinc-50 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100">
                <span className="font-medium text-zinc-900">{r.name}</span>
                {r.designation && <span className="text-zinc-400 ml-2">· {r.designation}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
        <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">Documents</h3>

        {emp.documents && emp.documents.length > 0 && (
          <div className="space-y-2 mb-4">
            {emp.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 bg-zinc-50 rounded-lg px-3 py-2">
                <Paperclip className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-800 truncate">{doc.fileName}</p>
                  <p className="text-xs text-zinc-400">{docTypeLabels[doc.docType]} · {formatSize(doc.fileSize)}</p>
                </div>
                <a href={doc.filePath} download={doc.fileName} className="p-1 text-zinc-400 hover:text-zinc-600"><Download className="w-4 h-4" /></a>
                <button onClick={() => handleDocDelete(doc.id)} className="p-1 text-zinc-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className="border border-zinc-300 rounded-lg px-2 py-1.5 text-xs">
            {DOC_TYPES.map((t) => <option key={t} value={t}>{docTypeLabels[t]}</option>)}
          </select>
          <label className="inline-flex items-center gap-2 cursor-pointer border-2 border-dashed border-zinc-300 rounded-lg px-4 py-2 text-sm text-zinc-500 hover:border-zinc-400">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Document"}
            <input type="file" className="hidden" onChange={(e) => handleDocUpload(e.target.files)} />
          </label>
        </div>
      </div>
    </div>
  );
}
