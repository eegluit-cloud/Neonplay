import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import mascotImage from '@/assets/mascot.jpeg';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, onForgotPassword }: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const isMobile = useIsMobile();

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setRememberMe(false);
      setIsLoading(false);
      setError(null);
      setEmailTouched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const showEmailError = emailTouched && email.trim().length > 0 && !isValidEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password, rememberMe);
      navigate('/lobby');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile version - bottom sheet
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full bg-gradient-to-b from-card to-background border-t-2 border-primary/50 rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-themed animate-slide-up">
          <div className="p-4 relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="text-lg font-bold text-foreground">Login</h2>
            </div>

            {/* Title Badge */}
            <div className="flex bg-secondary/50 rounded-full p-1 mb-6 w-fit">
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-blue-400 text-white shadow">
                Welcome Back
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                disabled={isLoading}
                className={cn(
                  "h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground",
                  showEmailError && "border-red-500/50"
                )}
              />
              {showEmailError && (
                <p className="text-xs text-red-400 -mt-2">Please enter a valid email address</p>
              )}

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="data-[state=checked]:bg-amber-500"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={isLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 h-14 bg-secondary/50 border-border hover:bg-secondary text-foreground font-semibold disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!email.trim() || !password || isLoading}
                  className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-primary hover:underline font-medium"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - 2-column with dealer image
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Golden Header */}
        <div className="relative py-3.5 bg-gradient-to-r from-[#12161c] via-[#1a1510] to-[#12161c] border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
          <div className="relative flex items-center justify-center gap-2.5 [filter:drop-shadow(0_0_12px_rgba(245,158,11,0.35))]">
            <span className="text-lg font-bold tracking-wide [text-shadow:0_0_20px_rgba(245,158,11,0.4)]">
              <span className="text-amber-300/90">Welcome To </span>
              <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">PhiBet.io</span>
            </span>
            <NeonPlayLogo size="sm" showText={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Side - Form */}
          <div className="relative p-5 order-2 md:order-1">
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
              <div className="relative bg-gradient-to-br from-[#1a1f26] to-[#12161c] rounded-xl p-5">
                <h2 className="text-2xl font-bold text-white mb-1">Login</h2>
                <p className="text-muted-foreground text-sm mb-5">Welcome back!</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      disabled={isLoading}
                      className={cn(
                        "h-11 bg-[#2a3038] border-[#3a4048] text-white placeholder:text-muted-foreground focus:border-amber-400 text-sm",
                        showEmailError && "border-red-500/50"
                      )}
                    />
                    {showEmailError && (
                      <p className="text-[10px] text-red-400 mt-1">Please enter a valid email address</p>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 bg-[#2a3038] border-[#3a4048] text-white placeholder:text-muted-foreground focus:border-amber-400 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch
                        checked={rememberMe}
                        onCheckedChange={setRememberMe}
                        className="data-[state=checked]:bg-amber-500 scale-90"
                      />
                      <span className="text-xs text-muted-foreground">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      disabled={isLoading}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={!email.trim() || !password || isLoading}
                    className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold text-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging in...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center space-y-1">
                  <p className="text-muted-foreground text-xs">
                    Don't have an account?{' '}
                    <button
                      onClick={onSwitchToRegister}
                      className="text-amber-400 underline hover:text-amber-300 transition-colors"
                    >
                      Register
                    </button>
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    Need Help? <span className="mx-1">|</span>
                    <button className="hover:text-white transition-colors">Terms & Conditions</button>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Mascot */}
          <div className="relative overflow-hidden min-h-[320px] order-1 md:order-2">
            <img
              src={mascotImage}
              alt="PhiBet.io Mascot"
              className="absolute inset-0 w-full h-full object-cover object-top select-none pointer-events-none"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
