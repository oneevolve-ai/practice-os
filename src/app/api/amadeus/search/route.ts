import { NextResponse } from "next/server";

// Dynamic import to avoid issues if amadeus package isn't configured
async function getAmadeusClient() {
  const Amadeus = (await import("amadeus")).default;
  return new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    hostname: "test", // Use 'production' for live data
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, travelMode, adults } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: "Origin, destination, and departure date are required" },
        { status: 400 }
      );
    }

    // Only flights are supported via Amadeus
    if (travelMode && travelMode !== "FLIGHT") {
      return NextResponse.json({
        offers: [],
        message: `Live search is currently available for flights only. For ${travelMode.toLowerCase()} travel, please enter the estimated cost manually.`,
      });
    }

    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Amadeus API is not configured. Please add AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET to your .env file." },
        { status: 503 }
      );
    }

    const amadeus = await getAmadeusClient();

    const searchParams: Record<string, string | number> = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults: adults || 1,
      max: 10,
      currencyCode: "USD",
    };

    if (returnDate) {
      searchParams.returnDate = returnDate;
    }

    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);

    const offers = (response.data || []).map((offer: Record<string, unknown>, index: number) => {
      const itineraries = offer.itineraries as Array<{
        duration: string;
        segments: Array<{
          departure: { iataCode: string; at: string };
          arrival: { iataCode: string; at: string };
          carrierCode: string;
          number: string;
        }>;
      }>;
      const price = offer.price as { total: string; currency: string };
      const outbound = itineraries[0];
      const firstSeg = outbound.segments[0];
      const lastSeg = outbound.segments[outbound.segments.length - 1];

      return {
        id: index,
        airline: firstSeg.carrierCode,
        flightNumber: `${firstSeg.carrierCode}${firstSeg.number}`,
        departureAirport: firstSeg.departure.iataCode,
        departureTime: firstSeg.departure.at,
        arrivalAirport: lastSeg.arrival.iataCode,
        arrivalTime: lastSeg.arrival.at,
        duration: outbound.duration,
        stops: outbound.segments.length - 1,
        price: parseFloat(price.total),
        currency: price.currency,
        rawOffer: offer,
      };
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Amadeus search error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Flight search failed: ${message}` },
      { status: 500 }
    );
  }
}
