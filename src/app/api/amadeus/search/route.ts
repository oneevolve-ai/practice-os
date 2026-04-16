import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { origin, destination, departureDate, returnDate, travelMode } = body;

  if (travelMode !== "flight" && travelMode !== "FLIGHT") {
    return NextResponse.json({ offers: [], message: "Flight search only" });
  }

  try {
    const url = new URL("https://flights-sky.p.rapidapi.com/flights/search-one-way");
    url.searchParams.set("fromEntityId", origin.toUpperCase());
    url.searchParams.set("toEntityId", destination.toUpperCase());
    url.searchParams.set("departDate", departureDate);
    url.searchParams.set("cabinClass", "economy");
    url.searchParams.set("adults", "1");
    url.searchParams.set("currency", "INR");

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-host": "flights-sky.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "14c0c3da0cmsh945240a820de1cep1f231cjsnc0259a9c1312",
      },
    });

    const data = await res.json();
    const itineraries = data?.data?.itineraries || [];

    const offers = itineraries.slice(0, 10).map((it: any, i: number) => {
      const leg = it.legs?.[0];
      const segment = leg?.segments?.[0];
      return {
        id: i,
        airline: leg?.carriers?.marketing?.[0]?.name || "Unknown",
        flightNumber: segment?.flightNumber || "",
        departureAirport: leg?.origin?.displayCode || origin,
        departureTime: leg?.departure || "",
        arrivalAirport: leg?.destination?.displayCode || destination,
        arrivalTime: leg?.arrival || "",
        duration: leg?.durationInMinutes ? `PT${Math.floor(leg.durationInMinutes/60)}H${leg.durationInMinutes%60}M` : "",
        stops: leg?.stopCount || 0,
        price: it.price?.raw || 0,
        currency: "INR",
        segments: (leg?.segments || []).map((s: any) => ({
          origin: s.origin?.displayCode || "",
          destination: s.destination?.displayCode || "",
          departure: s.departure || "",
          arrival: s.arrival || "",
          durationInMinutes: s.durationInMinutes || 0,
          flightNumber: s.flightNumber || "",
          airline: s.marketingCarrier?.name || "",
        })),
        rawOffer: it,
      };
    });

    return NextResponse.json({ offers, message: offers.length === 0 ? "No flights found" : "" });
  } catch (err: any) {
    return NextResponse.json({ offers: [], message: "Search failed: " + err.message }, { status: 500 });
  }
}
