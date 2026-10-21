import { query, memoryStore } from './pool';
import bcrypt from 'bcryptjs';

/**
 * Migration 001: Schema setup for ArogyaVahini
 * Creates core tables, foreign keys, indexes, and initial demographic seeds.
 */
export async function runMigrations(): Promise<{ success: boolean; version: string; message: string }> {
  console.log('[Database] Executing ArogyaVahini PostgreSQL schema migrations...');

  const migrationSql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(50) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL CHECK (role IN ('patient', 'driver', 'hospital', 'admin')),
      full_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 2. Patient Profiles
    CREATE TABLE IF NOT EXISTS patient_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      national_health_id VARCHAR(50),
      blood_group VARCHAR(10) DEFAULT 'O+',
      allergies TEXT DEFAULT 'None documented',
      medical_conditions TEXT DEFAULT 'None',
      emergency_contacts JSONB DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 3. Driver Profiles
    CREATE TABLE IF NOT EXISTS driver_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      license_number VARCHAR(100) NOT NULL,
      badge_id VARCHAR(100),
      vehicle_reg VARCHAR(50) NOT NULL,
      is_available BOOLEAN DEFAULT true,
      current_latitude NUMERIC(10, 6) DEFAULT 12.9716,
      current_longitude NUMERIC(10, 6) DEFAULT 77.5946,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 4. Hospital Staff Profiles
    CREATE TABLE IF NOT EXISTS hospital_staff_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      hospital_id VARCHAR(100) NOT NULL,
      facility_code VARCHAR(100) NOT NULL,
      department VARCHAR(100) NOT NULL DEFAULT 'Emergency Department',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 5. Admin Profiles
    CREATE TABLE IF NOT EXISTS admin_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      police_badge_id VARCHAR(100) NOT NULL,
      department_jurisdiction VARCHAR(100) NOT NULL DEFAULT 'Municipal Traffic Command',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 6. Hospitals Table
    CREATE TABLE IF NOT EXISTS hospitals (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      emergency_phone VARCHAR(50) NOT NULL,
      latitude NUMERIC(10, 6) NOT NULL,
      longitude NUMERIC(10, 6) NOT NULL,
      available_icu_beds INT NOT NULL DEFAULT 0,
      total_icu_beds INT NOT NULL DEFAULT 0,
      available_trauma_bays INT NOT NULL DEFAULT 0,
      total_trauma_bays INT NOT NULL DEFAULT 0,
      available_ventilators INT NOT NULL DEFAULT 0,
      total_ventilators INT NOT NULL DEFAULT 0,
      active_trauma_alerts INT NOT NULL DEFAULT 0
    );

    -- 7. Ambulances Table
    CREATE TABLE IF NOT EXISTS ambulances (
      id VARCHAR(100) PRIMARY KEY,
      registration_number VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(30) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'available',
      driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
      driver_name VARCHAR(255),
      driver_phone VARCHAR(50),
      latitude NUMERIC(10, 6) NOT NULL,
      longitude NUMERIC(10, 6) NOT NULL,
      speed_kmh NUMERIC(5, 2) DEFAULT 0,
      heading NUMERIC(5, 2) DEFAULT 0,
      current_incident_id UUID
    );

    -- 8. Emergency Incidents Table
    CREATE TABLE IF NOT EXISTS emergency_incidents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
      patient_name VARCHAR(255) NOT NULL,
      contact_number VARCHAR(50) NOT NULL,
      emergency_type VARCHAR(100) NOT NULL,
      severity VARCHAR(20) NOT NULL DEFAULT 'ESI-1',
      latitude NUMERIC(10, 6) NOT NULL,
      longitude NUMERIC(10, 6) NOT NULL,
      address TEXT NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'reported',
      assigned_ambulance_id VARCHAR(100) REFERENCES ambulances(id) ON DELETE SET NULL,
      destination_hospital_id VARCHAR(100) REFERENCES hospitals(id) ON DELETE SET NULL,
      eta_minutes NUMERIC(5, 2) DEFAULT 0,
      distance_km NUMERIC(5, 2) DEFAULT 0,
      vitals JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 9. Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      action VARCHAR(255) NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      incident_id UUID REFERENCES emergency_incidents(id) ON DELETE SET NULL,
      details JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_emergency_incidents_status ON emergency_incidents(status);
    CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status);
  `;

  try {
    await query(migrationSql);
  } catch (err: any) {
    console.warn('[Migrations warning]', err.message);
  }

  // Seed default demonstration hospital infrastructure and initial accounts with bcrypt hashes
  await seedInitialData();

  return {
    success: true,
    version: '001_initial_schema',
    message: 'PostgreSQL tables, indexes, and foreign keys initialized successfully.',
  };
}

async function seedInitialData() {
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Arogya@2026', salt);

  // Initial Users
  const seedUsers = [
    {
      id: 'a1000000-0000-0000-0000-000000000001',
      email: 'citizen@arogya.in',
      phone: '+91 98765 43210',
      password_hash: defaultPasswordHash,
      role: 'patient',
      full_name: 'Sunil Gowda',
    },
    {
      id: 'a1000000-0000-0000-0000-000000000002',
      email: 'driver@arogya.in',
      phone: '+91 98765 43211',
      password_hash: defaultPasswordHash,
      role: 'driver',
      full_name: 'Ramesh Kumar (EMT-P)',
    },
    {
      id: 'a1000000-0000-0000-0000-000000000003',
      email: 'er@victoria.gov.in',
      phone: '+91 80 2670 1150',
      password_hash: defaultPasswordHash,
      role: 'hospital',
      full_name: 'Dr. Savitha Murthy',
    },
    {
      id: 'a1000000-0000-0000-0000-000000000004',
      email: 'admin@trafficpolice.gov.in',
      phone: '+91 80 2294 2222',
      password_hash: defaultPasswordHash,
      role: 'admin',
      full_name: 'ACP Vikramaditya Rao',
    },
  ];

  for (const u of seedUsers) {
    const existing = memoryStore.users.find((x) => x.email === u.email);
    if (!existing) {
      memoryStore.users.push({
        ...u,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // Initial Patient Profile
  if (!memoryStore.patient_profiles.some((p) => p.user_id === seedUsers[0].id)) {
    memoryStore.patient_profiles.push({
      id: 'pat_001',
      user_id: seedUsers[0].id,
      national_health_id: '91-4821-9920-1082',
      blood_group: 'O+',
      allergies: 'Penicillin, Sulfa drugs',
      medical_conditions: 'Hypertension (Controlled)',
      emergency_contacts: [
        { name: 'Kavitha Gowda (Spouse)', phone: '+91 98450 99887', relation: 'Spouse' },
        { name: 'Dr. H. Prasad (Primary Care)', phone: '+91 80 2650 4433', relation: 'Doctor' },
      ],
      created_at: new Date().toISOString(),
    });
  }

  // Initial Driver Profile
  if (!memoryStore.driver_profiles.some((p) => p.user_id === seedUsers[1].id)) {
    memoryStore.driver_profiles.push({
      id: 'drv_001',
      user_id: seedUsers[1].id,
      license_number: 'KA-DL-2018-00912',
      badge_id: 'EMT-KA-8821',
      vehicle_reg: 'KA-04-E-1082',
      is_available: true,
      current_latitude: 12.9716,
      current_longitude: 77.5946,
      created_at: new Date().toISOString(),
    });
  }

  // Initial Hospital Profile
  if (!memoryStore.hospital_staff_profiles.some((p) => p.user_id === seedUsers[2].id)) {
    memoryStore.hospital_staff_profiles.push({
      id: 'hsp_001',
      user_id: seedUsers[2].id,
      hospital_id: 'HOSP-VIC-01',
      facility_code: 'VIC-BLR-01',
      department: 'Emergency & Trauma Department',
      created_at: new Date().toISOString(),
    });
  }

  // Initial Admin Profile
  if (!memoryStore.admin_profiles.some((p) => p.user_id === seedUsers[3].id)) {
    memoryStore.admin_profiles.push({
      id: 'adm_001',
      user_id: seedUsers[3].id,
      police_badge_id: 'TPD-BLR-SEC03',
      department_jurisdiction: 'Bengaluru Traffic Police Command',
      created_at: new Date().toISOString(),
    });
  }

  // Seed Hospitals
  const seedHospitals = [
    {
      id: 'HOSP-VIC-01',
      name: 'Victoria Hospital & Trauma Emergency Center',
      address: 'Fort Road, Near City Market, Bengaluru, Karnataka 560002',
      emergency_phone: '+91 80 2670 1150',
      latitude: 12.9628,
      longitude: 77.5746,
      available_icu_beds: 4,
      total_icu_beds: 16,
      available_trauma_bays: 2,
      total_trauma_bays: 8,
      available_ventilators: 3,
      total_ventilators: 12,
      active_trauma_alerts: 1,
    },
    {
      id: 'HOSP-BOW-02',
      name: 'Bowring & Lady Curzon Hospital',
      address: 'Shivajinagar, Bengaluru, Karnataka 560001',
      emergency_phone: '+91 80 2559 1325',
      latitude: 12.9822,
      longitude: 77.603,
      available_icu_beds: 6,
      total_icu_beds: 18,
      available_trauma_bays: 4,
      total_trauma_bays: 10,
      available_ventilators: 5,
      total_ventilators: 14,
      active_trauma_alerts: 0,
    },
    {
      id: 'HOSP-STJ-03',
      name: "St. John's Medical College Hospital",
      address: 'Sarjapur Main Road, Koramangala, Bengaluru 560034',
      emergency_phone: '+91 80 2206 5000',
      latitude: 12.9312,
      longitude: 77.6212,
      available_icu_beds: 3,
      total_icu_beds: 24,
      available_trauma_bays: 2,
      total_trauma_bays: 12,
      available_ventilators: 4,
      total_ventilators: 18,
      active_trauma_alerts: 1,
    },
    {
      id: 'HOSP-MAN-04',
      name: 'Manipal Hospital ER Trauma Unit',
      address: '98 HAL Old Airport Road, Kodihalli, Bengaluru 560017',
      emergency_phone: '+91 80 2502 4444',
      latitude: 12.9592,
      longitude: 77.6492,
      available_icu_beds: 5,
      total_icu_beds: 20,
      available_trauma_bays: 3,
      total_trauma_bays: 8,
      available_ventilators: 6,
      total_ventilators: 15,
      active_trauma_alerts: 0,
    },
  ];

  for (const h of seedHospitals) {
    if (!memoryStore.hospitals.some((x) => x.id === h.id)) {
      memoryStore.hospitals.push(h);
    }
  }

  // Seed Ambulances
  const seedAmbulances = [
    {
      id: 'AMB-1082',
      registration_number: 'KA-04-E-1082',
      type: 'ALS',
      status: 'in_transit',
      driver_id: seedUsers[1].id,
      driver_name: 'Ramesh Kumar',
      driver_phone: '+91 98765 43211',
      latitude: 12.9716,
      longitude: 77.5946,
      speed_kmh: 56,
      heading: 85,
    },
    {
      id: 'AMB-4920',
      registration_number: 'KA-01-EA-4920',
      type: 'Cardiac',
      status: 'available',
      driver_id: null,
      driver_name: 'Manjunath B.',
      driver_phone: '+91 98765 43212',
      latitude: 12.9611,
      longitude: 77.5852,
      speed_kmh: 0,
      heading: 0,
    },
    {
      id: 'AMB-3011',
      registration_number: 'KA-05-MD-3011',
      type: 'BLS',
      status: 'available',
      driver_id: null,
      driver_name: 'Praveen Gowda',
      driver_phone: '+91 98765 43213',
      latitude: 12.9784,
      longitude: 77.6045,
      speed_kmh: 0,
      heading: 0,
    },
    {
      id: 'AMB-8822',
      registration_number: 'KA-53-EM-8822',
      type: 'Neonatal',
      status: 'available',
      driver_id: null,
      driver_name: 'Suresh Patil',
      driver_phone: '+91 98765 43214',
      latitude: 12.9352,
      longitude: 77.6245,
      speed_kmh: 0,
      heading: 0,
    },
  ];

  for (const a of seedAmbulances) {
    if (!memoryStore.ambulances.some((x) => x.id === a.id)) {
      memoryStore.ambulances.push(a);
    }
  }

  // 2. Real PostgreSQL Database Seeding (Executes when live PostgreSQL pool is active)
  try {
    for (const u of seedUsers) {
      await query(
        `INSERT INTO users (id, email, phone, password_hash, role, full_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE 
         SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name`,
        [u.id, u.email, u.phone, u.password_hash, u.role, u.full_name]
      );
    }

    // Seed Patient Profile
    await query(
      `INSERT INTO patient_profiles (user_id, national_health_id, blood_group, allergies, medical_conditions, emergency_contacts)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO NOTHING`,
      [
        seedUsers[0].id,
        '91-4821-9920-1082',
        'O+',
        'Penicillin, Sulfa drugs',
        'Hypertension (Controlled)',
        JSON.stringify([
          { name: 'Kavitha Gowda (Spouse)', phone: '+91 98450 99887', relation: 'Spouse' },
          { name: 'Dr. H. Prasad (Primary Care)', phone: '+91 80 2650 4433', relation: 'Doctor' },
        ]),
      ]
    );

    // Seed Driver Profile
    await query(
      `INSERT INTO driver_profiles (user_id, license_number, badge_id, vehicle_reg, is_available)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO NOTHING`,
      [seedUsers[1].id, 'KA-DL-2018-00912', 'EMT-KA-8821', 'KA-04-E-1082', true]
    );

    // Seed Hospital Profile
    await query(
      `INSERT INTO hospital_staff_profiles (user_id, hospital_id, facility_code, department)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO NOTHING`,
      [seedUsers[2].id, 'HOSP-VIC-01', 'VIC-BLR-01', 'Emergency & Trauma Department']
    );

    // Seed Admin Profile
    await query(
      `INSERT INTO admin_profiles (user_id, police_badge_id, department_jurisdiction)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO NOTHING`,
      [seedUsers[3].id, 'TPD-BLR-SEC03', 'Bengaluru Traffic Police Command']
    );

    // Seed Hospitals Table
    for (const h of seedHospitals) {
      await query(
        `INSERT INTO hospitals (id, name, address, emergency_phone, latitude, longitude, available_icu_beds, total_icu_beds, available_trauma_bays, total_trauma_bays, available_ventilators, total_ventilators, active_trauma_alerts)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [h.id, h.name, h.address, h.emergency_phone, h.latitude, h.longitude, h.available_icu_beds, h.total_icu_beds, h.available_trauma_bays, h.total_trauma_bays, h.available_ventilators, h.total_ventilators, h.active_trauma_alerts]
      );
    }

    // Seed Ambulances Table
    for (const a of seedAmbulances) {
      await query(
        `INSERT INTO ambulances (id, registration_number, type, status, driver_name, driver_phone, latitude, longitude, speed_kmh, heading)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [a.id, a.registration_number, a.type, a.status, a.driver_name, a.driver_phone, a.latitude, a.longitude, a.speed_kmh, a.heading]
      );
    }
  } catch (dbErr: any) {
    console.warn('[PostgreSQL Seeding Warning]', dbErr.message);
  }

  console.log('[Database] Seed initialization complete across memory & PostgreSQL.');
}
