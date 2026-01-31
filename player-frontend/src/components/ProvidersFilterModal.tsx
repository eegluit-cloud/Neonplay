import { useState } from 'react';
import { Search, Trash2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Provider logos
import crocoLogo from '@/assets/providers/croco.png';
import jiliLogo from '@/assets/providers/jili.png';
import jdbLogo from '@/assets/providers/jdb.png';
import platipusLogo from '@/assets/providers/platipus.png';
import redTigerLogo from '@/assets/providers/red-tiger.png';
import amigoLogo from '@/assets/providers/amigo.png';
import mokaLogo from '@/assets/providers/moka.png';
import threeOaksLogo from '@/assets/providers/3oaks.png';

interface Provider {
  id: string;
  name: string;
  logo: string;
}

const providers: Provider[] = [
  { id: 'croco', name: 'Croco Gaming', logo: crocoLogo },
  { id: 'jili', name: 'JILI', logo: jiliLogo },
  { id: 'jdb', name: 'JDB', logo: jdbLogo },
  { id: 'platipus', name: 'Platipus', logo: platipusLogo },
  { id: 'red-tiger', name: 'Red Tiger', logo: redTigerLogo },
  { id: 'amigo', name: 'Amigo Gaming', logo: amigoLogo },
  { id: 'moka', name: 'Moka', logo: mokaLogo },
  { id: '3oaks', name: '3 Oaks', logo: threeOaksLogo },
];

interface ProvidersFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProviders: string[];
  onSelectionChange: (providers: string[]) => void;
}

export function ProvidersFilterModal({
  isOpen,
  onClose,
  selectedProviders,
  onSelectionChange,
}: ProvidersFilterModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProvider = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      onSelectionChange(selectedProviders.filter(id => id !== providerId));
    } else {
      onSelectionChange([...selectedProviders, providerId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#1a1a1a] rounded-2xl z-50 overflow-hidden">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 p-4 border-b border-border/30">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h2 className="text-base font-bold text-foreground">Providers</h2>
        </div>

        {/* Search Bar */}
        <div className="p-4 pt-3">
          <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-xl px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
            />
          </div>
        </div>

        {/* Providers List */}
        <div className="max-h-[50vh] overflow-y-auto scrollbar-hide px-4 space-y-2">
          {filteredProviders.map(provider => (
            <button
              key={provider.id}
              onClick={() => toggleProvider(provider.id)}
              className="w-full flex items-center gap-4 py-3 px-2 hover:bg-[#2a2a2a] rounded-xl transition-colors"
            >
              {/* Checkbox */}
              <div className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                selectedProviders.includes(provider.id)
                  ? "bg-cyan-500 border-cyan-500"
                  : "border-muted-foreground/50"
              )}>
                {selectedProviders.includes(provider.id) && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Provider Logo */}
              <img 
                src={provider.logo} 
                alt={provider.name}
                className="h-8 object-contain"
              />
            </button>
          ))}
        </div>

        {/* Clear All Button */}
        <div className="p-4 border-t border-border/30">
          <button
            onClick={clearAll}
            className="w-full flex items-center justify-center gap-2 py-3 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">Clear All</span>
          </button>
        </div>
      </div>
    </>
  );
}