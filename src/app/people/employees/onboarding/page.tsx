"use client";
import { BackButton } from "@/components/back-button";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";

interface Employee { id: string; name: string; designation: string | null; joiningDate: string | null; department: { name: string } | null; }

const CHECKLIST = [
  { category: "Documents", items: ["Offer letter signed", "Appointment letter issued", "Aadhar card copy collected", "PAN card copy collected", "Passport copy collected (if applicable)", "Educational certificates verified", "Previous employment documents collected"] },
  { category: "IT Setup", items: ["Laptop/Desktop assigned", "Email ID created", "Software licenses assigned", "VPN access configured", "Project tools access given (GitHub/Jira/etc)"] },
  { category: "HR & Payroll", items: ["Employee added to HRMS", "Bank account details collected", "PF account created", "ESI registration done", "Salary structure finalized", "Attendance system access given"] },
  { category: "Induction", items: ["Company introduction done", "Team introduction done", "Office tour completed", "HR policies explained", "Leave policy explained", "Code of conduct signed"] },
  { category: "Role Setup", items: ["Reporting manager assigned", "KRAs defined", "First week plan shared", "Access to relevant projects given", "Buddy/mentor assigned"] },
];

export default function OnboardingPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ Documents: true });

  useEffect(() => {
    fetch("/api/employees?status=ACTIVE").then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    if (selected) {
      const saved = localStorage.getItem(`onboarding_${selected}`);
      setChecked(saved ? JSON.parse(saved) : {});
    }
  }, [selected]);

  function toggle(item: string) {
    const newChecked = { ...checked, [item]: !checked[item] };
    setChecked(newChecked);
    if (selected) localStorage.setItem(`onboarding_${selected}`, JSON.stringify(newChecked));
  }

  const totalItems = CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const completedItems = Object.values(checked).filter(Boolean).length;
  const percent = Math.round((completedItems / totalItems) * 100);

  const emp = employees.find(e => e.id === selected);

  return (
    <div className="p-8">
      <BackButton href="/people" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Employee Onboarding</h1>
        <p className="text-zinc-500 text-sm">Track onboarding checklist for new joiners</p>
      </div>

      {/* Employee Selector */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
        <label className="block text-sm font-medium text-zinc-700 mb-2">Select Employee</label>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400">
          <option value="">Select a new joiner...</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>
              {e.name} {e.joiningDate ? `— Joined ${new Date(e.joiningDate).toLocaleDateString("en-IN")}` : ""} {e.department ? `(${e.department.name})` : ""}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          {/* Progress */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-zinc-900">{emp?.name}</p>
                <p className="text-sm text-zinc-500">{emp?.designation || "—"} · {emp?.department?.name || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-zinc-900">{percent}%</p>
                <p className="text-xs text-zinc-500">{completedItems} of {totalItems} done</p>
              </div>
            </div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${percent === 100 ? "bg-green-500" : percent >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                style={{ width: `${percent}%` }} />
            </div>
            {percent === 100 && (
              <p className="text-green-600 text-sm font-medium mt-2">✅ Onboarding complete!</p>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            {CHECKLIST.map(cat => {
              const catDone = cat.items.filter(i => checked[i]).length;
              const isExpanded = expanded[cat.category] !== false;
              return (
                <div key={cat.category} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <button onClick={() => setExpanded({...expanded, [cat.category]: !isExpanded})}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-zinc-900">{cat.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catDone === cat.items.length ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {catDone}/{cat.items.length}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-zinc-100 divide-y divide-zinc-50">
                      {cat.items.map(item => (
                        <button key={item} onClick={() => toggle(item)}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 text-left">
                          {checked[item]
                            ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            : <Circle className="w-5 h-5 text-zinc-300 shrink-0" />}
                          <span className={`text-sm ${checked[item] ? "line-through text-zinc-400" : "text-zinc-700"}`}>{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
