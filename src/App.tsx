import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ImpactMetrics } from './components/ImpactMetrics';
import { PortalsSection } from './components/PortalsSection';
import { PortalWorkspaceContainer } from './components/portals/PortalWorkspaceContainer';
import { SystemPipelineSection } from './components/SystemPipelineSection';
import { GreenCorridorSimulator } from './components/GreenCorridorSimulator';
import { EmergencyGuideSection } from './components/EmergencyGuideSection';
import { BackendReadinessSection } from './components/BackendReadinessSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserRole } from './types/auth';
import { api, getAuthToken } from './services/api';

function MainApp() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialAuthRole, setInitialAuthRole] = useState<UserRole>('patient');
  const [activeWorkspaceRole, setActiveWorkspaceRole] = useState<UserRole>('patient');
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Check existing session on load
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.auth
        .getMe()
        .then((res) => {
          if (res.success && res.user) {
            setCurrentUser(res.user);
            if (res.user.role) {
              setActiveWorkspaceRole(res.user.role);
            }
          }
        })
        .catch(() => {
          // Token expired or invalid
          setCurrentUser(null);
        });
    }
  }, []);

  const handleOpenAuth = (role: UserRole = 'patient') => {
    setInitialAuthRole(role);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
  };

  const handleInstantSwitchAuth = async (role: UserRole) => {
    let id = 'citizen@arogya.in';
    if (role === 'driver') id = 'driver@arogya.in';
    if (role === 'hospital') id = 'er@victoria.gov.in';
    if (role === 'admin') id = 'admin@trafficpolice.gov.in';

    try {
      const res = await api.auth.login({
        identifier: id,
        password: 'Arogya@2026',
        role,
      });
      if (res.success && res.user) {
        setCurrentUser(res.user);
      }
    } catch {
      // Fallback: switch view even if offline
    }
    setActiveWorkspaceRole(role);
    const el = document.getElementById('live-portals');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectRoleAndScroll = (role: UserRole) => {
    setActiveWorkspaceRole(role);
    const el = document.getElementById('live-portals');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-200 selection:bg-red-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenAuth={(role) => handleOpenAuth(role || 'patient')}
        onSelectPortalSection={(role) => handleSelectRoleAndScroll(role || 'patient')}
        onQuickSwitchRole={(role) => handleInstantSwitchAuth(role)}
        activeRole={activeWorkspaceRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {/* 1. Hero Section with Emergency Helplines & Interactive Visualizer */}
        <HeroSection
          onExplorePortals={() => handleSelectRoleAndScroll('patient')}
          onExploreSimulator={() => scrollToSection('simulator')}
        />

        {/* 2. Impact Proof Metrics with Tabular Numbers */}
        <ImpactMetrics />

        {/* 3. Master Live Operational Workspaces (Stage 2 & 3: Real Working Portals) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortalWorkspaceContainer
            currentRole={activeWorkspaceRole}
            onRoleChange={(newRole) => setActiveWorkspaceRole(newRole)}
            onQuickSwitchRole={(role) => handleInstantSwitchAuth(role)}
            onOpenAuth={(role) => handleOpenAuth(role)}
            currentUser={currentUser}
          />
        </div>

        {/* 4. Four Unified Stakeholder Portals Showcase & Deep Inspector */}
        <PortalsSection onOpenAuthForRole={(role) => handleSelectRoleAndScroll(role)} />

        {/* 5. AI-Assisted Transit Architecture Pipeline (01 to 04) */}
        <SystemPipelineSection />

        {/* 6. Interactive Green Corridor Traffic Signal Preemption Simulator */}
        <GreenCorridorSimulator />

        {/* 7. Emergency Civic Protocols & Good Samaritan Protections */}
        <EmergencyGuideSection />

        {/* 8. Full-Stack Express & PostgreSQL-Ready Backend Blueprint */}
        <BackendReadinessSection />
      </main>

      {/* Footer */}
      <Footer onOpenAuthForRole={(role) => handleSelectRoleAndScroll(role)} />

      {/* Role-Based Authentication & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={initialAuthRole}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user?.role) handleSelectRoleAndScroll(user.role);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
