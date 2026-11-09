const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with demo VALORANT parties...");

  // Clean up existing data
  await prisma.report.deleteMany({});
  await prisma.party.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // Create demo users
  const user1 = await prisma.user.create({
    data: {
      username: "ViperQueen",
      email: "viper@lastmate.gg",
      passwordHash,
      riotId: "ViperQueen#EUW",
      rank: "Ascendant 2",
      mainRole: "Controller",
      preferredServer: "Frankfurt (EU Central)",
      languages: "English, German",
      discordUsername: "viperqueen_val",
      bio: "Lineups ready on Bind and Breeze. Looking for serious, non-toxic climbers.",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "SovaGod77",
      email: "sova@lastmate.gg",
      passwordHash,
      riotId: "SovaGod#1337",
      rank: "Diamond 3",
      mainRole: "Initiator",
      preferredServer: "Paris (EU West)",
      languages: "English, French",
      discordUsername: "sovagod#0001",
      bio: "Shock dart lineups for days. Playing daily from 8 PM CET.",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: "JettEntryOnly",
      email: "jett@lastmate.gg",
      passwordHash,
      riotId: "Jett#WKEY",
      rank: "Immortal 1",
      mainRole: "Duelist",
      preferredServer: "London (EU West)",
      languages: "English",
      discordUsername: "jett_diff",
      bio: "Aggressive entry fragger. Looking for smoke support and flashers.",
    },
  });

  const user4 = await prisma.user.create({
    data: {
      username: "GrimWaller",
      email: "grim@lastmate.gg",
      passwordHash,
      riotId: "GrimWall#WALL",
      rank: "Platinum 2",
      mainRole: "Sentinel",
      preferredServer: "Stockholm (EU North)",
      languages: "English, Swedish",
      discordUsername: "grimwaller_sage",
      bio: "Battle Sage with unconventional walls. Good comms only.",
    },
  });

  const user5 = await prisma.user.create({
    data: {
      username: "RadiantDreamer",
      email: "radiant@lastmate.gg",
      passwordHash,
      riotId: "AimGod#RAD",
      rank: "Radiant",
      mainRole: "Duelist",
      preferredServer: "Frankfurt (EU Central)",
      languages: "English",
      discordUsername: "radiant_aimer",
      bio: "Top 500 grinding radiant lobbies. Need competent smokes or initiator.",
    },
  });

  const user6 = await prisma.user.create({
    data: {
      username: "ChillGoldBro",
      email: "goldbro@lastmate.gg",
      passwordHash,
      riotId: "GoldEnjoyer#420",
      rank: "Gold 2",
      mainRole: "Any",
      preferredServer: "Madrid (EU Southwest)",
      languages: "English, Spanish",
      discordUsername: "chillgold",
      bio: "Casual games after work, chill vibes and no tilting.",
    },
  });

  // Demo parties
  const demoParties = [
    {
      ownerId: user1.id,
      name: "Night Owls (Ascendant Grind)",
      partyCode: "DEMO-X7K92",
      currentPlayers: 4,
      maxPlayers: 5,
      requiredRank: "Diamond 3",
      averageRank: "Ascendant 2",
      preferredRole: "Controller",
      server: "Frankfurt (EU Central)",
      language: "English",
      voiceChatRequired: true,
      description: "Pushing to Immortal tonight! Need a solid Controller who knows basic post-plant smoke lineups. Good comms, positive attitude, no raging.",
      status: "Looking for players",
      discordContact: "viperqueen_val",
    },
    {
      ownerId: user2.id,
      name: "Tactical Executioners",
      partyCode: "DEMO-P4Q88",
      currentPlayers: 4,
      maxPlayers: 5,
      requiredRank: "Diamond 1",
      averageRank: "Diamond 3",
      preferredRole: "Duelist",
      server: "Paris (EU West)",
      language: "English",
      voiceChatRequired: true,
      description: "Stack of 4 friendly players. We have Sova, Omen, Killjoy, and Fade ready. We just need an assertive Duelist (Reyna/Jett/Raze) to lead entry.",
      status: "Looking for players",
      discordContact: "sovagod#0001",
    },
    {
      ownerId: user3.id,
      name: "Immortal Trio + 1 Looking For 5th",
      partyCode: "DEMO-IMM77",
      currentPlayers: 4,
      maxPlayers: 5,
      requiredRank: "Ascendant 3",
      averageRank: "Immortal 1",
      preferredRole: "Sentinel",
      server: "London (EU West)",
      language: "English",
      voiceChatRequired: true,
      description: "High elo 5-stack looking for a Cypher or Killjoy lock to anchor B sites. Consistent calls and mic strictly required.",
      status: "Looking for players",
      discordContact: "jett_diff",
    },
    {
      ownerId: user4.id,
      name: "Chill Plat/Gold Friday Queue",
      partyCode: "DEMO-GLD33",
      currentPlayers: 4,
      maxPlayers: 5,
      requiredRank: "Gold 1",
      averageRank: "Platinum 2",
      preferredRole: "Any",
      server: "Stockholm (EU North)",
      language: "English",
      voiceChatRequired: false,
      description: "Relaxed competitive games. Mic is optional as long as you ping and play with the team. Everyone welcome!",
      status: "Looking for players",
      discordContact: "grimwaller_sage",
    },
    {
      ownerId: user5.id,
      name: "Radiant 5-Stack Ladder",
      partyCode: "DEMO-RAD01",
      currentPlayers: 4,
      maxPlayers: 5,
      requiredRank: "Immortal 3",
      averageRank: "Radiant",
      preferredRole: "Initiator",
      server: "Frankfurt (EU Central)",
      language: "English",
      voiceChatRequired: true,
      description: "Need an Initiator (Breach or Fade specialist) for fast retakes and flash combos. Must have previous Immortal 3 / Radiant badge.",
      status: "Looking for players",
      discordContact: "radiant_aimer",
    },
    {
      ownerId: user6.id,
      name: "Goldies Climbing to Plat",
      partyCode: "DEMO-ESP44",
      currentPlayers: 3,
      maxPlayers: 5,
      requiredRank: "Silver 3",
      averageRank: "Gold 2",
      preferredRole: "Controller",
      server: "Madrid (EU Southwest)",
      language: "English",
      voiceChatRequired: true,
      description: "Looking for 2 players! Smokes preferred. We want to rank up together this weekend. Let's get these wins!",
      status: "Looking for players",
      discordContact: "chillgold",
    },
    {
      ownerId: user1.id,
      name: "Late Night Scrim Warmup",
      partyCode: "DEMO-FULL9",
      currentPlayers: 5,
      maxPlayers: 5,
      requiredRank: "Ascendant 1",
      averageRank: "Ascendant 3",
      preferredRole: "Duelist",
      server: "Frankfurt (EU Central)",
      language: "English",
      voiceChatRequired: true,
      description: "Squad was completed, currently playing matches.",
      status: "Full",
      discordContact: "viperqueen_val",
    },
    {
      ownerId: user2.id,
      name: "Competitive Match in Session",
      partyCode: "DEMO-PLAY5",
      currentPlayers: 5,
      maxPlayers: 5,
      requiredRank: "Diamond 2",
      averageRank: "Diamond 3",
      preferredRole: "Any",
      server: "Paris (EU West)",
      language: "English",
      voiceChatRequired: true,
      description: "Currently in an active match on Ascent.",
      status: "In Game",
      discordContact: "sovagod#0001",
    },
  ];

  for (const p of demoParties) {
    await prisma.party.create({ data: p });
  }

  console.log(`Seeded ${demoParties.length} demo parties and 6 users successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

