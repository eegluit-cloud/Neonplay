import { useMemo } from 'react';
import { useVipLevels, useVipStatus } from './useVIP';
import { useAuth } from '@/contexts/AuthContext';
import starterBadge from "@/assets/badges/starter.png";
import silverNewBadge from "@/assets/badges/silver-new.png";
import goldBadge from "@/assets/badges/gold.png";
import silverBadge from "@/assets/badges/silver.png";
import diamondBadge from "@/assets/badges/diamond.png";

// VIP Level Configuration - local badge mapping
const VIP_BADGE_MAP: Record<string, string> = {
  'bronze': starterBadge,
  'silver': silverNewBadge,
  'gold': goldBadge,
  'platinum': silverBadge,
  'diamond': diamondBadge,
};

const VIP_TIER_CLASSES: Record<string, string> = {
  'bronze': 'bg-amber-700/60 text-amber-200',
  'silver': 'bg-gray-500/60 text-gray-200',
  'gold': 'bg-yellow-500/60 text-yellow-100',
  'platinum': 'bg-slate-400/60 text-slate-100',
  'diamond': 'bg-cyan-500/60 text-cyan-100',
};

// Legacy VIP_TIERS for backward compatibility
export const VIP_TIERS: Record<number, { name: string; badgeClass: string; badge: string }> = {
  1: { name: 'Bronze', badgeClass: 'bg-amber-700/60 text-amber-200', badge: starterBadge },
  2: { name: 'Silver', badgeClass: 'bg-gray-500/60 text-gray-200', badge: silverNewBadge },
  3: { name: 'Gold', badgeClass: 'bg-yellow-500/60 text-yellow-100', badge: goldBadge },
  4: { name: 'Platinum', badgeClass: 'bg-slate-400/60 text-slate-100', badge: silverBadge },
  5: { name: 'Diamond', badgeClass: 'bg-cyan-500/60 text-cyan-100', badge: diamondBadge },
};

export interface VIPLevelInfo {
  level: number;
  name: string;
  benefits: string[];
  color: string;
  badgeColor: string;
  tierBadgeClass: string;
  progressToNext: number;
  xpToNext: number;
}

/**
 * Centralized user VIP status hook.
 * This is the single source of truth for VIP level across the app.
 * Fetches from API when authenticated, falls back to defaults for guests.
 */
export function useUserVIP() {
  const { isAuthenticated } = useAuth();
  const { status, isLoading: statusLoading } = useVipStatus();
  const { levels, isLoading: levelsLoading } = useVipLevels();

  const vipData = useMemo(() => {
    // Default values for non-authenticated users
    const defaults = {
      level: 1,
      tierName: 'Bronze',
      tierLabel: 'VIP 1',
      tierBadgeClass: VIP_TIER_CLASSES['bronze'],
      tierBadge: VIP_BADGE_MAP['bronze'],
      currentPoints: 0,
      nextLevelPoints: 10000,
      progressPercent: 0,
      xpToNext: 10000,
      nextLevel: 2,
      nextLevelLabel: 'VIP 2',
      isLoading: statusLoading || levelsLoading,
    };

    if (!isAuthenticated || !status) {
      return defaults;
    }

    const currentLevel = status.currentLevel;
    const currentPoints = status.currentXp;
    const nextLevelPoints = status.xpToNextLevel + status.currentXp;
    const progressPercent = status.progressPercent;
    const xpToNext = status.xpToNextLevel;

    // Get badge and class from API data or fallback to local mapping
    const tierSlug = currentLevel?.name?.toLowerCase() || 'bronze';
    const tierBadge = currentLevel?.iconUrl || VIP_BADGE_MAP[tierSlug] || starterBadge;
    const tierBadgeClass = VIP_TIER_CLASSES[tierSlug] || VIP_TIER_CLASSES['bronze'];

    return {
      level: currentLevel?.level || 1,
      tierName: currentLevel?.name || 'Bronze',
      tierLabel: `VIP ${currentLevel?.level || 1}`,
      tierBadgeClass,
      tierBadge,
      currentPoints,
      nextLevelPoints,
      progressPercent,
      xpToNext,
      nextLevel: status.nextLevel?.level || null,
      nextLevelLabel: status.nextLevel ? `VIP ${status.nextLevel.level}` : null,
      isLoading: statusLoading || levelsLoading,
      // Include full level data for components that need it
      allLevels: levels,
      currentLevelData: currentLevel,
      nextLevelData: status.nextLevel,
    };
  }, [isAuthenticated, status, levels, statusLoading, levelsLoading]);

  return vipData;
}
