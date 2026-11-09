# LastMate 🎮 — VALORANT Squad & Party Finder

**"Find Your Last. Win Together."**

LastMate is a modern, esports-grade web platform designed for VALORANT players to find their missing teammates by sharing and discovering official in-game party codes.

---

## 📌 1. Project Concept & Important Note

- **How it works:** A 4-stack generates their official party code directly inside the VALORANT game client. The party leader publishes it on LastMate with their rank, server, needed role, and voice preferences. Solo players browse squads, copy the party code, and paste it into VALORANT to join immediately.
- **Game Integrity Notice:** LastMate does **not** inject into VALORANT, generate unofficial party codes, or access private Riot game files. All party codes are generated legitimately in-game by players and manually published on the platform.

---

## 🚀 2. Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS with custom esports VALORANT palette (Radiant Red `#FF4655`, Abyssal Void `#0B0E14`, Off-White `#ECE8E1`)
- **Icons:** Lucide React
- **Database & ORM:** SQLite (zero external installation needed out of the box) with Prisma ORM (swappable to PostgreSQL via `DATABASE_URL` in `.env`)
- **Authentication:** JWT sessions with HTTP-only cookies and `bcryptjs` password hashing
- **Notifications:** Responsive toast notification system with clipboard feedback

---

## 📂 3. Project Structure

```text
last_valorant/
├── prisma/
│   ├── schema.prisma        # Database schema (User, Party, Report)
│   ├── dev.db               # SQLite database file
│   └── seed.js              # Realistic demo parties & accounts seeder
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout (Navbar, Footer, ToastProvider, AuthProvider)
│   │   ├── page.tsx         # Landing Home Page (Hero, Stats, Featured, How It Works)
│   │   ├── globals.css      # VALORANT theme tokens & custom styling
│   │   ├── parties/
│   │   │   ├── page.tsx     # Party Browse & Filter page (Search, Ranks, Roles, Servers)
│   │   │   ├── create/      # Publish Party Code form with validation
│   │   │   └── [id]/        # Party details, copy code, report modal, owner tools
│   │   ├── profile/         # User profile, rank/server settings, party manager
│   │   ├── login/           # Sign In page (with 1-click Demo credentials)
│   │   ├── register/        # Sign Up page
│   │   ├── terms/           # Terms of Service & Riot Disclaimer
│   │   ├── privacy/         # Privacy Policy
│   │   ├── contact/         # Contact & support form
│   │   └── api/
│   │       ├── auth/        # /login, /register, /logout, /me
│   │       ├── parties/     # /parties (GET/POST), /[id] (GET/PATCH/DELETE), /[id]/report
│   │       └── users/       # /profile (PATCH)
│   ├── components/
│   │   ├── layout/          # Navbar, Footer
│   │   └── parties/         # PartyCard, PartyCodeDisplay, CopyCodeButton, RankBadge,
│   │                        # RoleBadge, ServerBadge, PartyStatusBadge, PartyFilters,
│   │                        # ReportModal, EditPartyModal, DeleteConfirmModal
│   ├── context/
│   │   ├── AuthContext.tsx  # User session & profile context
│   │   └── ToastContext.tsx # Toast alerts (Copy Party Code, Updates, Errors)
│   └── lib/
│       ├── auth.ts          # Password hashing, JWT token sign/verify
│       ├── constants.ts     # VALORANT ranks, tiers, colors, servers, roles
│       ├── prisma.ts        # PrismaClient singleton
│       ├── types.ts         # TypeScript definitions
│       └── utils.ts         # Utility helpers & relative time formatting
├── .env                     # Environment configuration
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚡ 4. Quick Start & Installation

### Prerequisites
- Node.js 18.17+ or 20+

### Steps

1. **Clone or enter the directory:**
   ```bash
   cd last_valorant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the Database & Seed Demo Data:**
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 👑 5. Super Admin Dashboard & Staff Accounts

LastMate includes a full-featured, secure command center at `/admin` protected by server-side Role-Based Access Control (RBAC).

### Staff Accounts (Seeded via `prisma/seed-admin.js`)

| Role | Username / Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | `superadmin@lastmate.gg` | `SuperAdmin2026!` | Full root access: Staff management, site settings, maintenance mode, system exports, logs |
| **ADMIN** | `admin@lastmate.gg` | `password123` | User moderation, party overrides, reports resolution, announcement management |
| **MODERATOR** | `moderator@lastmate.gg` | `password123` | Review reports, dismiss/resolve infractions, party monitoring |

