export type ValorantRankTier =
  | 'Unranked'
  | 'Iron'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Ascendant'
  | 'Immortal'
  | 'Radiant';

export type ValorantRole = 'Duelist' | 'Initiator' | 'Controller' | 'Sentinel' | 'Any';

export type PartyStatus = 'Looking for players' | 'Full' | 'In Game' | 'Closed' | 'Expired';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER';

export type UserAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  riotId?: string | null;
  rank: string;
  mainRole: string;
  preferredServer: string;
  languages: string;
  discordUsername?: string | null;
  bio?: string | null;
  role: UserRole;
  status: UserAccountStatus;
  banReason?: string | null;
  suspendedUntil?: string | Date | null;
  lastLoginAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  _count?: {
    parties?: number;
    reports?: number;
  };
}

export type PartyType = 'REAL' | 'DEMO';

export interface PartySummary {
  id: string;
  ownerId: string;
  name: string;
  partyCode: string | null;
  partyType: PartyType;
  currentPlayers: number;
  maxPlayers: number;
  requiredRank: string;
  averageRank: string;
  preferredRole: string;
  server: string;
  language: string;
  voiceChatRequired: boolean;
  description: string;
  status: PartyStatus | string;
  discordContact?: string | null;
  copyCount?: number;
  closedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  expiresAt?: string | Date | null;
  isFull?: boolean;
  isExpired?: boolean;
  owner?: {
    id: string;
    username: string;
    email?: string;
    avatar?: string | null;
    riotId?: string | null;
    rank: string;
    role?: string;
    status?: string;
  };
  _count?: {
    reports?: number;
  };
}

export interface ReportSummary {
  id: string;
  partyId: string;
  party?: PartySummary;
  reporterId?: string | null;
  reporter?: {
    id: string;
    username: string;
    email: string;
    rank: string;
  } | null;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  moderatorNotes?: string | null;
  resolvedAt?: string | Date | null;
  resolverId?: string | null;
  resolver?: {
    id: string;
    username: string;
  } | null;
  createdAt: string | Date;
}

export interface AdminLogSummary {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string | Date;
}

export interface SiteSettingItem {
  id?: string;
  key: string;
  value: string;
  updatedAt?: string | Date;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'MAINTENANCE' | 'PROMO';
  isActive: boolean;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  createdBy?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  totalParties: number;
  activeParties: number;
  lookingForPlayersParties: number;
  fullParties: number;
  expiredParties: number;
  totalPartyCopies: number;
  totalReports: number;
  pendingReports: number;
  registrationsByDate: { date: string; count: number }[];
  partiesByDate: { date: string; count: number }[];
  partiesByStatus: { status: string; count: number }[];
  partiesByRank: { rank: string; count: number }[];
  partiesByServer: { server: string; count: number }[];
}

export interface FilterState {
  search: string;
  rank: string;
  server: string;
  role: string;
  language: string;
  voiceChat: string; // 'all' | 'required' | 'optional'
  availableSlots: string; // 'all' | '1' | '2' | '3+'
  sortBy: 'newest' | 'rank_desc' | 'updated';
  partyType?: 'all' | 'REAL' | 'DEMO';
}

export interface PlatformStats {
  activeParties: number;
  playersSearching: number;
  partiesCompleted: number;
  totalPartiesCreated: number;
}
