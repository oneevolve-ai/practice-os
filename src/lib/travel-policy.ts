interface PolicyViolation {
  type: "warning" | "error";
  message: string;
}

interface RequestData {
  estimatedCost: number;
  travelMode: string;
  departureDate: string;
  returnDate: string;
  createdAt?: string;
}

// Policy limits by travel mode (in USD)
const MAX_COST: Record<string, number> = {
  FLIGHT: 5000,
  TRAIN: 2000,
  BUS: 1000,
  CAR: 1500,
  OTHER: 3000,
};

const MAX_TRIP_DAYS = 14;
const MIN_ADVANCE_BOOKING_DAYS = 3;

export function checkPolicyViolations(req: RequestData): PolicyViolation[] {
  const violations: PolicyViolation[] = [];

  // Cost limit check
  const maxCost = MAX_COST[req.travelMode] || MAX_COST.OTHER;
  if (req.estimatedCost > maxCost) {
    violations.push({
      type: "error",
      message: `Estimated cost (₹${req.estimatedCost.toLocaleString()}) exceeds the ${req.travelMode.toLowerCase()} travel limit of ₹${maxCost.toLocaleString()}`,
    });
  } else if (req.estimatedCost > maxCost * 0.8) {
    violations.push({
      type: "warning",
      message: `Estimated cost is over 80% of the ${req.travelMode.toLowerCase()} travel limit ($${maxCost.toLocaleString()})`,
    });
  }

  // Trip duration check
  const dep = new Date(req.departureDate);
  const ret = new Date(req.returnDate);
  const days = Math.ceil((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (days > MAX_TRIP_DAYS) {
    violations.push({
      type: "error",
      message: `Trip duration (${days} days) exceeds the maximum allowed ${MAX_TRIP_DAYS} days`,
    });
  }

  // Advance booking check
  const now = new Date();
  const daysUntilDeparture = Math.ceil(
    (dep.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilDeparture < MIN_ADVANCE_BOOKING_DAYS && daysUntilDeparture >= 0) {
    violations.push({
      type: "warning",
      message: `Trip departs in ${daysUntilDeparture} day${daysUntilDeparture !== 1 ? "s" : ""} — minimum advance booking is ${MIN_ADVANCE_BOOKING_DAYS} days`,
    });
  }

  return violations;
}