### Admin Dashboard Sections (`/admin`)

- **Overview (`/admin`)**: 12 real-time KPIs (Active users, parties, reports, code copy counts), 14-day velocity SVG charts, server & rank distributions, recent activity feeds.
- **User Management (`/admin/users`)**: Search by Riot ID/email/username, role modification (hierarchy gated), ban/unban with custom reasons, timed suspensions (24h, 7d, 30d, permanent), deletion.
- **Party Management (`/admin/parties`)**: Real-time lobby monitor, status overrides (`Looking for players`, `Full`, `In Game`, `Closed`, `Expired`), party code copy tracking, bulk actions.
- **Reports & Moderation (`/admin/reports`)**: Incident queue, review modal with internal moderation notes, one-click host sanctioning, and party takedowns.
- **Content Management (`/admin/content`)**: Real-time announcements, promotional banners, and maintenance alerts displayed live on public site.
- **Deep Analytics (`/admin/analytics`)**: Conversion rates, code copy velocity, rank distribution metrics, and instant CSV exports (`/api/admin/analytics/export`).
- **Staff Administration (`/admin/admins`)**: Super Admin-exclusive staff management, promotion and demotion.
- **Activity Logs (`/admin/logs`)**: Immutable audit trail of every administrative action with full JSON diff payloads.
- **System Settings (`/admin/settings`)**: Persisted controls for general metadata, maintenance mode toggle, maximum party size, registration gates, and rate limits.

---

## 🔑 6. Demo Player Accounts

For testing general matchmaking features (password for all: `password123`):

| Username | Email | Rank | Role | Server |
| :--- | :--- | :--- | :--- | :--- |
| **ViperQueen** | `viper@lastmate.gg` | Ascendant 2 | Controller | Frankfurt (EU Central) |
| **SovaGod77** | `sova@lastmate.gg` | Diamond 3 | Initiator | Paris (EU West) |
| **RadiantDreamer** | `radiant@lastmate.gg` | Radiant | Duelist | Frankfurt (EU Central) |
| **JettEntryOnly** | `jett@lastmate.gg` | Immortal 1 | Duelist | London (EU West) |
| **GrimWaller** | `grim@lastmate.gg` | Platinum 2 | Sentinel | Stockholm (EU North) |
| **ChillGoldBro** | `goldbro@lastmate.gg` | Gold 2 | Any | Madrid (EU Southwest) |

---

## ⚙️ 7. Environment Variables (`.env`)

```env
# Database connection (SQLite default, or PostgreSQL url)
DATABASE_URL="file:./dev.db"

# JWT Secret for session cookies
JWT_SECRET="lastmate-super-secret-jwt-key-valorant-2026-production-ready"

# Base Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

To switch to PostgreSQL in production:
1. Update `provider = "postgresql"` in `prisma/schema.prisma`.
2. Change `DATABASE_URL` in `.env` to your PostgreSQL connection string.
3. Run `npx prisma db push`.

---

## 🛡️ 8. Key Features Implemented

1. **Esports VALORANT Visual Identity:** Deep obsidian/charcoal background (`#0B0E14`), signature VALORANT red (`#FF4655`), glowing rank badges (Iron to Radiant), role indicators (Duelist, Initiator, Controller, Sentinel), and cyber borders.
2. **One-Click Party Code Copying:** Copy button copies official code to clipboard, temporarily updates label to "Copied", and triggers toast: `"Party code copied!"`.
3. **Multi-Criteria Filtering & Sorting:** Filter by rank tier, server region, needed agent role, language, mic requirement, and available player slots (4/5, 3/5, etc.). Sort by newest, highest rank, or recently updated.
4. **Publish Party Form with Strict Validation:** Ensures code, server, and rank are provided, enforces maximum 5 players, and verifies at least 1 open slot is available.
5. **Party Management & Auto-Full Status:** Party owners can edit announcement details, update current players, mark as Full/In Game/Closed, and delete with a confirmation modal. Reaching 5/5 players automatically sets status to Full.
6. **Community Safety:** Report system with modal dialog, structured report categories, and database logging.
7. **Complete User Authentication & Profiles:** Secure bcrypt password hashing, HTTP-only JWT cookies, user profile editing (Riot ID, rank, main role, preferred server, discord handle, bio).

