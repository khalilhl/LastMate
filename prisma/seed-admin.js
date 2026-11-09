const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log("Seeding Super Admin, roles, site settings, and sample announcements...");

  const superAdminPassword = await bcrypt.hash("SuperAdmin2026!", 12);
  const staffPassword = await bcrypt.hash("password123", 12);

  // 1. Create or update SUPER_ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@lastmate.gg" },
    update: {
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
    create: {
      username: "SuperAdmin",
      email: "superadmin@lastmate.gg",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      rank: "Radiant",
      mainRole: "Controller",
      preferredServer: "Frankfurt (EU Central)",
      languages: "English, French",
      bio: "Chief Executive & Lead Platform Administrator for LastMate.",
    },
  });
  console.log(`[OK] Super Admin ready: ${superAdmin.email} (Role: ${superAdmin.role})`);

  // 2. Create sample ADMIN
  const admin = await prisma.user.upsert({
    where: { email: "admin@lastmate.gg" },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      username: "CommanderBrim",
      email: "admin@lastmate.gg",
      passwordHash: staffPassword,
      role: "ADMIN",
      status: "ACTIVE",
      rank: "Immortal 2",
      mainRole: "Controller",
      preferredServer: "London (EU West)",
      languages: "English",
      bio: "Platform Administrator overseeing squad integrity.",
    },
  });
  console.log(`[OK] Admin ready: ${admin.email} (Role: ${admin.role})`);

  // 3. Create sample MODERATOR
  const mod = await prisma.user.upsert({
    where: { email: "moderator@lastmate.gg" },
    update: {
      role: "MODERATOR",
      status: "ACTIVE",
    },
    create: {
      username: "ModSage",
      email: "moderator@lastmate.gg",
      passwordHash: staffPassword,
      role: "MODERATOR",
      status: "ACTIVE",
      rank: "Ascendant 3",
      mainRole: "Sentinel",
      preferredServer: "Paris (EU West)",
      languages: "English, French",
      bio: "Community Moderator ensuring a clean, non-toxic lobby environment.",
    },
  });
  console.log(`[OK] Moderator ready: ${mod.email} (Role: ${mod.role})`);

  // 4. Default Site Settings
  const defaultSettings = [
    { key: "general.siteName", value: "LastMate" },
    { key: "general.siteLogo", value: "/logo.jpg" },
    { key: "general.description", value: "VALORANT Party Code Matchmaking Platform" },
    { key: "general.contactEmail", value: "support@lastmate.gg" },
    { key: "general.maintenanceMode", value: "false" },
    { key: "party.maxPartySize", value: "5" },
    { key: "party.defaultExpirationMinutes", value: "30" },
    { key: "party.maxActivePartiesPerUser", value: "3" },
    { key: "party.allowPublicParties", value: "true" },
    { key: "party.enablePartyCreation", value: "true" },
    { key: "party.enableCodeCopying", value: "true" },
    { key: "user.enableRegistration", value: "true" },
    { key: "user.enableEmailVerification", value: "false" },
    { key: "user.allowedRoles", value: "USER,MODERATOR,ADMIN,SUPER_ADMIN" },
    { key: "moderation.maxReportsBeforeAutoReview", value: "3" },
    { key: "moderation.autoExpireInactiveMinutes", value: "60" },
    { key: "moderation.rateLimitRequestsPerMin", value: "60" },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`[OK] Seeded ${defaultSettings.length} site settings`);

  // 5. Default Announcements
  const existingAnnouncements = await prisma.announcement.count();
  if (existingAnnouncements === 0) {
    await prisma.announcement.createMany({
      data: [
        {
          title: "Welcome to LastMate v1.2",
          content: "Find your 5th teammate in seconds with official VALORANT party codes. Always be respectful and play your role!",
          type: "INFO",
          isActive: true,
          createdBy: "SuperAdmin",
        },
        {
          title: "Episode Competitive Push Season",
          content: "High-ELO Ascendant & Immortal lobbies are active tonight on Frankfurt & London servers. Good luck on the climb!",
          type: "PROMO",
          isActive: true,
          createdBy: "SuperAdmin",
        },
      ],
    });
    console.log("[OK] Seeded announcements");
  }

  // 6. Initial Audit Log Entry
  const logCount = await prisma.adminLog.count();
  if (logCount === 0) {
    await prisma.adminLog.create({
      data: {
        adminId: superAdmin.id,
        adminName: superAdmin.username,
        action: "SYSTEM_INITIALIZATION",
        targetType: "System",
        targetId: "LastMate",
        details: "Super Admin dashboard initialized with RBAC and security policies.",
      },
    });
    console.log("[OK] Initialized audit log");
  }

  // 7. Seed Demo Bot & 12 Active Showcase Demo Parties
  const existingDemoCount = await prisma.party.count({ where: { partyType: "DEMO" } });
  if (existingDemoCount === 0) {
    console.log("Generating 12 active 5/5 demo parties for showcase...");
    const botUser = await prisma.user.upsert({
      where: { email: "bot@lastmate.gg" },
      update: {},
      create: {
        username: "LastMate Squads",
        email: "bot@lastmate.gg",
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

    const demoSquads = [
      { name: "Phantom Protocol 5-Stack", rank: "Ascendant 2", server: "Frankfurt (EU Central)", role: "Duelist", lang: "English", desc: "Full squad currently in custom lobby warmup before jumping into ranked games." },
      { name: "Viper Pit Tactical Squad", rank: "Diamond 3", server: "London (EU West)", role: "Controller", lang: "English, French", desc: "Practicing 5-man site retakes and default executes on Haven. Full squad locked." },
      { name: "Haven Retake Specialists", rank: "Immortal 1", server: "Paris (EU West)", role: "Initiator", lang: "French, English", desc: "Esports scrim lineup filled and in game. Great comms, squad complete!" },
      { name: "Ascendant Competitive Grind", rank: "Ascendant 1", server: "Frankfurt (EU Central)", role: "Sentinel", lang: "English, German", desc: "Nightly competitive 5-stack with Discord comms. Squad roster is filled." },
      { name: "Radiant Ascent High Elo", rank: "Radiant", server: "London (EU West)", role: "Any", lang: "English", desc: "Ranked climb stack. Roster locked for this match, thanks for checking LastMate!" },
      { name: "Bind Teleport Operators", rank: "Platinum 2", server: "Madrid (EU South)", role: "Duelist", lang: "Spanish, English", desc: "High-elo 5-stack testing new patch setups in competitive queue." },
      { name: "Split Heaven Controllers", rank: "Diamond 1", server: "Warsaw (EU East)", role: "Controller", lang: "Polish, English", desc: "Five-stack premier roster locked and ready to compete." },
      { name: "Omen Paranoia Unit", rank: "Ascendant 3", server: "Frankfurt (EU Central)", role: "Controller", lang: "English", desc: "Warmup matches concluded, 5/5 players ready for the competitive push." },
      { name: "Sunset Mid Lurkers", rank: "Immortal 2", server: "Paris (EU West)", role: "Initiator", lang: "English, French", desc: "Nightly high-tier grind. Playing competitive queue on Paris." },
      { name: "Icebox B-Site Rushers", rank: "Diamond 2", server: "Stockholm (EU North)", role: "Duelist", lang: "English", desc: "Locked and ready. 5/5 players with active Discord voice." },
      { name: "Lotus C-Site Executors", rank: "Platinum 3", server: "London (EU West)", role: "Sentinel", lang: "English", desc: "Squad complete, jumping into ranked right now." },
      { name: "Abyss Vertical Vanguard", rank: "Ascendant 1", server: "Frankfurt (EU Central)", role: "Initiator", lang: "English, German", desc: "Exploring Abyss setups. 5-stack complete." },
    ];

    const demoData = demoSquads.map((s) => ({
      ownerId: botUser.id,
      name: s.name,
      partyCode: null,
      partyType: "DEMO",
      currentPlayers: 5,
      maxPlayers: 5,
      requiredRank: s.rank,
      averageRank: s.rank,
      preferredRole: s.role,
      server: s.server,
      language: s.lang,
      voiceChatRequired: true,
      description: s.desc,
      status: "FULL",
    }));

    await prisma.party.createMany({ data: demoData });

    const now = new Date();
    const nextRotation = new Date(now.getTime() + 15 * 60 * 1000);
    await prisma.siteSetting.upsert({
      where: { key: "demo.enabled" },
      update: { value: "true" },
      create: { key: "demo.enabled", value: "true" },
    });
    await prisma.siteSetting.upsert({
      where: { key: "demo.targetCount" },
      update: { value: "12" },
      create: { key: "demo.targetCount", value: "12" },
    });
    await prisma.siteSetting.upsert({
      where: { key: "demo.rotationIntervalMinutes" },
      update: { value: "15" },
      create: { key: "demo.rotationIntervalMinutes", value: "15" },
    });
    await prisma.siteSetting.upsert({
      where: { key: "demo.lastRotationTime" },
      update: { value: now.toISOString() },
      create: { key: "demo.lastRotationTime", value: now.toISOString() },
    });
    await prisma.siteSetting.upsert({
      where: { key: "demo.nextRotationTime" },
      update: { value: nextRotation.toISOString() },
      create: { key: "demo.nextRotationTime", value: nextRotation.toISOString() },
    });
    console.log("[OK] Generated 12 demo parties successfully.");
  }

  console.log("=== ADMIN SEED COMPLETED SUCCESSFULLY ===");
}

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

