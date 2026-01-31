import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobilePageHeaderProps {
  title: string;
}

export function MobilePageHeader({ title }: MobilePageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    // If user opened /profile directly (no in-app history), fallback to home.
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="md:hidden flex items-center gap-3 mb-4">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-card-hover active:bg-secondary transition-colors tap-feedback"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
    </div>
  );
}
