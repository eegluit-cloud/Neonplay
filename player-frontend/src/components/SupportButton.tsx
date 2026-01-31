import { useState } from 'react';
import { Headphones, X, Send } from 'lucide-react';

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can we help you today?', isSupport: true }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), text: message, isSupport: false }]);
    setMessage('');
    
    // Simulate support response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: 'Thank you for your message! Our team will get back to you shortly.', 
        isSupport: true 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className="hidden md:flex fixed bottom-4 right-4 z-50 w-12 h-12 rounded-xl bg-card border border-cyan-500/30 hover:border-cyan-400/50 transition-colors items-center justify-center shadow-lg tap-feedback"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Support"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-foreground" />
        ) : (
          <Headphones className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="hidden md:flex fixed bottom-20 right-4 z-50 w-80 h-96 flex-col bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-cyan-500 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-semibold text-black text-sm">Support Chat</h3>
              <p className="text-xs text-black/70">We typically reply in minutes</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3 bg-background">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.isSupport ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.isSupport 
                      ? 'bg-card border border-border text-foreground' 
                      : 'bg-cyan-500 text-black'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                onClick={handleSend}
                className="w-9 h-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
