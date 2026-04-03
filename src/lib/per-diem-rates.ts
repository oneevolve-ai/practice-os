// Per diem rates in USD per day (accommodation + meals + incidentals)
// Based on common corporate travel allowances
const rates: Record<string, number> = {
  // Indian cities
  "mumbai": 150, "delhi": 140, "bangalore": 130, "bengaluru": 130,
  "hyderabad": 120, "chennai": 120, "kolkata": 110, "pune": 110,
  "ahmedabad": 100, "goa": 120, "jaipur": 100, "lucknow": 90,
  "chandigarh": 95, "kochi": 100, "indore": 85, "bhopal": 85,
  "nagpur": 85, "vadodara": 90, "surat": 90, "coimbatore": 90,
  "thiruvananthapuram": 95, "vizag": 90, "visakhapatnam": 90,

  // International cities
  "new york": 350, "nyc": 350, "san francisco": 375, "los angeles": 300,
  "chicago": 275, "boston": 325, "washington": 300, "seattle": 300,
  "austin": 250, "houston": 225, "dallas": 225, "miami": 275,
  "london": 400, "paris": 375, "berlin": 275, "amsterdam": 325,
  "dubai": 350, "abu dhabi": 325, "singapore": 350, "hong kong": 375,
  "tokyo": 325, "sydney": 300, "melbourne": 275, "toronto": 275,
  "bangkok": 175, "kuala lumpur": 200, "jakarta": 175,
  "doha": 325, "riyadh": 275, "muscat": 250,

  // IATA codes
  "bom": 150, "del": 140, "blr": 130, "hyd": 120, "maa": 120,
  "ccu": 110, "goi": 120, "jai": 100, "cok": 100,
  "jfk": 350, "sfo": 375, "lax": 300, "ord": 275, "bos": 325,
  "lhr": 400, "cdg": 375, "sin": 350, "hkg": 375, "nrt": 325,
  "dxb": 350, "syd": 300, "bkk": 175, "kul": 200,
};

const DEFAULT_RATE = 125; // USD per day

export function getPerDiemRate(destination: string): { rate: number; isDefault: boolean } {
  const key = destination.toLowerCase().trim();
  const rate = rates[key];
  if (rate) return { rate, isDefault: false };
  return { rate: DEFAULT_RATE, isDefault: true };
}

export function calculatePerDiem(
  destination: string,
  departureDate: string,
  returnDate: string
): { dailyRate: number; days: number; total: number; isDefault: boolean } {
  const dep = new Date(departureDate);
  const ret = new Date(returnDate);
  const days = Math.max(1, Math.ceil((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const { rate, isDefault } = getPerDiemRate(destination);
  return { dailyRate: rate, days, total: rate * days, isDefault };
}
