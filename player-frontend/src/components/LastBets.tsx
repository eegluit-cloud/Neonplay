import { useState } from 'react';
import { cn } from '@/lib/utils';
const bets = [{
  id: 1,
  user: 'Hidden',
  game: 'Baccarat',
  multiplier: '11x',
  betAmount: '$0.25',
  profit: '$2.75',
  isWin: true
}, {
  id: 2,
  user: 'Jurywoods',
  game: 'Roulette',
  multiplier: '2.5x',
  betAmount: '$2.75',
  profit: '$7.75',
  isWin: true
}, {
  id: 3,
  user: 'TheFloeker',
  game: 'Blackjack',
  multiplier: '4.5x',
  betAmount: '$25.00',
  profit: '$0.00',
  isWin: false
}, {
  id: 4,
  user: 'PlayerOne',
  game: 'Slots',
  multiplier: '3x',
  betAmount: '$0.50',
  profit: '$1.50',
  isWin: true
}, {
  id: 5,
  user: 'Hidden',
  game: 'Baccarat',
  multiplier: '11x',
  betAmount: '$0.25',
  profit: '$2.75',
  isWin: true
}, {
  id: 6,
  user: 'Jurywoods',
  game: 'Roulette',
  multiplier: '2.5x',
  betAmount: '$2.75',
  profit: '$7.75',
  isWin: true
}, {
  id: 7,
  user: 'TheFloeker',
  game: 'Blackjack',
  multiplier: '4.5x',
  betAmount: '$25.00',
  profit: '$0.00',
  isWin: false
}];
const tabs = ['Latest Bets', 'High Rollers', 'Monthly'];
export function LastBets() {
  const [activeTab, setActiveTab] = useState('Latest Bets');
  return (
    <div className="w-full bg-card rounded-xl p-4 md:p-6 border border-border">
      <div className="flex bg-[#1a1a1a] rounded-full p-1 border border-amber-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)] w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-[#2a2a2a] border border-[#3a3a3a] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-muted-foreground font-medium py-3 px-2">User</th>
              <th className="text-left text-muted-foreground font-medium py-3 px-2">Game</th>
              <th className="text-left text-muted-foreground font-medium py-3 px-2">Multiplier</th>
              <th className="text-left text-muted-foreground font-medium py-3 px-2">Bet Amount</th>
              <th className="text-left text-muted-foreground font-medium py-3 px-2">Profit</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-3 px-2 text-foreground">{bet.user}</td>
                <td className="py-3 px-2 text-muted-foreground">{bet.game}</td>
                <td className="py-3 px-2 text-primary font-medium">{bet.multiplier}</td>
                <td className="py-3 px-2 text-foreground">{bet.betAmount}</td>
                <td className={cn("py-3 px-2 font-medium", bet.isWin ? "text-primary" : "text-destructive")}>
                  {bet.profit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}