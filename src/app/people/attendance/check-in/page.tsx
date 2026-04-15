"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Camera, CheckCircle, XCircle } from "lucide-react";

interface Employee { id: string; name: string; }
interface AttRecord { checkIn: string | null; checkOut: string | null; workHours: number | null; status: string; lateArrival: boolean; checkInLocation: string | null; }
interface GeoResult { allowed: boolean; message: string; nearestOffice: string | null; distance: number | null; }

export default function CheckInPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [todayRecord, setTodayRecord] = useState<AttRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Camera/Selfie state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");

  // Geofencing state
  const [geoStatus, setGeoStatus] = useState<"idle" | "checking" | "allowed" | "denied" | "error">("idle");
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetch("/api/employees?status=ACTIVE").then((r) => r.json()).then(setEmployees).catch(() => {});
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
    }, 1000);
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

  // Camera functions
  async function startCamera() {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permission and try again.");
    }
  }

  function takeSelfie() {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setSelfieData(dataUrl);
    // Stop camera stream
    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  }

  function retakeSelfie() {
    setSelfieData(null);
    startCamera();
  }

  // Geofencing
  async function verifyLocation() {
    setGeoStatus("checking");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      const res = await fetch("/api/attendance/verify-location", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      const data = await res.json();
      setGeoResult(data);
      setGeoStatus(data.allowed ? "allowed" : "denied");
    } catch {
      setGeoStatus("error");
      setGeoResult({ allowed: false, message: "Could not get your location. Please enable GPS.", nearestOffice: null, distance: null });
    }
  }

  async function handleAction(action: "CHECK_IN" | "CHECK_OUT") {
    if (!selectedEmp) return;
    setLoading(true);
    const body: Record<string, unknown> = { employeeId: selectedEmp, action };
    if (userLocation) {
      body.latitude = userLocation.lat;
      body.longitude = userLocation.lng;
      body.location = geoResult?.nearestOffice || "Unknown";
    }
    if (selfieData) body.selfie = selfieData;
    const res = await fetch("/api/attendance/check-in", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setTodayRecord(data);
      setSelfieData(null);
      setGeoStatus("idle");
      setGeoResult(null);
    } else {
      const err = await res.json();
      alert(err.error || "Failed");
    }
    setLoading(false);
  }

  const canCheckIn = (geoStatus === "allowed" || geoStatus === "idle") && !!selfieData;
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  return (
    <div className="p-8 max-w-lg">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-zinc-900">Self Check-In</h1>
        <Link href="/people/attendance/offices" className="text-xs text-zinc-500 hover:text-zinc-700 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Manage Offices
        </Link>
      </div>
      <p className="text-zinc-500 mb-6">Take a selfie and verify your location to check in</p>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">

        {/* Clock */}
        <div className="text-center">
          <Clock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-3xl font-mono font-bold text-zinc-900">{currentTime}</p>
          <p className="text-xs text-zinc-400 mt-1">Current Time (IST)</p>
        </div>

        {/* Employee Select */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Select Employee</label>
          <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} className={ic}>
            <option value="">-- Select your name --</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        {selectedEmp && (
          <>
            {/* Step 1 — Selfie */}
            <div className="border border-zinc-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                <span className="font-medium text-zinc-800">Take Selfie</span>
                {selfieData && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
              </div>

              {!selfieData && !cameraActive && (
                <button onClick={startCamera} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                  <Camera className="w-4 h-4" /> Open Camera
                </button>
              )}

              {cameraError && (
                <p className="text-xs text-red-500 text-center mt-2">{cameraError}</p>
              )}

              {cameraActive && (
                <div className="space-y-2">
                  <video ref={videoRef} className="w-full rounded-lg" autoPlay playsInline muted />
                  <button onClick={takeSelfie} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> Capture Selfie
                  </button>
                </div>
              )}

              {selfieData && (
                <div className="space-y-2">
                  <img src={selfieData} alt="Selfie" className="w-full rounded-lg" />
                  <button onClick={retakeSelfie} className="w-full border border-zinc-300 text-zinc-700 py-2 rounded-lg text-sm hover:bg-zinc-50">
                    Retake
                  </button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Step 2 — Location */}
            <div className="border border-zinc-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                <span className="font-medium text-zinc-800">Verify Location</span>
                {geoStatus === "allowed" && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                {geoStatus === "denied" && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
              </div>

              {geoStatus === "idle" && (
                <button onClick={verifyLocation} className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white py-2 rounded-lg text-sm hover:bg-zinc-900">
                  <MapPin className="w-4 h-4" /> Verify My Location
                </button>
              )}
              {geoStatus === "checking" && <p className="text-sm text-zinc-500 text-center py-2">Getting your location...</p>}
              {(geoStatus === "allowed" || geoStatus === "denied" || geoStatus === "error") && geoResult && (
                <div className={`rounded-lg p-3 text-sm ${geoStatus === "allowed" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                  <p>{geoResult.message}</p>
                  {geoResult.distance !== null && <p className="text-xs mt-1">Distance: {Math.round(geoResult.distance)}m</p>}
                  {geoStatus !== "allowed" && (
                    <button onClick={verifyLocation} className="text-xs underline mt-2">Retry</button>
                  )}
                </div>
              )}
            </div>

            {/* Today's Record */}
            {todayRecord && (
              <div className="bg-zinc-50 rounded-xl p-4 text-sm space-y-1">
                <p className="font-medium text-zinc-800">Today&apos;s Record</p>
                <p className="text-zinc-600">Check In: {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}</p>
                <p className="text-zinc-600">Check Out: {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}</p>
                {todayRecord.workHours && <p className="text-zinc-600">Hours: {todayRecord.workHours.toFixed(1)}h</p>}
                {todayRecord.lateArrival && <p className="text-orange-600 font-medium">⚠ Late Arrival</p>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {!selfieData && (
                <p className="text-xs text-zinc-400 text-center">Please take a selfie first to enable check-in</p>
              )}
              {todayRecord?.status === "WFH" ? (
                <div className="text-center text-blue-600 font-medium py-3">
                  🏠 WFH marked for today at {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                </div>
              ) : !todayRecord?.checkIn ? (
                <>
                  <button
                    onClick={() => handleAction("WFH")}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 mb-2"
                  >
                    🏠 Mark WFH
                  </button>
                  <button
                    onClick={() => handleAction("CHECK_IN")}
                  disabled={loading || !canCheckIn}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Checking In..." : "✓ Check In"}
                </button>
                </>
              ) : !todayRecord?.checkOut ? (
                <button
                  onClick={() => handleAction("CHECK_OUT")}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Checking Out..." : "✓ Check Out"}
                </button>
              ) : (
                <div className="text-center text-green-600 font-medium py-3">
                  ✓ Attendance complete for today
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
