import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../data/translations';
import { UserRole } from '../types/auth';
import { Sun, Moon, Globe, ShieldAlert, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (role?: UserRole) => void;
  onSelectPortalSection: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onSelectPortalSection,
  currentUser,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, currentLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (Single Text Element Wordmark) */}
          <a
            href="#"
            className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-xl tracking-tight whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <span className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-red-700 transition-colors">
              <ShieldAlert className="w-5 h-5 text-white" />
            </span>
            <span className="font-extrabold tracking-tight">
              Arogya<span className="text-red-600 dark:text-red-500">Vahini</span>
            </span>
          </a>

          {/* Zone 2: Navigation Links (Single-Line, 4-5 links) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#overview"
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
            >
              {t('navOverview', 'Overview')}
            </a>
            <a
              href="#portals"
              onClick={onSelectPortalSection}
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
            >
              {t('navPortals', 'Four Portals')}
            </a>
            <a
              href="#technology"
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
            >
              {t('navTech', 'AI & Signal Priority')}
            </a>
            <a
              href="#simulator"
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
            >
              {t('navSimulator', 'Corridor Simulator')}
            </a>
            <a
              href="#guide"
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
            >
              {t('navGuide', 'Emergency Protocols')}
            </a>
            <a
              href="#architecture"
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 text-slate-400 dark:text-slate-500"
            >
              Schema
            </a>
          </nav>

          {/* Zone 3: Actions (Language, Theme, 1 Primary Action) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">{currentLanguage.nativeLabel}</span>
                <span className="sm:hidden font-mono uppercase text-[11px]">{language}</span>
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-30">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Select Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                          language === lang.code
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{lang.nativeLabel}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({lang.label})</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label={theme === 'dark' ? t('lightMode', 'Light Mode') : t('darkMode', 'Dark Mode')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Primary Action Button or Logged In User Badge */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="truncate max-w-[120px]">{currentUser.full_name || currentUser.fullName}</span>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">({currentUser.role})</span>
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {t('signOut', 'Sign Out')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth()}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-md shadow-sm transition-all whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
              >
                <span>{t('signIn', 'Sign In')} / {t('accessPortals', 'Access Portals')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              {t('navOverview', 'Overview')}
            </a>
            <a
              href="#portals"
              onClick={() => {
                onSelectPortalSection();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              {t('navPortals', 'Four Portals')}
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              {t('navTech', 'AI & Signal Priority')}
            </a>
            <a
              href="#simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              {t('navSimulator', 'Corridor Simulator')}
            </a>
            <a
              href="#guide"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              {t('navGuide', 'Emergency Protocols')}
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              PostgreSQL Schema (Stage 2)
            </a>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
              >
                {t('signIn', 'Sign In')} / {t('accessPortals', 'Access Portals')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
