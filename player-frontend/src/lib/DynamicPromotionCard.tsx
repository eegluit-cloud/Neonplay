import { Promotion } from '@/types/promotion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Info, Calendar, Coins, Sparkles, Trophy, Gift, GamepadIcon, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { promotionsApi, bonusApi } from '@/lib/api';
import { toast } from 'sonner';

export interface WageringProgress {
    wagered: number;           // USDC wagered so far
    target: number;            // USDC required (bonusAmountUsdc × wageringRequirement)
    currency: string;          // bonus credit currency (e.g. 'USDC', 'USD')
    isCredited: boolean;       // true = bonus already in wallet
    userPromotionId?: string;  // needed to call POST /bonus/:id/claim
}

interface DynamicPromotionCardProps {
    promotion: Promotion;
    onClaim?: () => void;
    isClaimed?: boolean;
    wageringProgress?: WageringProgress;
}

interface EligibleGame {
    gameId: string;
    gameName: string;
    slug: string;
    thumbnailUrl?: string;
    providerName?: string;
    contributionPercent: number;
}

export function DynamicPromotionCard({ promotion, onClaim, isClaimed = false, wageringProgress }: DynamicPromotionCardProps) {
    const [isClaiming, setIsClaiming] = useState(false);
    const [showGames, setShowGames] = useState(false);
    const [eligibleGames, setEligibleGames] = useState<EligibleGame[] | null>(null);
    const [gamesLoading, setGamesLoading] = useState(false);
    const [hasWhitelist, setHasWhitelist] = useState(true);

    const handleClaim = async () => {
        if (isClaiming) return;

        setIsClaiming(true);
        try {
            const res = await promotionsApi.claim(promotion.slug);
            if (res.data?.wagerFirst) {
                toast.success('Bonus activated! Wager to unlock your reward.');
            } else {
                toast.success('Bonus claimed! Funds added to your wallet.');
            }
            if (onClaim) onClaim();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to claim promotion');
        } finally {
            setIsClaiming(false);
        }
    };

    const handleClaimBonus = async () => {
        if (isClaiming || !wageringProgress?.userPromotionId) return;
        setIsClaiming(true);
        try {
            await bonusApi.claimUserBonus(wageringProgress.userPromotionId);
            toast.success('Bonus claimed! Funds added to your wallet.');
            if (onClaim) onClaim();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to claim bonus');
        } finally {
            setIsClaiming(false);
        }
    };

    const handleViewGames = async () => {
        if (!wageringProgress?.userPromotionId) return;
        setShowGames(true);
        if (eligibleGames !== null) return; // already loaded
        setGamesLoading(true);
        try {
            const res = await bonusApi.getEligibleGames(wageringProgress.userPromotionId);
            setEligibleGames(res.data.games);
            setHasWhitelist(res.data.hasWhitelist);
        } catch {
            setEligibleGames([]);
        } finally {
            setGamesLoading(false);
        }
    };

    // Determine gradient based on type
    const getGradient = () => {
        switch (promotion.type) {
            case 'deposit':
                return 'from-blue-600 to-cyan-500';
            case 'no_deposit':
                return 'from-purple-600 to-pink-500';
            case 'spin_wheel':
                return 'from-red-600 to-orange-500';
            case 'cashback':
                return 'from-emerald-600 to-teal-500';
            default:
                return 'from-slate-700 to-slate-800';
        }
    };

    // Determine icon based on type
    const getIcon = () => {
        switch (promotion.type) {
            case 'deposit':
                return <Coins className="w-8 h-8 text-white" />;
            case 'no_deposit':
                return <Gift className="w-8 h-8 text-white" />;
            case 'spin_wheel':
                return <Sparkles className="w-8 h-8 text-white" />;
            case 'cashback':
                return <Trophy className="w-8 h-8 text-white" />;
            default:
                return <Info className="w-8 h-8 text-white" />;
        }
    };

    // Format amount for display
    const getAmountDisplay = () => {
        if (promotion.bonusAmount) {
            const currency = promotion.bonusCurrency || 'USDC';
            return `${promotion.bonusAmount} ${currency}`;
        }
        if (promotion.percentageBonus) return `${promotion.percentageBonus}% Match`;
        return 'Bonus';
    };

    const [imageError, setImageError] = useState(false);

    // Wagering state derived from props
    // Show progress bar whenever wagering is required and not yet complete
    const wageringIncomplete = !!wageringProgress && wageringProgress.wagered < wageringProgress.target;
    // Wagering done but bonus not yet in wallet — show Claim button
    const wageringDoneAwaitingClaim = !!wageringProgress && !wageringIncomplete && !wageringProgress.isCredited && !!wageringProgress.userPromotionId;
    // Wager-first: bonus NOT yet credited, must wager first to unlock
    const isWagerToUnlock = wageringIncomplete && !!wageringProgress && !wageringProgress.isCredited;
    const progressPct = wageringProgress
        ? Math.min(100, (wageringProgress.wagered / wageringProgress.target) * 100)
        : 0;
    const remaining = wageringProgress
        ? Math.max(0, wageringProgress.target - wageringProgress.wagered).toFixed(2)
        : '0';

    return (
        <div className={`relative rounded-xl overflow-hidden border border-white/10 ${!promotion.imageUrl || imageError ? `bg-gradient-to-br ${getGradient()}` : 'bg-zinc-900'} shadow-lg group hover:shadow-xl transition-all duration-300`}>
            {promotion.imageUrl && !imageError ? (
                <>
                    <img
                        src={promotion.imageUrl.startsWith('http') ? promotion.imageUrl : `${import.meta.env.VITE_ADMIN_URL || 'http://localhost:8002'}${promotion.imageUrl}`}
                        alt={promotion.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                        onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </>
            ) : (
                <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay"></div>
            )}

            <div className="relative p-5 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        {getIcon()}
                    </div>
                    {promotion.isActive && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded-md border border-green-500/20">
                            Active
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                        {promotion.name}
                    </h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                        {promotion.description || "Limited time offer! Claim your bonus now."}
                    </p>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                            <p className="text-white/50 text-[10px] uppercase tracking-wider">Bonus</p>
                            <p className="text-white font-bold">{getAmountDisplay()}</p>
                        </div>
                        {promotion.wageringRequirement && (
                            <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                                <p className="text-white/50 text-[10px] uppercase tracking-wider">Wager</p>
                                <p className="text-white font-bold">{promotion.wageringRequirement}x</p>
                            </div>
                        )}
                    </div>

                    {/* Wagering Progress Bar (shown when wagering is required but not yet complete) */}
                    {wageringIncomplete && (
                        <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-white/60 text-[10px] uppercase tracking-wider">Wagering Progress</p>
                                <p className="text-white/80 text-[10px] font-semibold">{progressPct.toFixed(0)}%</p>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                            <p className="text-white/50 text-[10px] mt-1">
                                {Number(wageringProgress!.wagered).toFixed(2)} / {Number(wageringProgress!.target).toFixed(2)} USDC wagered
                                {Number(remaining) > 0 && ` · ${remaining} USDC remaining`}
                            </p>
                            {wageringProgress?.userPromotionId && (
                                <button
                                    onClick={handleViewGames}
                                    className="flex items-center gap-1 mt-2 text-amber-400/80 hover:text-amber-400 text-[10px] font-semibold transition-colors"
                                >
                                    <GamepadIcon className="w-3 h-3" />
                                    View eligible games
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="mt-auto pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                    {promotion.endsAt && (
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Expires {new Date(promotion.endsAt).toLocaleDateString()}</span>
                        </div>
                    )}

                    {wageringIncomplete ? (
                        // Wagering still in progress — show remaining wager
                        <div className="ml-auto text-right">
                            <span className="px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-md">
                                Wager {remaining} USDC to unlock
                            </span>
                        </div>
                    ) : wageringDoneAwaitingClaim ? (
                        // Wagering complete — show Claim Bonus button
                        <Button
                            onClick={handleClaimBonus}
                            disabled={isClaiming}
                            size="sm"
                            className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none font-bold shadow-lg shadow-green-500/30"
                        >
                            {isClaiming ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                    Claiming...
                                </>
                            ) : (
                                '🎉 Claim Bonus'
                            )}
                        </Button>
                    ) : isClaimed ? (
                        // Bonus already in wallet
                        <Button
                            disabled
                            size="sm"
                            className="ml-auto bg-green-500/20 text-green-400 border border-green-500/30 font-bold cursor-default"
                        >
                            ✓ Claimed
                        </Button>
                    ) : (
                        <Button
                            onClick={handleClaim}
                            disabled={isClaiming || !promotion.isActive}
                            size="sm"
                            className="ml-auto bg-white text-black hover:bg-white/90 border-none font-bold shadow-lg shadow-black/20"
                        >
                            {isClaiming ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></span>
                                    Activating...
                                </>
                            ) : promotion.wageringRequirement ? (
                                'Activate Bonus'
                            ) : (
                                'Claim Now'
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>

        {/* ── Eligible Games Sheet ── */}
        <Sheet open={showGames} onOpenChange={setShowGames}>
            <SheetContent side="bottom" className="max-h-[80vh] bg-zinc-900 border-zinc-700 overflow-y-auto">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-white flex items-center gap-2">
                        <GamepadIcon className="w-5 h-5 text-amber-400" />
                        Eligible Games for Wagering
                    </SheetTitle>
                    <p className="text-zinc-400 text-sm">
                        {!hasWhitelist
                            ? 'All games count toward your wagering requirement at 100%.'
                            : 'Only these games count toward your wagering requirement.'}
                    </p>
                </SheetHeader>

                {gamesLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    </div>
                ) : !hasWhitelist ? (
                    <div className="text-center py-10">
                        <GamepadIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-300 font-semibold">All games are eligible</p>
                        <p className="text-zinc-500 text-sm mt-1">Play any game to contribute 100% toward your wagering.</p>
                    </div>
                ) : eligibleGames && eligibleGames.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-zinc-400">No eligible games configured. Contact support.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-6">
                        {(eligibleGames || []).map((game) => (
                            <div
                                key={game.gameId}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 hover:border-amber-500/40 transition-colors"
                            >
                                {game.thumbnailUrl ? (
                                    <img
                                        src={game.thumbnailUrl}
                                        alt={game.gameName}
                                        className="w-full aspect-video object-cover rounded-lg"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full aspect-video bg-zinc-700 rounded-lg flex items-center justify-center text-2xl">🎮</div>
                                )}
                                <div className="w-full text-center">
                                    <p className="text-white text-xs font-semibold truncate">{game.gameName}</p>
                                    {game.providerName && (
                                        <p className="text-zinc-500 text-[10px] truncate">{game.providerName}</p>
                                    )}
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/15 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/25">
                                        {game.contributionPercent}% contribution
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
