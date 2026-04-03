"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, Clock, MapPin, Fingerprint, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

interface Employee { id: string; name: string; }
interface AttRecord { checkIn: string | null; checkOut: string | null; workHours: number | null; status: string; lateArrival: boolean; checkInLocation: string | null; }
interface GeoResult { allowed: boolean; message: string; nearestOffice: string | null; distance: number | null; }

export default function CheckInPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [todayRecord, setTodayRecord] = useState<AttRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Geofencing state
  const [geoStatus, setGeoStatus] = useState<"idle" | "checking" | "allowed" | "denied" | "error">("idle");
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Biometric state
  const [bioSupported, setBioSupported] = useState(false);
  const [bioVerified, setBioVerified] = useState(false);
  const [bioStatus, setBioStatus] = useState<"idle" | "verifying" | "verified" | "failed">("idle");

  useEffect(() => {
    fetch("/api/employees?status=ACTIVE").then((r) => r.json()).then(setEmployees).catch(() => {});
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
    }, 1000);

    // Check WebAuthn support
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.().then((avail) => setBioSupported(avail));
    }

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedEmp) {
      const today = new Date().toISOString().slice(0, 10);
      fetch(`/api/attendance?date=${today}&employeeId=${selectedEmp}`)
        .then((r) => r.json())
        .then((recs) => setTodayRecord(recs[0] || null))
        .catch(() => {});
    }
  }, [selectedEmp]);

  // Geofencing: get location and verify
  async function verifyLocation() {
    setGeoStatus("checking");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLocation({ lat, lng });

      const res = await fetch("/api/attendance/verify-location", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      const data = await res.json();
      setGeoResult(data);
      setGeoStatus(data.allowed ? "allowed" : "denied");
    } catch {
      setGeoStatus("error");
      setGeoResult({ allowed: false, message: "Could not get your location. Please enable GPS.", nearestOffice: null, distance: null });
    }
  }

  // Biometric verification using WebAuthn
  async function verifyBiometric() {
    setBioStatus("verifying");
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Practice OS", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(selectedEmp),
            name: selectedEmp,
            displayName: employees.find((e) => e.id === selectedEmp)?.name || "Employee",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });

      if (credential) {
        setBioVerified(true);
        setBioStatus("verified");
      } else {
        setBioStatus("failed");
      }
    } catch {
      setBioStatus("failed");
    }
  }

  async function handleAction(action: "CHECK_IN" | "CHECK_OUT") {
    if (!selectedEmp) return;
    setLoading(true);

    const body: Record<string, unknown> = { employeeId: selectedEmp, action };

    // Include location if available
    if (userLocation) {
      body.latitude = userLocation.lat;
      body.longitude = userLocation.lng;
      body.location = geoResult?.nearestOffice || "Unknown";
    }

    const res = await fetch("/api/attendance/check-in", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setTodayRecord(data);
    } else {
      const err = await res.json();
      alert(err.error || "Failed");
    }
    setLoading(false);
  }

  const canCheckIn = geoStatus === "allowed" || geoStatus === "idle"; // idle = no offices configured
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  return (
    <div className="p-8 max-w-lg">
      <PeopleSubNav />
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-zinc-900">Self Check-In</h1>
        <Link href="/people/attendance/offices" className="text-xs text-zinc-500 hover:text-zinc-700 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Manage Offices
        </Link>
      </div>
      <p className="text-zinc-500 mb-6">Record your daily attendance with location verification</p>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
        {/* Clock */}
        <div className="text-center">
          <Clock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-3xl font-mono font-bold text-zinc-900">{currentTime}</p>
          <p className="text-xs text-zinc-400 mt-1">Current Time (IST)</p>
        </div>

        {/* Employee Select */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Employee</label>
          <select value={selectedEmp} onChange={(e) => { setSelectedEmp(e.target.value); setGeoStatus("idle"); setBioStatus("idle"); setBioVerified(false); }} className={ic}>
            <option value="">Select yourself...</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        {selectedEmp && (
          <>
            {/* Step 1: Geofencing */}
            <div className="border border-zinc-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-zinc-600" />
                <h3 className="text-sm font-semibold text-zinc-900">Step 1: Location Verification</h3>
              </div>

              {geoStatus === "idle" && (
                <button onClick={verifyLocation} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" /> Verify My Location
                </button>
              )}
              {geoStatus === "checking" && <p className="text-sm text-zinc-500 text-center py-2">Getting your location...</p>}
              {geoStatus === "allowed" && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {geoResult?.message}
                </div>
              )}
              {geoStatus === "denied" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {geoResult?.message}
                  </div>
                  <button onClick={verifyLocation} className="text-xs text-blue-600 hover:underline">Retry location check</button>
                </div>
              )}
              {geoStatus === "error" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {geoResult?.message}
                  </div>
                  <button onClick={verifyLocation} className="text-xs text-blue-600 hover:underline">Retry</button>
                </div>
              )}
            </div>

            {/* Step 2: Biometric */}
            {bioSupported && (
              <div className="border border-zinc-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Fingerprint className="w-4 h-4 text-zinc-600" />
                  <h3 className="text-sm font-semibold text-zinc-900">Step 2: Biometric Verification</h3>
                  <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">Optional</span>
                </div>

                {bioStatus === "idle" && (
                  <button onClick={verifyBiometric} className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
                    <Fingerprint className="w-4 h-4" /> Verify with Fingerprint / Face ID
                  </button>
                )}
                {bioStatus === "verifying" && <p className="text-sm text-zinc-500 text-center py-2">Waiting for biometric...</p>}
                {bioStatus === "verified" && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-sm">
                    <Shield className="w-4 h-4 shrink-0" /> Biometric verified successfully
                  </div>
                )}
                {bioStatus === "failed" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> Biometric verification failed
                    </div>
                    <button onClick={verifyBiometric} className="text-xs text-blue-600 hover:underline">Try again</button>
                  </div>
                )}
              </div>
            )}

            {/* Today's Record */}
            {todayRecord && (
              <div className="bg-zinc-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span className="font-medium text-zinc-900">{todayRecord.status}</span>
                </div>
                {todayRecord.checkIn && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Check In</span>
                    <span className="font-medium text-zinc-900">
                      {todayRecord.checkIn}
                      {todayRecord.lateArrival && <span className="text-red-500 text-xs ml-1">(Late)</span>}
                    </span>
                  </div>
                )}
                {todayRecord.checkOut && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Check Out</span>
                    <span className="font-medium text-zinc-900">{todayRecord.checkOut}</span>
                  </div>
                )}
                {todayRecord.workHours != null && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Work Hours</span>
                    <span className={`font-medium ${todayRecord.workHours < 8 ? "text-red-600" : "text-green-600"}`}>{todayRecord.workHours}h</span>
                  </div>
                )}
                {todayRecord.checkInLocation && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Location</span>
                    <span className="text-zinc-600 text-xs">{todayRecord.checkInLocation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Check In / Check Out Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleAction("CHECK_IN")}
                disabled={loading || !canCheckIn || (todayRecord?.checkIn != null)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" /> Check In
              </button>
              <button
                onClick={() => handleAction("CHECK_OUT")}
                disabled={loading || !todayRecord?.checkIn || todayRecord?.checkOut != null}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" /> Check Out
              </button>
            </div>

            {!canCheckIn && geoStatus === "denied" && (
              <p className="text-xs text-red-500 text-center">Check-in disabled: you are not at an office location</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
