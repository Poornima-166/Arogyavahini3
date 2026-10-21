export type UserRole = 'patient' | 'driver' | 'hospital' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone: string;
  nationalHealthId?: string; // ABHA ID
  licenseNumber?: string;    // Driver license / badge ID
  hospitalId?: string;       // Hospital affiliation ID
  department?: string;       // ER / Trauma / ICU
  policeBadgeId?: string;    // Traffic management authority badge
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  role: UserRole;
}
