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

  console.log("=== ADMIN SEED COMPLETED SUCCESSFULLY ===");
}

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

