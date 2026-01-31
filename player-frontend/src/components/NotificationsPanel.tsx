import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, ChevronLeft, ChevronDown, Check, Coins, Trophy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAppMode } from '@/contexts/AppModeContext';
import promoHeroBanner from '@/assets/promo-hero-banner.png';
import promoDailyBonus from '@/assets/promo-daily-bonus.png';
import promoWeeklyBonus from '@/assets/promo-weekly-bonus.png';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  image?: string;
  type: 'promotions' | 'transactions' | 'system';
  isRead: boolean;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialNotifications: Notification[] = [
  { 
    id: 1, 
    title: "Its Weekly Sports Bonus Time!", 
    message: "STAKE SC 500 AND GET UP TO SC 1,000!", 
    date: "1/10/2026, 6:34:41 AM",
    image: promoHeroBanner,
    type: 'promotions',
    isRead: false
  },
  { 
    id: 2, 
    title: "Its Weekly Sports Bonus Time!", 
    message: "STAKE SC 500 AND GET UP TO SC 1,000!", 
    date: "1/3/2026, 7:25:58 AM",
    image: promoDailyBonus,
    type: 'promotions',
    isRead: false
  },
  { 
    id: 3, 
    title: "Daily Bonus Available!", 
    message: "Claim your 10% bonus coins now!", 
    date: "1/2/2026, 4:00:00 PM",
    image: promoWeeklyBonus,
    type: 'promotions',
    isRead: true
  },
  { 
    id: 4, 
    title: "Coins Added", 
    message: "Your purchase of GC 50,000 has been credited.", 
    date: "1/1/2026, 10:30:00 AM",
    type: 'transactions',
    isRead: true
  },
  { 
    id: 5, 
    title: "Prize Redeemed", 
    message: "Your redemption of SC 2,000 is complete.", 
    date: "12/30/2025, 3:15:00 PM",
    type: 'transactions',
    isRead: true
  },
  { 
    id: 6, 
    title: "Password Changed", 
    message: "Your password was successfully updated.", 
    date: "12/28/2025, 9:00:00 AM",
    type: 'system',
    isRead: true
  },
];

const tabs = [
  { id: 'promotions', label: 'Promotions' },
  { id: 'transactions', label: 'Activity' },
  { id: 'system', label: 'System' },
];

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const { mode } = useAppMode();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<'promotions' | 'transactions' | 'system'>('promotions');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Reset notifications when panel closes
  const handleClose = () => {
    setNotifications(initialNotifications);
    setActiveTab('promotions');
    setShowUnreadOnly(false);
    onClose();
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getTabCount = (type: string) => {
    return notifications.filter(n => n.type === type && !n.isRead).length;
  };

  const filteredNotifications = notifications.filter(n => {
    if (n.type !== activeTab) return false;
    if (showUnreadOnly && n.isRead) return false;
    return true;
  });

  const handleKnowMore = (notification: Notification) => {
    onClose();
    navigate('/promotions', { state: { bonusNotification: notification } });
  };

  // Render bonus modal separately (always rendered, not dependent on isOpen)
  const bonusModal = createPortal(
    <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {selectedNotification?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {selectedNotification?.image && (
            <img 
              src={selectedNotification.image} 
              alt={selectedNotification.title}
              className="w-full h-48 object-cover rounded-xl"
            />
          )}
          <p className="text-sm text-muted-foreground">
            {selectedNotification?.message}
          </p>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-cyan-400">Bonus Details</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex justify-between">
                <span>Minimum Stake:</span>
                <span className="text-foreground font-medium flex items-center gap-1">
                  {mode === 'sweepstakes' ? <Trophy className="w-3 h-3 text-cyan-400" /> : <Coins className="w-3 h-3 text-amber-400" />}
                  {mode === 'sweepstakes' ? 'SC 500' : 'GC 5,000'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Maximum Bonus:</span>
                <span className="text-foreground font-medium flex items-center gap-1">
                  {mode === 'sweepstakes' ? <Trophy className="w-3 h-3 text-cyan-400" /> : <Coins className="w-3 h-3 text-amber-400" />}
                  {mode === 'sweepstakes' ? 'SC 1,000' : 'GC 10,000'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Play Requirement:</span>
                <span className="text-foreground font-medium">5x</span>
              </li>
              <li className="flex justify-between">
                <span>Valid Until:</span>
                <span className="text-foreground font-medium">7 Days</span>
              </li>
            </ul>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
            Claim Bonus
          </button>
        </div>
      </DialogContent>
    </Dialog>,
    document.body
  );

  if (typeof document === 'undefined') return null;

  if (!isOpen) return bonusModal;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[70]" onClick={handleClose} />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-full md:max-w-sm bg-card md:border-l border-border z-[70] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 md:px-4 md:py-3 border-b border-border bg-card safe-top">
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h2 className="text-base font-bold text-foreground">Notification</h2>
        </div>

        {/* Tabs */}
        <div className="px-3 py-2 border-b border-border">
          <div className="flex bg-[#1a1a1a] rounded-xl p-1">
            {tabs.map((tab) => {
              const count = getTabCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#2a2a2a] text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="min-w-5 h-5 px-1.5 bg-cyan-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-4 bg-background">
          {filteredNotifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 text-sm">No notifications</div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Date & Status */}
                <div className="flex items-center gap-2 px-4 pt-3">
                  <span className="text-xs text-muted-foreground">{notification.date}</span>
                  {!notification.isRead && (
                    <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />
                  )}
                </div>

                {/* Title */}
                <div className="px-4 py-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {notification.title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim()}
                  </h3>
                </div>

                {/* Image */}
                {notification.image && (
                  <div className="relative mx-3 mb-2 rounded-xl overflow-hidden">
                    <img 
                      src={notification.image} 
                      alt={notification.title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim()}
                      className="w-full h-40 object-cover"
                    />
                    <button className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white hover:bg-black/80 transition-colors">
                      Show all <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between px-4 pb-3">
                  <button 
                    onClick={() => handleKnowMore(notification)}
                    className="px-4 py-2 bg-emerald-500/10 text-gray-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                  >
                    Click to know more.
                  </button>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between px-4 py-4 mb-2 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground font-medium">Show unread</span>
            <Switch 
              checked={showUnreadOnly} 
              onCheckedChange={setShowUnreadOnly}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
          >
            <Check className="w-4 h-4" />
            <Check className="w-4 h-4 -ml-2.5" />
            mark all as read
          </button>
        </div>
      </div>
      {bonusModal}
    </>,
    document.body
  );
}
