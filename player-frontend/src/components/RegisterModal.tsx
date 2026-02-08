import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, AlertCircle, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';
import mascotImage from '@/assets/mascot.jpeg';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { registerStepEmailSchema, registerStepUsernameSchema, registerStepPasswordSchema } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

type Step = 'email' | 'username' | 'password';

const ALL_STEPS: Step[] = ['email', 'username', 'password'];

const STEP_LABELS: Record<Step, string> = {
  email: 'Enter Your Email',
  username: 'Choose a Username',
  password: 'Set Your Password',
};

// --- Extracted sub-components (stable references, no remount on parent re-render) ---

function StepDots({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-4">
      {ALL_STEPS.map((s, i) => (
        <div
          key={s}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i <= stepIndex ? "bg-amber-400 scale-110" : "bg-white/20"
          )}
        />
      ))}
    </div>
  );
}

interface FormContentProps {
  variant: 'mobile' | 'desktop';
  step: Step;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  agreeTerms: boolean;
  ageVerified: boolean;
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  onEmailChange: (v: string) => void;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onAgreeTermsChange: (v: boolean) => void;
  onAgeVerifiedChange: (v: boolean) => void;
  onClearFieldErrors: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function FormContent({
  variant, step, email, username, password, confirmPassword,
  showPassword, showConfirmPassword, agreeTerms, ageVerified,
  isLoading, error, fieldErrors,
  onEmailChange, onUsernameChange, onPasswordChange, onConfirmPasswordChange,
  onToggleShowPassword, onToggleShowConfirmPassword,
  onAgreeTermsChange, onAgeVerifiedChange, onClearFieldErrors,
  onSubmit, onBack,
}: FormContentProps) {
  const inputClass = variant === 'mobile'
    ? "h-14 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground"
    : "h-11 bg-[#2a3038] border-[#3a4048] text-white placeholder:text-muted-foreground focus:border-amber-400 text-sm";

  const errorBorderClass = "border-red-500/50";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {step === 'email' && (
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => { onEmailChange(e.target.value); onClearFieldErrors(); }}
              disabled={isLoading}
              className={cn(inputClass, "pl-10", fieldErrors.email && errorBorderClass)}
              autoFocus
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
          )}
        </div>
      )}

      {step === 'username' && (
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => { onUsernameChange(e.target.value); onClearFieldErrors(); }}
              disabled={isLoading}
              className={cn(inputClass, "pl-10", fieldErrors.username && errorBorderClass)}
              autoFocus
            />
          </div>
          {fieldErrors.username && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.username}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1.5">
            3-20 characters, starts with a letter, letters/numbers/underscores only
          </p>
        </div>
      )}

      {step === 'password' && (
        <>
          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => { onPasswordChange(e.target.value); onClearFieldErrors(); }}
                disabled={isLoading}
                className={cn(inputClass, "pl-10 pr-10", fieldErrors.password && errorBorderClass)}
                autoFocus
              />
              <button
                type="button"
                onClick={onToggleShowPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Password Strength */}
          <PasswordStrengthIndicator password={password} />

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => { onConfirmPasswordChange(e.target.value); onClearFieldErrors(); }}
                disabled={isLoading}
                className={cn(inputClass, "pl-10 pr-10", fieldErrors.confirmPassword && errorBorderClass)}
              />
              <button
                type="button"
                onClick={onToggleShowConfirmPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms & Age Checkboxes */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <Checkbox
                checked={agreeTerms}
                onCheckedChange={(checked) => { onAgreeTermsChange(checked === true); onClearFieldErrors(); }}
                className="mt-0.5 border-border data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <span className={cn("text-xs leading-relaxed", fieldErrors.agreeTerms ? "text-red-400" : "text-muted-foreground group-hover:text-foreground transition-colors")}>
                I agree to the Terms & Conditions and Privacy Policy
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <Checkbox
                checked={ageVerified}
                onCheckedChange={(checked) => { onAgeVerifiedChange(checked === true); onClearFieldErrors(); }}
                className="mt-0.5 border-border data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <span className={cn("text-xs leading-relaxed", fieldErrors.ageVerified ? "text-red-400" : "text-muted-foreground group-hover:text-foreground transition-colors")}>
                I confirm that I am at least 18 years old
              </span>
            </label>
          </div>
        </>
      )}

      {/* Action Buttons */}
      {variant === 'mobile' ? (
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 h-14 bg-secondary/50 border-border hover:bg-secondary text-foreground font-semibold disabled:opacity-50"
          >
            {step === 'email' ? 'Cancel' : 'Back'}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-blue-400 hover:from-amber-600 hover:to-blue-500 text-white font-semibold shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </span>
            ) : step === 'password' ? 'Create Account' : 'Continue'}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          {step !== 'email' && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="h-11 px-4 bg-[#2a3038] border-[#3a4048] hover:bg-[#3a4048] text-white text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </span>
            ) : step === 'password' ? 'Create Account' : 'Continue'}
          </Button>
        </div>
      )}
    </form>
  );
}

