import { Promotion } from '@/types/promotion';
import { Button } from '@/components/ui/button';
import { Info, Calendar, Coins, Sparkles, Trophy, Gift } from 'lucide-react';
import { useState } from 'react';
import { promotionsApi } from '@/lib/api';
import { toast } from 'sonner';

interface DynamicPromotionCardProps {
    promotion: Promotion;
    onClaim?: () => void;
}

export function DynamicPromotionCard({ promotion, onClaim }: DynamicPromotionCardProps) {
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClaim = async () => {
        if (isClaiming) return;

        setIsClaiming(true);
        try {
            await promotionsApi.claim(promotion.slug);
            toast.success('Promotion claimed successfully!');
            if (onClaim) onClaim();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to claim promotion');
        } finally {
            setIsClaiming(false);
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
        if (promotion.bonusAmount) return `$${promotion.bonusAmount}`;
        if (promotion.percentageBonus) return `${promotion.percentageBonus}% Match`;
        return 'Bonus';
    };

    const [imageError, setImageError] = useState(false);

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
                </div>

                {/* Footer / Actions */}
                <div className="mt-auto pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                    {promotion.endsAt && (
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Expires {new Date(promotion.endsAt).toLocaleDateString()}</span>
                        </div>
                    )}

                    <Button
                        onClick={handleClaim}
                        disabled={isClaiming || !promotion.isActive}
                        size="sm"
                        className="ml-auto bg-white text-black hover:bg-white/90 border-none font-bold shadow-lg shadow-black/20"
                    >
                        {isClaiming ? (
                            <>
                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></span>
                                Claiming...
                            </>
                        ) : (
                            'Claim Now'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
