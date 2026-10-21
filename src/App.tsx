import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ImpactMetrics } from './components/ImpactMetrics';
import { PortalsSection } from './components/PortalsSection';
import { SystemPipelineSection } from './components/SystemPipelineSection';
import { GreenCorridorSimulator } from './components/GreenCorridorSimulator';
import { EmergencyGuideSection } from './components/EmergencyGuideSection';
import { BackendReadinessSection } from './components/BackendReadinessSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserRole } from './types/auth';

function MainApp() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialAuthRole, setInitialAuthRole] = useState<UserRole>('patient');

  const handleOpenAuth = (role: UserRole = 'patient') => {
    setInitialAuthRole(role);
    setAuthModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenAuth={() => handleOpenAuth('patient')}
        onSelectPortalSection={() => scrollToSection('portals')}
      />

      <main className="flex-1">
        {/* 1. Hero Section with Emergency Helplines & Interactive Visualizer */}
        <HeroSection
          onExplorePortals={() => scrollToSection('portals')}
          onExploreSimulator={() => scrollToSection('simulator')}
        />

        {/* 2. Impact Proof Metrics with Tabular Numbers */}
        <ImpactMetrics />

        {/* 3. Four Unified Stakeholder Portals Showcase & UI Inspector */}
        <PortalsSection onOpenAuthForRole={handleOpenAuth} />

        {/* 4. AI-Assisted Transit Architecture Pipeline (01 to 04) */}
        <SystemPipelineSection />

        {/* 5. Interactive Green Corridor Traffic Signal Preemption Simulator */}
        <GreenCorridorSimulator />

        {/* 6. Emergency Civic Protocols & Good Samaritan Protections */}
        <EmergencyGuideSection />

        {/* 7. Clean Stage 2 Backend & PostgreSQL Architecture Blueprint */}
        <BackendReadinessSection />
      </main>

      {/* Footer */}
      <Footer onOpenAuthForRole={handleOpenAuth} />

      {/* Role-Based Authentication & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={initialAuthRole}
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
