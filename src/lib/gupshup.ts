const GUPSHUP_API_KEY = "sk_d5f0169e5d7440fda2f5ec00dc09e30d";
const GUPSHUP_SOURCE = "15559416292";

export async function sendWhatsApp(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  try {
    const res = await fetch("https://api.gupshup.io/wa/api/v1/msg", {
      method: "POST",
      headers: {
        "apikey": GUPSHUP_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        channel: "whatsapp",
        source: GUPSHUP_SOURCE,
        destination: cleanPhone,
        message: JSON.stringify({ type: "text", text: message }),
        "src.name": "PracticeOS",
      }),
    });
    const data = await res.json();
    console.log("[Gupshup]", data);
    return data;
  } catch (e) {
    console.error("[Gupshup error]", e);
  }
}

export async function sendWhatsAppButtons(phone: string, message: string, buttons: { id: string; title: string }[]) {
  const cleanPhone = phone.replace(/\D/g, "");
  try {
    const res = await fetch("https://api.gupshup.io/wa/api/v1/msg", {
      method: "POST",
      headers: {
        "apikey": GUPSHUP_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        channel: "whatsapp",
        source: GUPSHUP_SOURCE,
        destination: cleanPhone,
        message: JSON.stringify({
          type: "quick_reply",
          msgid: `msg_${Date.now()}`,
          message,
          options: buttons.map(b => ({ type: "text", title: b.title, postbackText: b.id })),
        }),
        "src.name": "PracticeOS",
      }),
    });
    const data = await res.json();
    console.log("[Gupshup buttons]", data);
    return data;
  } catch (e) {
    console.error("[Gupshup error]", e);
  }
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
