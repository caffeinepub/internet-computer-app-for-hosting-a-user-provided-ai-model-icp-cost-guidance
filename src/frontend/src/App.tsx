import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import LoginButton from './components/auth/LoginButton';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import ModelManagementPage from './pages/ModelManagementPage';
import InferencePage from './pages/InferencePage';
import CostEstimatorPage from './pages/CostEstimatorPage';
import LimitationsPage from './pages/LimitationsPage';
import FundingPage from './pages/FundingPage';
import AuthGate from './components/auth/AuthGate';
import { Cpu, DollarSign, Info, Database, Wallet } from 'lucide-react';

type Page = 'models' | 'inference' | 'cost' | 'limitations' | 'funding';

function App() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<Page>('models');
  
  const isAuthenticated = !!identity;
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  const navItems = [
    { id: 'models' as Page, label: 'My Models', icon: Database },
    { id: 'inference' as Page, label: 'Run Inference', icon: Cpu },
    { id: 'cost' as Page, label: 'Cost Estimator', icon: DollarSign },
    { id: 'limitations' as Page, label: 'About & Limits', icon: Info },
  ];

  const authenticatedNavItems = [
    { id: 'funding' as Page, label: 'Funding', icon: Wallet },
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">AI on ICP</h1>
                  <p className="text-xs text-muted-foreground">Host Your Models On-Chain</p>
                </div>
              </div>
              <LoginButton />
            </div>
          </div>
        </header>

        <nav className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                      isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              {isAuthenticated && authenticatedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                      isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          {currentPage === 'models' && <ModelManagementPage />}
          {currentPage === 'inference' && <InferencePage />}
          {currentPage === 'cost' && <CostEstimatorPage />}
          {currentPage === 'limitations' && <LimitationsPage />}
          {currentPage === 'funding' && (
            <AuthGate>
              <FundingPage />
            </AuthGate>
          )}
        </main>

        <footer className="border-t border-border mt-16 py-8 bg-card/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} · Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'ai-on-icp'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>

        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
