import { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthModalsProps {
  isSignInOpen: boolean;
  isSignUpOpen: boolean;
  onCloseSignIn: () => void;
  onCloseSignUp: () => void;
  onSwitchToSignUp: () => void;
  onSwitchToSignIn: () => void;
}

const socialLogins = ['G', 'f', '📱', '🎮', 'VK', '🐦', '🎯', '👾'];

export function AuthModals({ 
  isSignInOpen, 
  isSignUpOpen, 
  onCloseSignIn, 
  onCloseSignUp,
  onSwitchToSignUp,
  onSwitchToSignIn 
}: AuthModalsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');

  if (!isSignInOpen && !isSignUpOpen) return null;

  const isSignIn = isSignInOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={isSignIn ? onCloseSignIn : onCloseSignUp} />
      
      <div className="relative w-full sm:max-w-2xl bg-card rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up sm:animate-scale-in flex max-h-[90vh] sm:max-h-none overflow-y-auto scrollbar-hide">
        {/* Left Side - Image */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-card to-background p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">🦁</div>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-xl">B</div>
            </div>
            <p className="text-sm text-muted-foreground">OFFICIAL PARTNER</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={isSignIn ? onCloseSignIn : onCloseSignUp} className="w-8 h-8 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h2 className="font-display text-2xl font-bold text-foreground">{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
          </div>

          {!isSignIn && (
            <div className="flex mb-6 bg-secondary rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-2 text-sm rounded-md transition-colors ${activeTab === 'email' ? 'bg-card' : ''}`}
              >
                Email
              </button>
              <button 
                onClick={() => setActiveTab('phone')}
                className={`flex-1 py-2 text-sm rounded-md transition-colors ${activeTab === 'phone' ? 'bg-card' : ''}`}
              >
                Phone Number
              </button>
            </div>
          )}

          <form className="space-y-4">
            <Input type="email" placeholder={isSignIn ? "Email/Phone number" : "Email"} />
            
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="Password" />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignIn && (
              <div className="text-right">
                <a href="#" className="text-sm text-primary hover:underline">Forgot your password?</a>
              </div>
            )}

            <Button type="submit" className="w-full shadow-[0_0_20px_hsl(var(--primary)/0.3),0_0_8px_hsl(var(--primary)/0.2)]" size="lg">
              {isSignIn ? 'Log in' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {isSignIn ? 'New to betr.game? ' : 'Already have an account? '}
              <button 
                onClick={isSignIn ? onSwitchToSignUp : onSwitchToSignIn}
                className="text-primary hover:underline"
              >
                {isSignIn ? 'Create account' : 'Log in'}
              </button>
            </p>
            
            <p className="text-sm text-muted-foreground mb-3">Or log in with</p>
            <div className="flex justify-center gap-2">
              {socialLogins.map((icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-sm">
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
