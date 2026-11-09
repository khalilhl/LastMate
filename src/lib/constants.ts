export const VALORANT_RANKS = [
  'Iron 1', 'Iron 2', 'Iron 3',
  'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3',
  'Gold 1', 'Gold 2', 'Gold 3',
  'Platinum 1', 'Platinum 2', 'Platinum 3',
  'Diamond 1', 'Diamond 2', 'Diamond 3',
  'Ascendant 1', 'Ascendant 2', 'Ascendant 3',
  'Immortal 1', 'Immortal 2', 'Immortal 3',
  'Radiant'
] as const;

export const VALORANT_RANK_TIERS = [
  'Iron',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Ascendant',
  'Immortal',
  'Radiant'
] as const;

export const VALORANT_ROLES = [
  'Duelist',
  'Initiator',
  'Controller',
  'Sentinel',
  'Any'
] as const;

export const VALORANT_SERVERS = [
  'Frankfurt (EU Central)',
  'Paris (EU West)',
  'London (EU West)',
  'Stockholm (EU North)',
  'Madrid (EU Southwest)',
  'Warsaw (EU East)',
  'Istanbul (TR)',
  'Bahrain (ME)',
  'Virginia (NA East)',
  'Texas (NA Central)',
  'California (NA West)',
  'Oregon (NA Northwest)',
  'Tokyo (JP)',
  'Singapore (SEA)',
  'Sydney (OCE)',
  'Mumbai (IN)',
  'São Paulo (BR)',
  'Santiago (LATAM)'
] as const;

export const LANGUAGES = [
  'English',
  'French',
  'German',
  'Spanish',
  'Turkish',
  'Russian',
  'Italian',
  'Portuguese',
  'Polish',
  'Arabic',
  'Japanese',
  'Korean',
  'Multi / Any'
] as const;

export function getRankTier(rankName: string): string {
  if (!rankName) return 'Gold';
  const firstWord = rankName.split(' ')[0];
  if (VALORANT_RANK_TIERS.includes(firstWord as any)) {
    return firstWord;
  }
  return 'Gold';
}

export function getRankColor(rankName: string): {
  text: string;
  bg: string;
  border: string;
  glow: string;
  accent: string;
} {
  const tier = getRankTier(rankName).toLowerCase();
  switch (tier) {
    case 'iron':
      return {
        text: 'text-zinc-400',
        bg: 'bg-zinc-800/40',
        border: 'border-zinc-600',
        glow: 'shadow-[0_0_12px_rgba(161,161,170,0.2)]',
        accent: '#7F8590',
      };
    case 'bronze':
      return {
        text: 'text-amber-600',
        bg: 'bg-amber-950/40',
        border: 'border-amber-700/60',
        glow: 'shadow-[0_0_12px_rgba(180,83,9,0.25)]',
        accent: '#B0794C',
      };
    case 'silver':
      return {
        text: 'text-slate-300',
        bg: 'bg-slate-800/50',
        border: 'border-slate-400/50',
        glow: 'shadow-[0_0_12px_rgba(203,213,225,0.25)]',
        accent: '#B9CAD6',
      };
    case 'gold':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/50',
        glow: 'shadow-[0_0_14px_rgba(245,158,11,0.3)]',
        accent: '#EBB338',
      };
    case 'platinum':
      return {
        text: 'text-cyan-400',
        bg: 'bg-cyan-950/40',
        border: 'border-cyan-500/50',
        glow: 'shadow-[0_0_14px_rgba(34,211,238,0.3)]',
        accent: '#2CBDB8',
      };
    case 'diamond':
      return {
        text: 'text-purple-400',
        bg: 'bg-purple-950/40',
        border: 'border-purple-500/50',
        glow: 'shadow-[0_0_15px_rgba(192,132,252,0.35)]',
        accent: '#A970EE',
      };
    case 'ascendant':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/50',
        glow: 'shadow-[0_0_15px_rgba(52,211,153,0.35)]',
        accent: '#19C978',
      };
    case 'immortal':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/50',
        glow: 'shadow-[0_0_16px_rgba(251,113,133,0.4)]',
        accent: '#EA3867',
      };
    case 'radiant':
      return {
        text: 'text-yellow-300',
        bg: 'bg-yellow-950/50',
        border: 'border-yellow-400/80',
        glow: 'shadow-[0_0_20px_rgba(253,224,71,0.5)]',
        accent: '#FFE873',
      };
    default:
      return {
        text: 'text-zinc-300',
        bg: 'bg-zinc-800/40',
        border: 'border-zinc-700',
        glow: 'none',
        accent: '#9CA3AF',
      };
  }
}

export const RANK_VALUES: Record<string, number> = {
  'Iron 1': 1, 'Iron 2': 2, 'Iron 3': 3,
  'Bronze 1': 4, 'Bronze 2': 5, 'Bronze 3': 6,
  'Silver 1': 7, 'Silver 2': 8, 'Silver 3': 9,
  'Gold 1': 10, 'Gold 2': 11, 'Gold 3': 12,
  'Platinum 1': 13, 'Platinum 2': 14, 'Platinum 3': 15,
  'Diamond 1': 16, 'Diamond 2': 17, 'Diamond 3': 18,
  'Ascendant 1': 19, 'Ascendant 2': 20, 'Ascendant 3': 21,
  'Immortal 1': 22, 'Immortal 2': 23, 'Immortal 3': 24,
  'Radiant': 25,
};

