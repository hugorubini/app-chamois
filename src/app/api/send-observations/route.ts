import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const observations = body?.observations;

    if (!Array.isArray(observations)) {
      return NextResponse.json(
        { error: "Le tableau d’observations est manquant." },
        { status: 400 }
      );
    }

    console.log("Observations reçues par l’API locale :", observations);

    return NextResponse.json({
      success: true,
      count: observations.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de traiter la requête." },
      { status: 500 }
    );
  }
}