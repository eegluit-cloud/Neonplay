import { createContext, useContext, useState, ReactNode } from 'react';

export interface BetSelection {
  id: string;
  eventId: string;
  matchName: string;
  market: string; // "1", "draw", "2"
  marketType: string; // "1x2"
  odds: number;
  league: string;
  homeTeam?: { name: string; logoUrl?: string };
  awayTeam?: { name: string; logoUrl?: string };
}

interface BetslipContextType {
  selections: BetSelection[];
  stake: number;
  quickBetEnabled: boolean;
  isOpen: boolean;
  activeTab: 'single' | 'combo' | 'system';
  addSelection: (selection: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  setStake: (stake: number) => void;
  toggleQuickBet: () => void;
  openBetslip: () => void;
  closeBetslip: () => void;
  toggleBetslip: () => void;
  setActiveTab: (tab: 'single' | 'combo' | 'system') => void;
  totalOdds: number;
  potentialWin: number;
}

const BetslipContext = createContext<BetslipContextType | undefined>(undefined);

export function BetslipProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState(5);
  const [quickBetEnabled, setQuickBetEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'combo' | 'system'>('single');

  const addSelection = (selection: BetSelection) => {
    setSelections((prev) => {
      // Remove if same event already selected
      const filtered = prev.filter((s) => s.eventId !== selection.eventId);
      return [...filtered, selection];
    });
  };

  const removeSelection = (id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  };

  const clearSelections = () => {
    setSelections([]);
  };

  const toggleQuickBet = () => {
    setQuickBetEnabled((prev) => !prev);
  };

  const openBetslip = () => setIsOpen(true);
  const closeBetslip = () => setIsOpen(false);
  const toggleBetslip = () => setIsOpen((prev) => !prev);

  // Calculate total odds (for combo)
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  
  // Calculate potential win
  const potentialWin = activeTab === 'single' 
    ? selections.reduce((acc, s) => acc + (stake * s.odds), 0)
    : stake * totalOdds;

  return (
    <BetslipContext.Provider
      value={{
        selections,
        stake,
        quickBetEnabled,
        isOpen,
        activeTab,
        addSelection,
        removeSelection,
        clearSelections,
        setStake,
        toggleQuickBet,
        openBetslip,
        closeBetslip,
        toggleBetslip,
        setActiveTab,
        totalOdds,
        potentialWin,
      }}
    >
      {children}
    </BetslipContext.Provider>
  );
}

export function useBetslip() {
  const context = useContext(BetslipContext);
  if (context === undefined) {
    throw new Error('useBetslip must be used within a BetslipProvider');
  }
  return context;
}
