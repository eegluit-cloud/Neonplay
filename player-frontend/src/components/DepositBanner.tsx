import { Button } from '@/components/ui/button';
import depositBannerImage from '@/assets/deposit-banner.png';
import registerBannerImage from '@/assets/register-banner.png';
interface DepositBannerProps {
  onOpenSignUp: () => void;
}
export function DepositBanner({
  onOpenSignUp
}: DepositBannerProps) {
  return <section className="relative overflow-hidden rounded-2xl group">
      <img src={depositBannerImage} alt="Deposit bonus" className="w-full h-auto object-cover cursor-pointer transition-opacity" onClick={onOpenSignUp} />
      {/* Light mode overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 light:opacity-100 pointer-events-none transition-opacity rounded-2xl" />
      <div className="absolute inset-0 bg-white/5 opacity-0 light:opacity-100 pointer-events-none rounded-2xl" />
      {/* Hover effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none rounded-2xl" />
    </section>;
}
export function RegisterBanner({
  onOpenSignUp
}: DepositBannerProps) {
  return <section className="relative overflow-hidden rounded-2xl">
      
    </section>;
}