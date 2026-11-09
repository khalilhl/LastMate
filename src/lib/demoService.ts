import prisma from "@/lib/prisma";
import { VALORANT_RANKS, VALORANT_SERVERS, VALORANT_ROLES, LANGUAGES } from "@/lib/constants";

// Sample fictional squad names & themes for realistic esports demo parties
const DEMO_SQUAD_NAMES = [
  "Phantom Protocol 5-Stack",
  "Viper Pit Tactical Squad",
  "Haven Retake Specialists",
  "Ascendant Competitive Grind",
  "Radiant Ascent High Elo",
  "Bind Teleport Operators",
  "Split Heaven Controllers",
  "Omen Paranoia Unit",
  "Sunset Mid Lurkers",
  "Icebox B-Site Rushers",
  "Lotus C-Site Executors",
  "Abyss Vertical Vanguard",
  "Fracture Aggro Five",
  "Breeze Long Range Snipers",
  "Pearl Double Controller Unit",
  "Bind Hookah Control Squad",
  "Ascendant Nightowls",
  "Immortal Premier Scrims",
];

const DEMO_DESCRIPTIONS = [
  "Full squad currently in custom lobby warmup before jumping into ranked games.",
  "Practicing 5-man site retakes and default executes on Haven. Full squad locked.",
  "Esports scrim lineup filled and in game. Great comms, squad complete!",
  "Nightly competitive 5-stack with Discord comms. Squad roster is filled.",
  "Ranked climb stack. Roster locked for this match, thanks for checking LastMate!",
  "High-elo 5-stack testing new patch setups in competitive queue.",
  "Five-stack premier roster locked and ready to compete.",
  "Warmup matches concluded, 5/5 players ready for the competitive push.",
];

const DEMO_DISCORD_TAGS = [
  "ViperMain#0001",
  "OmenKing#1337",
  "JettDiff#7777",
  "SovaDarts#4040",
  "Brimstone#9999",
  "KilljoyLab#1234",
  "BreachFlash#5555",
  "ReynaGod#2424",
];

/**
 * Ensures a dedicated system bot exists to cleanly own demo parties.
 * Real user accounts are NEVER used or modified for demo parties.
 */
export async function getOrCreateDemoBotUser() {
  const botEmail = "bot@lastmate.gg";
  const bot = await prisma.user.upsert({
    where: { email: botEmail },
    update: {},
    create: {
      username: "LastMate Squads",
      email: botEmail,
      passwordHash: "$2a$12$DEMO_SQUADS_BOT_ACCOUNT_DO_NOT_LOGIN_DIRECTLY$",
      role: "USER",
      status: "ACTIVE",
      rank: "Ascendant 2",
      mainRole: "Any",
      preferredServer: "Frankfurt (EU Central)",
      languages: "English",
      bio: "Official automated squad generator showcasing active 5/5 VALORANT parties.",
    },
  });
  return bot;
}

/**
 * Generates an array of fictional demo party data objects.
 * Strict Requirements:
 * - partyType = "DEMO"
 * - partyCode = NULL (never generate fake Riot party codes)
 * - currentPlayers = 5
 * - maxPlayers = 5
 * - status = "FULL"
 */
export function generateDemoPartyData(count: number, botUserId: string) {
  const parties = [];
  const shuffledNames = [...DEMO_SQUAD_NAMES].sort(() => 0.5 - Math.random());

  // Pick realistic ranks between Gold 1 and Radiant
  const eligibleRanks = VALORANT_RANKS.filter(
    (r) => !r.startsWith("Iron") && !r.startsWith("Bronze")
  );

  for (let i = 0; i < count; i++) {
    const name = shuffledNames[i % shuffledNames.length];
    const rank = eligibleRanks[Math.floor(Math.random() * eligibleRanks.length)];
    const server = VALORANT_SERVERS[Math.floor(Math.random() * VALORANT_SERVERS.length)];
    const role = VALORANT_ROLES[Math.floor(Math.random() * VALORANT_ROLES.length)];
    const lang = LANGUAGES[Math.floor(Math.random() * Math.min(6, LANGUAGES.length))];
    const desc = DEMO_DESCRIPTIONS[Math.floor(Math.random() * DEMO_DESCRIPTIONS.length)];
    const discord = DEMO_DISCORD_TAGS[Math.floor(Math.random() * DEMO_DISCORD_TAGS.length)];

    parties.push({
      ownerId: botUserId,
      name,
      partyCode: null, // Strictly NULL per requirement
      partyType: "DEMO",
      currentPlayers: 5, // Exactly 5/5 players
      maxPlayers: 5,
      requiredRank: rank,
      averageRank: rank,
      preferredRole: role,
      server,
      language: lang,
      voiceChatRequired: Math.random() > 0.3,
      description: desc,
      status: "FULL", // Always FULL
      discordContact: discord,
      expiresAt: null, // Demo parties don't expire via user expiration, they rotate
    });
  }

  return parties;
}

/**
 * Rotates all demo parties atomically inside a database transaction.
 * Completely idempotent and guarantees 0 impact on REAL parties or real user accounts.
 */