// --- Main component ---

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  onForgotPassword?: () => void;
  onRegistrationSuccess?: (email: string) => void;
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin, onRegistrationSuccess }: RegisterModalProps) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const isMobile = useIsMobile();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Bug 6 fix: Reset all form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setAgreeTerms(false);
      setAgeVerified(false);
      setIsLoading(false);
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stepIndex = ALL_STEPS.indexOf(step);

  const validateStep = (): boolean => {
    setFieldErrors({});
    setError(null);

    if (step === 'email') {
      const result = registerStepEmailSchema.safeParse({ email: email.trim() });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach((e) => {
          errs[e.path[0] as string] = e.message;
        });
        setFieldErrors(errs);
        return false;
      }
      return true;
    }

    if (step === 'username') {
      const result = registerStepUsernameSchema.safeParse({ username: username.trim() });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach((e) => {
          errs[e.path[0] as string] = e.message;
        });
        setFieldErrors(errs);
        return false;
      }
      return true;
    }

    if (step === 'password') {
      const result = registerStepPasswordSchema.safeParse({
        password,
        confirmPassword,
        agreeTerms: agreeTerms || undefined,
        ageVerified: ageVerified || undefined,
      });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach((e) => {
          const key = e.path[0] as string;
          if (!errs[key]) errs[key] = e.message;
        });
        setFieldErrors(errs);
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === 'email') setStep('username');
    else if (step === 'username') setStep('password');
  };

  const handleBack = () => {
    setError(null);
    setFieldErrors({});
    if (step === 'password') setStep('username');
    else if (step === 'username') setStep('email');
    else onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 'password') {
      handleNext();
      return;
    }
    if (!validateStep()) return;

    setIsLoading(true);
    setError(null);

    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
      });

      // Bug 2 fix: If onRegistrationSuccess is provided, let the caller handle
      // the post-registration flow (e.g. email verification). Otherwise navigate.
      if (onRegistrationSuccess) {
        onRegistrationSuccess(email);
      } else {
        navigate('/lobby');
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formProps: FormContentProps = {
    variant: 'mobile',
    step, email, username, password, confirmPassword,
    showPassword, showConfirmPassword, agreeTerms, ageVerified,
    isLoading, error, fieldErrors,
    onEmailChange: setEmail,
    onUsernameChange: setUsername,
    onPasswordChange: setPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onToggleShowPassword: () => setShowPassword(p => !p),
    onToggleShowConfirmPassword: () => setShowConfirmPassword(p => !p),
    onAgreeTermsChange: setAgreeTerms,
    onAgeVerifiedChange: setAgeVerified,
    onClearFieldErrors: () => setFieldErrors({}),
    onSubmit: handleSubmit,
    onBack: handleBack,
  };

  // Mobile version - bottom sheet
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full bg-gradient-to-b from-card to-background border-t-2 border-primary/50 rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide animate-slide-up">
          <div className="p-4 relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="text-lg font-bold text-foreground">Register</h2>
            </div>

            <StepDots stepIndex={stepIndex} />

            {/* Title Badge */}
            <div className="flex bg-secondary/50 rounded-full p-1 mb-4 w-fit">
              <div className="px-5 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-blue-400 text-white shadow">
                {STEP_LABELS[step]}
              </div>
            </div>

            <FormContent {...formProps} variant="mobile" />

            {/* Footer */}
            <div className="text-center mt-4 pb-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-primary hover:underline font-medium"
                >
                  Login
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
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
                <h2 className="text-2xl font-bold text-white mb-1">Register</h2>
                <p className="text-muted-foreground text-sm mb-3">{STEP_LABELS[step]}</p>

                <StepDots stepIndex={stepIndex} />

                <FormContent {...formProps} variant="desktop" />

                <div className="mt-4 text-center space-y-1">
                  <p className="text-muted-foreground text-xs">
                    Already registered?{' '}
                    <button
                      onClick={onSwitchToLogin}
                      className="text-amber-400 underline hover:text-amber-300 transition-colors"
                    >
                      Login
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
