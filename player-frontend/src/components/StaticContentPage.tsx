import { type ReactNode, useState } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { SpinGiftModal } from '@/components/SpinGiftModal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ContentSection {
  title: string;
  content: ReactNode;
}

interface StaticContentPageProps {
  title: string;
  lastUpdated?: string;
  sections: ContentSection[];
}

export function StaticContentPage({ title, lastUpdated, sections }: StaticContentPageProps) {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [spinGiftOpen, setSpinGiftOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onOpenSignIn={() => setSignInOpen(true)}
        onOpenSignUp={() => setSignUpOpen(true)}
        onToggleSidebar={toggleSidebar}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onOpenSpinGift={() => setSpinGiftOpen(true)}
      />

      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <main className="p-3 md:p-4 lg:p-6 overflow-x-hidden max-w-full">

          <MobilePageHeader title={title} />

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Title */}
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
              )}
            </div>

            {/* Accordion Sections */}
            <Accordion type="multiple" defaultValue={sections.map((_, i) => `section-${i}`)} className="space-y-2">
              {sections.map((section, index) => (
                <AccordionItem
                  key={index}
                  value={`section-${index}`}
                  className="bg-card border border-border rounded-xl px-4 overflow-hidden"
                >
                  <AccordionTrigger className="text-foreground font-semibold text-sm md:text-base hover:no-underline">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {section.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </main>
      </div>

      <LoginModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSwitchToRegister={() => { setSignInOpen(false); setSignUpOpen(true); }}
      />
      <RegisterModal
        isOpen={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        onSwitchToLogin={() => { setSignUpOpen(false); setSignInOpen(true); }}
      />

      <SpinGiftModal isOpen={spinGiftOpen} onClose={() => setSpinGiftOpen(false)} />
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </div>
  );
}
