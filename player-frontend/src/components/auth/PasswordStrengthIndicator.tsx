import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPasswordStrength } from '@/lib/validations/auth';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const barColors: Record<number, string> = {
  0: 'bg-red-500',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
};

const labelColors: Record<number, string> = {
  0: 'text-red-400',
  1: 'text-red-400',
  2: 'text-orange-400',
  3: 'text-yellow-400',
  4: 'text-green-400',
};

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { score, label, checks } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bars */}
      <div className="flex items-center gap-1.5">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full flex-1 transition-all duration-300",
                i < score ? barColors[score] : "bg-white/10"
              )}
            />
          ))}
        </div>
        <span className={cn("text-[10px] sm:text-xs font-medium ml-2", labelColors[score])}>
          {label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            {check.met ? (
              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
            ) : (
              <X className="w-3 h-3 text-red-400/60 flex-shrink-0" />
            )}
            <span
              className={cn(
                "text-[10px] sm:text-xs transition-colors",
                check.met ? "text-green-400" : "text-muted-foreground"
              )}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
