import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const publicKeys = [
      "general.siteName",
      "general.siteDescription",
      "general.maintenanceMode",
      "party.maxPartySize",
      "party.allowPublicParties",
      "party.enableCopying",
      "user.enableRegistration",
    ];

    const records = await prisma.siteSetting.findMany({
      where: {
        key: { in: publicKeys },
      },
    });

    const settings: Record<string, string> = {};
    records.forEach((r) => {
      settings[r.key] = r.value;
    });

    return NextResponse.json({
      siteName: settings["general.siteName"] || "LastMate",
      siteDescription:
        settings["general.siteDescription"] ||
        "VALORANT party code sharing platform",
      maintenanceMode: settings["general.maintenanceMode"] === "true",
      maxPartySize: parseInt(settings["party.maxPartySize"] || "5", 10),
      allowPublicParties: settings["party.allowPublicParties"] !== "false",
      enableCopying: settings["party.enableCopying"] !== "false",
      enableRegistration: settings["user.enableRegistration"] !== "false",
    });
  } catch (err) {
    console.error("Public settings fetch error:", err);
    return NextResponse.json({
      siteName: "LastMate",
      maintenanceMode: false,
      maxPartySize: 5,
      allowPublicParties: true,
      enableCopying: true,
      enableRegistration: true,
    });
  }
}

