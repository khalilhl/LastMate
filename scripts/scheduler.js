const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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
];

const DEMO_RANKS = [
  "Gold 3", "Platinum 2", "Diamond 1", "Diamond 3",
  "Ascendant 1", "Ascendant 2", "Ascendant 3",
  "Immortal 1", "Immortal 2", "Radiant"
];

const DEMO_SERVERS = [
  "Frankfurt (EU Central)", "Paris (EU West)", "London (EU West)",
  "Stockholm (EU North)", "Madrid (EU Southwest)", "Istanbul (TR)"
];

const DEMO_ROLES = ["Duelist", "Initiator", "Controller", "Sentinel", "Any"];

async function getOrCreateDemoBot() {
  const botEmail = "bot@lastmate.gg";
  return await prisma.user.upsert({
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
}

async function rotateDemoParties(targetCount = 12) {
  const bot = await getOrCreateDemoBot();
  const now = new Date();
  const nextRotation = new Date(now.getTime() + 15 * 60 * 1000);

  const demoParties = [];
  for (let i = 0; i < targetCount; i++) {
    const name = DEMO_SQUAD_NAMES[i % DEMO_SQUAD_NAMES.length];
    const rank = DEMO_RANKS[Math.floor(Math.random() * DEMO_RANKS.length)];
    const server = DEMO_SERVERS[Math.floor(Math.random() * DEMO_SERVERS.length)];
    const role = DEMO_ROLES[Math.floor(Math.random() * DEMO_ROLES.length)];

    demoParties.push({
      ownerId: bot.id,
      name,
      partyCode: null, // Strictly NULL
      partyType: "DEMO",
      currentPlayers: 5,
      maxPlayers: 5,
      requiredRank: rank,
      averageRank: rank,
      preferredRole: role,
      server,
      language: "English",
      voiceChatRequired: true,
      description: "Full squad currently in custom lobby warmup before jumping into ranked games.",
      status: "FULL",
      expiresAt: null,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.party.deleteMany({ where: { partyType: "DEMO" } });
    await tx.party.createMany({ data: demoParties });

    await tx.siteSetting.upsert({
      where: { key: "demo.lastRotationTime" },
      update: { value: now.toISOString() },
      create: { key: "demo.lastRotationTime", value: now.toISOString() },
    });

    await tx.siteSetting.upsert({
      where: { key: "demo.nextRotationTime" },
      update: { value: nextRotation.toISOString() },
      create: { key: "demo.nextRotationTime", value: nextRotation.toISOString() },
    });
  });

  console.log(`[Scheduler CLI] Rotated ${demoParties.length} demo parties. Next: ${nextRotation.toISOString()}`);
}

async function cleanupExpiredCodes() {
  const now = new Date();
  const nextCleanup = new Date(now.getTime() + 5 * 60 * 1000);

  const result = await prisma.party.updateMany({
    where: {
      partyType: "REAL",
      expiresAt: { lte: now },
      OR: [
        { partyCode: { not: null } },
        { status: { not: "EXPIRED" } },
      ],
    },
    data: {
      partyCode: null,
      status: "EXPIRED",
      closedAt: now,
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "cleanup.lastCleanupTime" },
    update: { value: now.toISOString() },
    create: { key: "cleanup.lastCleanupTime", value: now.toISOString() },
  });

  await prisma.siteSetting.upsert({
    where: { key: "cleanup.nextCleanupTime" },
    update: { value: nextCleanup.toISOString() },
    create: { key: "cleanup.nextCleanupTime", value: nextCleanup.toISOString() },
  });

  if (result.count > 0) {
    console.log(`[Scheduler CLI] Nullified/Expired ${result.count} real party codes.`);
  }
}

async function runOnce() {
  console.log("Checking scheduled tasks...");
  await rotateDemoParties(12);
  await cleanupExpiredCodes();
  console.log("Completed execution.");
  process.exit(0);
}

if (require.main === module) {
  runOnce().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { rotateDemoParties, cleanupExpiredCodes };