export async function rotateDemoParties(targetCount: number = 12) {
  const bot = await getOrCreateDemoBotUser();
  const demoParties = generateDemoPartyData(targetCount, bot.id);
  const now = new Date();

  // Load rotation interval setting (default 15 minutes)
  const intervalSetting = await prisma.siteSetting.findUnique({
    where: { key: "demo.rotationIntervalMinutes" },
  });
  const intervalMins = parseInt(intervalSetting?.value || "15", 10);
  const nextRotation = new Date(now.getTime() + intervalMins * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Delete ONLY existing DEMO parties. Never touch REAL parties!
    const deleted = await tx.party.deleteMany({
      where: { partyType: "DEMO" },
    });

    // 2. Insert fresh randomized DEMO parties
    await tx.party.createMany({
      data: demoParties,
    });

    // 3. Update SiteSettings timestamps
    await tx.siteSetting.upsert({
      where: { key: "demo.lastRotationTime" },
      update: { value: now.toISOString() },
      create: {
        key: "demo.lastRotationTime",
        value: now.toISOString(),
      },
    });

    await tx.siteSetting.upsert({
      where: { key: "demo.nextRotationTime" },
      update: { value: nextRotation.toISOString() },
      create: {
        key: "demo.nextRotationTime",
        value: nextRotation.toISOString(),
      },
    });

    return {
      deletedCount: deleted.count,
      createdCount: demoParties.length,
      lastRotation: now.toISOString(),
      nextRotation: nextRotation.toISOString(),
    };
  });

  return result;
}

/**
 * Cleans up expired REAL party codes after 60 minutes.
 * Requirements:
 * - Only affects REAL party codes whose expiresAt <= now.
 * - Sets partyCode = NULL in the database.
 * - Sets status = EXPIRED.
 * - Sets closedAt = now.
 * - Preserves metadata for analytics.
 * - Never touches DEMO parties.
 */
export async function cleanupExpiredPartyCodes() {
  const now = new Date();

  // Load cleanup interval setting (default 5 minutes)
  const intervalSetting = await prisma.siteSetting.findUnique({
    where: { key: "cleanup.intervalMinutes" },
  });
  const intervalMins = parseInt(intervalSetting?.value || "5", 10);
  const nextCleanup = new Date(now.getTime() + intervalMins * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    // Find parties to be expired
    const expiredCount = await tx.party.updateMany({
      where: {
        partyType: "REAL",
        expiresAt: { lte: now },
        OR: [
          { partyCode: { not: null } },
          { status: { not: "EXPIRED" } },
        ],
      },
      data: {
        partyCode: null, // Strictly set to NULL
        status: "EXPIRED",
        closedAt: now,
      },
    });

    // Update cleanup metadata timestamps
    await tx.siteSetting.upsert({
      where: { key: "cleanup.lastCleanupTime" },
      update: { value: now.toISOString() },
      create: {
        key: "cleanup.lastCleanupTime",
        value: now.toISOString(),
      },
    });

    await tx.siteSetting.upsert({
      where: { key: "cleanup.nextCleanupTime" },
      update: { value: nextCleanup.toISOString() },
      create: {
        key: "cleanup.nextCleanupTime",
        value: nextCleanup.toISOString(),
      },
    });

    return {
      expiredCount: expiredCount.count,
      lastCleanup: now.toISOString(),
      nextCleanup: nextCleanup.toISOString(),
    };
  });

  return result;
}

/**
 * Deletes all DEMO parties without touching any real parties.
 */
export async function deleteAllDemoParties() {
  const deleted = await prisma.party.deleteMany({
    where: { partyType: "DEMO" },
  });
  return deleted.count;
}

/**
 * Returns current statistics about demo parties, real parties, and expired codes.
 */
export async function getDemoAndExpirationStats() {
  const [
    demoCount,
    realActiveCount,
    realExpiredCount,
    demoEnabledSetting,
    demoTargetCountSetting,
    demoIntervalSetting,
    lastRotationSetting,
    nextRotationSetting,
    autoCleanupSetting,
    cleanupIntervalSetting,
    lastCleanupSetting,
    nextCleanupSetting,
  ] = await Promise.all([
    prisma.party.count({ where: { partyType: "DEMO" } }),
    prisma.party.count({
      where: {
        partyType: "REAL",
        status: { in: ["Looking for players", "Full", "In Game"] },
      },
    }),
    prisma.party.count({
      where: {
        partyType: "REAL",
        status: "EXPIRED",
      },
    }),
    prisma.siteSetting.findUnique({ where: { key: "demo.enabled" } }),
    prisma.siteSetting.findUnique({ where: { key: "demo.targetCount" } }),
    prisma.siteSetting.findUnique({ where: { key: "demo.rotationIntervalMinutes" } }),
    prisma.siteSetting.findUnique({ where: { key: "demo.lastRotationTime" } }),
    prisma.siteSetting.findUnique({ where: { key: "demo.nextRotationTime" } }),
    prisma.siteSetting.findUnique({ where: { key: "cleanup.autoCleanupEnabled" } }),
    prisma.siteSetting.findUnique({ where: { key: "cleanup.intervalMinutes" } }),
    prisma.siteSetting.findUnique({ where: { key: "cleanup.lastCleanupTime" } }),
    prisma.siteSetting.findUnique({ where: { key: "cleanup.nextCleanupTime" } }),
  ]);

  return {
    demo: {
      count: demoCount,
      enabled: demoEnabledSetting?.value !== "false",
      targetCount: parseInt(demoTargetCountSetting?.value || "12", 10),
      rotationIntervalMinutes: parseInt(demoIntervalSetting?.value || "15", 10),
      lastRotationTime: lastRotationSetting?.value || null,
      nextRotationTime: nextRotationSetting?.value || null,
    },
    cleanup: {
      autoCleanupEnabled: autoCleanupSetting?.value !== "false",
      intervalMinutes: parseInt(cleanupIntervalSetting?.value || "5", 10),
      lastCleanupTime: lastCleanupSetting?.value || null,
      nextCleanupTime: nextCleanupSetting?.value || null,
      realActiveCount,
      realExpiredCount,
    },
  };
}
