import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Location not provided" }, { status: 400 });
    }

    const offices = await prisma.officeLocation.findMany({ where: { isActive: true } });

    if (offices.length === 0) {
      // No offices configured — allow check-in anywhere
      return NextResponse.json({ allowed: true, message: "No office locations configured. Geofencing disabled.", nearestOffice: null, distance: null });
    }

    let nearestOffice = offices[0];
    let minDistance = Infinity;

    for (const office of offices) {
      const dist = haversineDistance(latitude, longitude, office.latitude, office.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestOffice = office;
      }
    }

    const allowed = minDistance <= nearestOffice.radius;

    return NextResponse.json({
      allowed,
      message: allowed
        ? `Within ${nearestOffice.name} (${Math.round(minDistance)}m away)`
        : `Too far from any office. Nearest: ${nearestOffice.name} (${Math.round(minDistance)}m away, max ${nearestOffice.radius}m)`,
      nearestOffice: nearestOffice.name,
      distance: Math.round(minDistance),
      radius: nearestOffice.radius,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
