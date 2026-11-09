import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { RANK_VALUES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const rank = searchParams.get("rank") || "";
    const server = searchParams.get("server") || "";
    const role = searchParams.get("role") || "";
    const language = searchParams.get("language") || "";
    const voiceChat = searchParams.get("voiceChat") || "all";
    const availableSlots = searchParams.get("availableSlots") || "all";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "12", 10)));
    const ownerId = searchParams.get("ownerId") || "";
    const includeClosed = searchParams.get("includeClosed") === "true";
    const partyType = searchParams.get("partyType") || "all";

    const where: any = {};

    if (partyType === "REAL") {
      where.partyType = "REAL";
    } else if (partyType === "DEMO") {
      where.partyType = "DEMO";
    }

    // Only active listings by default, hide Closed or In Game or Expired if browsing active
    if (ownerId) {
      where.ownerId = ownerId;
    } else if (!includeClosed) {
      where.status = {
        in: ["Looking for players", "Full", "FULL", "In Game"],
      };
      where.NOT = [
        { status: "EXPIRED" },
        { status: "Closed" },
      ];
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { partyCode: { contains: q } },
        { description: { contains: q } },
        { server: { contains: q } },
      ];
    }

    if (rank && rank !== "all") {
      where.OR = [
        { requiredRank: { contains: rank } },
        { averageRank: { contains: rank } },
      ];
    }

    if (server && server !== "all") {
      const serverKey = server.split(" ")[0];
      where.server = { contains: serverKey };
    }

    if (role && role !== "all") {
      where.preferredRole = { in: [role, "Any"] };
    }

    if (language && language !== "all") {
      where.language = { contains: language };
    }

    if (voiceChat === "required") {
      where.voiceChatRequired = true;
    } else if (voiceChat === "optional") {
      where.voiceChatRequired = false;
    }

    if (availableSlots !== "all") {
      if (availableSlots === "1") {
        where.currentPlayers = 4;
      } else if (availableSlots === "2") {
        where.currentPlayers = 3;
      } else if (availableSlots === "3+") {
        where.currentPlayers = { lte: 2 };
      }
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "updated") {
      orderBy = { updatedAt: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const total = await prisma.party.count({ where });
    const parties = await prisma.party.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            riotId: true,
            rank: true,
          },
        },
      },
    });

    // If sorting by rank desc (client-side value ranking since SQLite strings don't sort rank tiers)
    let sortedParties = parties;
    if (sortBy === "rank_desc") {
      sortedParties = [...parties].sort((a, b) => {
        const valA = RANK_VALUES[a.averageRank] || 0;
        const valB = RANK_VALUES[b.averageRank] || 0;
        return valB - valA;
      });
    }

    // REQUIREMENT: When a party reaches 5/5 players, is a DEMO party, or is EXPIRED:
    // Never expose hidden codes through public APIs or frontend HTML!
    const now = new Date();
    const sanitizedParties = sortedParties.map((p) => {
      const isFull = p.currentPlayers >= p.maxPlayers || p.status === "Full" || p.status === "FULL";
      const isDemo = p.partyType === "DEMO";
      const isExpired = p.status === "EXPIRED" || (p.expiresAt && new Date(p.expiresAt) <= now);
      const shouldHideCode = isFull || isDemo || isExpired;

      return {
        ...p,
        partyCode: shouldHideCode ? null : p.partyCode,
        isFull: Boolean(isFull),
        isExpired: Boolean(isExpired),
      };
    });

    return NextResponse.json({
      parties: sanitizedParties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch parties error:", error);
    return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to publish a party announcement." },
        { status: 401 }
      );
    }

    // Load dynamic site settings
    const settingsList = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "party.enablePublishing",
            "party.maxActivePartiesPerUser",
            "party.defaultExpirationMinutes",
            "party.maxPartySize",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    if (settingsMap["party.enablePublishing"] === "false") {
      return NextResponse.json(
        { error: "Party publication is temporarily disabled by platform administrators." },
        { status: 403 }
      );
    }

    const maxActive = parseInt(settingsMap["party.maxActivePartiesPerUser"] || "3", 10);
    const expirationMins = parseInt(settingsMap["party.defaultExpirationMinutes"] || "30", 10);
    const configuredMaxPartySize = parseInt(settingsMap["party.maxPartySize"] || "5", 10);

    // Check user active party count
    const activeUserParties = await prisma.party.count({
      where: {
        ownerId: user.id,
        status: { in: ["Looking for players", "Full"] },
      },
    });

    if (activeUserParties >= maxActive) {
      return NextResponse.json(
        {
          error: `You have reached the limit of ${maxActive} active parties. Please close or delete an existing party before publishing a new one.`,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      partyCode,
      currentPlayers,
      maxPlayers = configuredMaxPartySize,
      requiredRank,
      averageRank,
      preferredRole = "Any",
      server,
      language = "English",
      voiceChatRequired = true,
      description,
      discordContact,
    } = body;

    // Validation
    if (!partyCode || !partyCode.trim()) {
      return NextResponse.json(
        { error: "Official VALORANT Party Code is required." },
        { status: 400 }
      );
    }

    if (!requiredRank || !requiredRank.trim()) {
      return NextResponse.json(
        { error: "Minimum required rank is required." },
        { status: 400 }
      );
    }

    if (!server || !server.trim()) {
      return NextResponse.json(
        { error: "Server region is required." },
        { status: 400 }
      );
    }

    const effectiveMax = Math.min(configuredMaxPartySize, parseInt(maxPlayers, 10) || configuredMaxPartySize);
    const current = parseInt(currentPlayers, 10);
    if (isNaN(current) || current < 1 || current >= effectiveMax) {
      return NextResponse.json(
        { error: `Current players must be between 1 and ${effectiveMax - 1} to find teammates.` },
        { status: 400 }
      );
    }

    // Auto status & expiration (strictly 60 minutes per requirement)
    let status = "Looking for players";
    if (current === effectiveMax) {
      status = "Full";
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const party = await prisma.party.create({
      data: {
        ownerId: user.id,
        partyType: "REAL",
        name: name?.trim() || `${user.username}'s Squad`,
        partyCode: partyCode.trim(),
        currentPlayers: current,
        maxPlayers: effectiveMax,
        requiredRank: requiredRank.trim(),
        averageRank: averageRank?.trim() || requiredRank.trim(),
        preferredRole: preferredRole || "Any",
        server: server.trim(),
        language: language.trim() || "English",
        voiceChatRequired: Boolean(voiceChatRequired),
        description: description?.trim() || "",
        discordContact: discordContact?.trim() || user.discordUsername || null,
        status,
        expiresAt,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            riotId: true,
            rank: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, party }, { status: 201 });
  } catch (error) {
    console.error("Create party error:", error);
    return NextResponse.json(
      { error: "Something went wrong while publishing the party." },
      { status: 500 }
    );
  }
}
