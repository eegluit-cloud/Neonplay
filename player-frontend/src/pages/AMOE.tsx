import { useState } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';

const AMOE = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  
  // Step state
  const [step, setStep] = useState<'claim' | 'generate' | 'postal'>('claim');
  const [generatedCode, setGeneratedCode] = useState('********');
  
  // Claim form state
  const [claimData, setClaimData] = useState({
    username: '',
    email: '',
  });
  
  // Postal form state
  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    email: '',
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [amoeCode, setAmoeCode] = useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimData.username && claimData.email) {
      setStep('generate');
    }
  };

  const handleGenerateCode = () => {
    // Generate a 15-digit alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 15; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
  };

  const handleProceedToPostal = () => {
    if (generatedCode !== '********') {
      setStep('postal');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a mock AMOE code
    const code = 'AMOE-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setAmoeCode(code);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      <Header 
        onOpenSignIn={() => setSignInOpen(true)} 
        onOpenSignUp={() => setSignUpOpen(true)} 
        onToggleSidebar={toggleSidebar} 
      />
      
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onOpenSpinGift={() => {}} onOpenBonusClaimed={() => {}} />
      
      <div className={`transition-all duration-300 pt-14 md:pt-16 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <MobilePageHeader title="AMOE" />
        
        <main className="p-3 md:p-4 lg:p-6 space-y-6">
          {/* Step 1: Claim Bonus - Username & Email */}
          {step === 'claim' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Alternative Method Of Entry (AMOE)
              </h1>

              <div className="relative">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-400/50 via-cyan-500/50 to-cyan-400/50" />
                <div className="relative bg-[#0a0e14] rounded-xl p-5 md:p-8">
                  <p className="text-white text-sm md:text-base mb-4">
                    To claim your exclusive <span className="text-cyan-400 font-semibold">$3.00 Bonus</span>, please follow the following claim process.
                  </p>
                  
                  <div className="text-muted-foreground text-sm space-y-1 mb-4">
                    <p>1. Enter your Phibet username. It must match your profile.</p>
                    <p>2. Enter the email address associated with your Phibet account. It must match your profile.</p>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-6">
                    After successfully submitting the required details, you'll be directed to a subsequent page that contains further instructions.
                  </p>
                  
                  <form onSubmit={handleNextStep} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username" className="text-muted-foreground text-xs uppercase tracking-wide">
                          Enter Your Username
                        </Label>
                        <Input 
                          id="username"
                          value={claimData.username}
                          onChange={(e) => setClaimData({ ...claimData, username: e.target.value })}
                          className="h-11 bg-[#1a1f26] border-border text-white mt-1"
                          placeholder="Tony"
                        />
                      </div>
                      <div>
                        <Label htmlFor="claimEmail" className="text-muted-foreground text-xs uppercase tracking-wide">
                          Your Email
                        </Label>
                        <Input 
                          id="claimEmail"
                          type="email"
                          value={claimData.email}
                          onChange={(e) => setClaimData({ ...claimData, email: e.target.value })}
                          className="h-11 bg-[#1a1f26] border-border text-white mt-1"
                          placeholder="Tony@Gmail.Com"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-black font-semibold"
                    >
                      Next Step
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Generate Unique Postal Code */}
          {step === 'generate' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 uppercase tracking-wide">
                Generate Your Unique Postal Code
              </h1>
              
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-400/50 via-cyan-500/50 to-cyan-400/50" />
                <div className="relative bg-[#0a0e14] rounded-xl p-5 md:p-8">
                  <p className="text-white text-sm md:text-base mb-4">
                    Click the "GENERATE" button once to generate your unique one-time postal code. A 15-digit code will appear. Please screenshot the page or take a note of your code as you will need this on the next step.
                  </p>
                  
                  <p className="text-muted-foreground text-sm mb-6">
                    Note: Clicking the button multiple times will not generate a new code and each code can only be used for one request. Only codes generated legitimately via this page will be eligible for coin requests.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                        Your One Time Claim Code:
                      </Label>
                      <Input 
                        value={generatedCode}
                        readOnly
                        className="h-11 bg-[#1a1f26] border-border text-white mt-1 max-w-md font-mono text-lg tracking-widest"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleGenerateCode}
                        disabled={generatedCode !== '********'}
                        className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-black font-semibold disabled:opacity-50"
                      >
                        Generate
                      </Button>
                      
                      {generatedCode !== '********' && (
                        <Button 
                          onClick={handleProceedToPostal}
                          variant="outline"
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          Continue to Next Step
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Postal Code Details */}
          {step === 'postal' && (
            <>
              {/* AMOE Info Card */}
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400" />
                <div className="relative bg-[#0a0e14] rounded-xl p-5 md:p-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Alternative Method Of Entry (AMOE)
                  </h1>
                  
                  <p className="text-muted-foreground text-sm md:text-base mb-4">
                    By Sending Request, You will get an unique AMOE Code with an Email Address and Post Address. 
                    Then you can send mail with unique AMOE code or can do an post to given postal address with your unique AMOE Code.
                  </p>
                  
                  <p className="text-cyan-400 text-xs md:text-sm mb-6">
                    Note: AMOE is only available for users with no existing bonus funds.
                  </p>
                  
                  {!submitted ? (
                    <Button 
                      onClick={() => setSubmitted(false)}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-black font-semibold"
                      type="button"
                      form="amoe-form"
                    >
                      Submit Request
                    </Button>
                  ) : (
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <p className="text-cyan-400 font-semibold">Request Submitted!</p>
                      <p className="text-white text-lg font-mono mt-2">Code: {amoeCode}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Postal Code Details Form */}
              <div className="bg-card rounded-xl p-5 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                  Postal Code Details
                </h2>
            
            <form id="amoe-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* General Info */}
                <div className="space-y-4">
                  <h3 className="text-cyan-400 font-semibold text-sm">General Info.</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Created At:</Label>
                      <p className="text-white text-sm">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Status:</Label>
                      <p className="text-white text-sm">{submitted ? 'Submitted' : 'Pending'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">AMOE Code:</Label>
                      <p className="text-white text-sm font-mono">{amoeCode || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Address to post */}
                <div className="space-y-4">
                  <h3 className="text-cyan-400 font-semibold text-sm">Address to post</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="addressLine1" className="text-muted-foreground text-xs">Address Line 1:</Label>
                      <Input 
                        id="addressLine1"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="h-9 bg-secondary/50 border-border text-sm"
                        placeholder="Enter address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="addressLine2" className="text-muted-foreground text-xs">Address Line 2:</Label>
                      <Input 
                        id="addressLine2"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="h-9 bg-secondary/50 border-border text-sm"
                        placeholder="Apt, Suite, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-muted-foreground text-xs">City:</Label>
                      <Input 
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="h-9 bg-secondary/50 border-border text-sm"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-muted-foreground text-xs">Country:</Label>
                      <Input 
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="h-9 bg-secondary/50 border-border text-sm"
                        placeholder="Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="text-muted-foreground text-xs">Postal Code:</Label>
                      <Input 
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="h-9 bg-secondary/50 border-border text-sm"
                        placeholder="Postal Code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-muted-foreground text-xs">State:</Label>
                      <Input 
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="h-9 bg-secondary/50 border-border text-sm"
                        placeholder="State"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-4">
                  <h3 className="text-cyan-400 font-semibold text-sm">Email:</h3>
                  <div>
                    <Label htmlFor="email" className="text-muted-foreground text-xs">Email address:</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-9 bg-secondary/50 border-border text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-black font-semibold"
                >
                  Submit Request
                </Button>
              </div>
            </form>
              </div>

              <Footer />
            </>
          )}
        </main>
      </div>
      
      <MobileBottomNav onMenuClick={toggleSidebar} />
      
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
    </div>
  );
};

export default AMOE;
