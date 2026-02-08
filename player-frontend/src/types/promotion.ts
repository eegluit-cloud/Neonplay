export interface Promotion {
    id: string;
    name: string;
    slug: string;
    code: string | null;
    type: string; // 'deposit', 'no_deposit', 'spin_wheel', 'daily_login', etc.
    description: string | null;
    imageUrl: string | null;
    bonusAmount: number | null;
    percentageBonus: number | null;
    wageringRequirement: number | null;
    minDeposit: number | null;
    maxClaims: number | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    terms: string | null;
}
