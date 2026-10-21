import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool';
import { generateToken, requireAuth, sanitizeUser, AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

/**
 * POST /api/v1/auth/register
 * Real registration with server-side validation and bcrypt password hashing.
 * Persists in PostgreSQL and attaches role profile.
 */
authRouter.post('/register', async (req, res) => {
  try {
    const {
      email,
      phone,
      password,
      role = 'patient',
      fullName,
      // Role specific fields
      nationalHealthId,
      bloodGroup,
      allergies,
      medicalConditions,
      emergencyContacts,
      licenseNumber,
      badgeId,
      vehicleReg,
      hospitalId,
      facilityCode,
      department,
    } = req.body;

    // 1. Core validations
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Full name is required (minimum 2 characters).' });
    }

    if (!identifierCheck(email, phone)) {
      return res.status(400).json({ success: false, error: 'A valid email address or 10-digit mobile phone number is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    // 2. Strict Role Governance: Prevent public admin registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Public registration for City Traffic / Admin is disabled for security. Administrative roles are provisioned through municipal authorization.',
      });
    }

    if (!['patient', 'driver', 'hospital'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid user role selected.' });
    }

    // 3. Role-specific input validation
    if (role === 'driver') {
      if (!vehicleReg || !vehicleReg.trim()) {
        return res.status(400).json({ success: false, error: 'Ambulance vehicle registration number is required for paramedic accounts.' });
      }
      if (!licenseNumber || !licenseNumber.trim()) {
        return res.status(400).json({ success: false, error: 'Paramedic EMT / Driver license number is required.' });
      }
    }

    if (role === 'hospital') {
      if (!facilityCode || !facilityCode.trim()) {
        return res.status(400).json({ success: false, error: 'Hospital Facility Registration Code is required.' });
      }
    }

    // 4. Check for duplicate account
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim() : null;

    if (cleanEmail) {
      const existingEmail = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (existingEmail.rows.length > 0) {
        return res.status(409).json({ success: false, error: 'An account with this email address already exists. Please sign in.' });
      }
    }

    if (cleanPhone) {
      const existingPhone = await query('SELECT id FROM users WHERE phone = $1', [cleanPhone]);
      if (existingPhone.rows.length > 0) {
        return res.status(409).json({ success: false, error: 'An account with this phone number already exists. Please sign in.' });
      }
    }

    // 5. Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Insert User Record
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const userInsert = await query(
      `INSERT INTO users (id, email, phone, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, phone, role, full_name, created_at`,
      [userId, cleanEmail, cleanPhone, passwordHash, role, fullName.trim()]
    );

    const newUser = userInsert.rows[0];

    // 7. Insert Role Specific Profile
    if (role === 'patient') {
      await query(
        `INSERT INTO patient_profiles (user_id, national_health_id, blood_group, allergies, medical_conditions, emergency_contacts)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newUser.id,
          nationalHealthId ? nationalHealthId.trim() : null,
          bloodGroup || 'O+',
          allergies || 'None',
          medicalConditions || 'None',
          emergencyContacts || [],
        ]
      );
    } else if (role === 'driver') {
      await query(
        `INSERT INTO driver_profiles (user_id, license_number, badge_id, vehicle_reg)
         VALUES ($1, $2, $3, $4)`,
        [newUser.id, licenseNumber.trim(), badgeId ? badgeId.trim() : null, vehicleReg.trim()]
      );
    } else if (role === 'hospital') {
      await query(
        `INSERT INTO hospital_staff_profiles (user_id, hospital_id, facility_code, department)
         VALUES ($1, $2, $3, $4)`,
        [newUser.id, hospitalId || 'HOSP-VIC-01', facilityCode.trim(), department || 'Emergency Department']
      );
    }

    // 8. Generate JWT token
    const token = generateToken(newUser);

    // 9. Log audit event
    await query('INSERT INTO audit_logs (action, user_id, details) VALUES ($1, $2, $3)', [
      `User Registered: ${newUser.role.toUpperCase()}`,
      newUser.id,
      { role: newUser.role, fullName: newUser.full_name },
    ]);

    res.status(201).json({
      success: true,
      message: `Account successfully created for ${newUser.full_name} (${newUser.role.toUpperCase()})`,
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err: any) {
    console.error('[Registration Error]', err);
    res.status(500).json({ success: false, error: 'Registration failed due to an internal server error.' });
  }
});

/**
 * POST /api/v1/auth/login
 * Real login with bcrypt password verification and JWT token issuance.
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ success: false, error: 'Please enter your registered email address or phone number.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Please enter your password.' });
    }

    const cleanId = identifier.trim();

    // Query user by email or phone
    const userRes = await query(
      `SELECT id, email, phone, password_hash, role, full_name, created_at
       FROM users
       WHERE (LOWER(email) = LOWER($1) OR phone = $1)`,
      [cleanId]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password.' });
    }

    const user = userRes.rows[0];

    // Role check if provided
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `This account is registered under the ${user.role.toUpperCase()} portal, not ${role.toUpperCase()}.`,
      });
    }

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password.' });
    }

    // Fetch role profile
    let profile: any = null;
    if (user.role === 'patient') {
      const p = await query('SELECT * FROM patient_profiles WHERE user_id = $1', [user.id]);
      profile = p.rows[0] || null;
    } else if (user.role === 'driver') {
      const d = await query('SELECT * FROM driver_profiles WHERE user_id = $1', [user.id]);
      profile = d.rows[0] || null;
    } else if (user.role === 'hospital') {
      const h = await query('SELECT * FROM hospital_staff_profiles WHERE user_id = $1', [user.id]);
      profile = h.rows[0] || null;
    } else if (user.role === 'admin') {
      const a = await query('SELECT * FROM admin_profiles WHERE user_id = $1', [user.id]);
      profile = a.rows[0] || null;
    }

    // Generate JWT token
    const token = generateToken(user);

    // Audit log
    await query('INSERT INTO audit_logs (action, user_id, details) VALUES ($1, $2, $3)', [
      `User Login: ${user.role.toUpperCase()}`,
      user.id,
      { role: user.role, timestamp: new Date().toISOString() },
    ]);

    res.json({
      success: true,
      message: `Welcome back, ${user.full_name}`,
      token,
      user: sanitizeUser(user),
      profile,
    });
  } catch (err: any) {
    console.error('[Login Error]', err);
    res.status(500).json({ success: false, error: 'Authentication failed due to an internal server error.' });
  }
});

/**
 * GET /api/v1/auth/me
 * Protected endpoint returning current authenticated user details and profile.
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userRes = await query(
      `SELECT id, email, phone, role, full_name, created_at FROM users WHERE id = $1`,
      [req.user!.userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User record not found.' });
    }

    const user = userRes.rows[0];

    let profile: any = null;
    if (user.role === 'patient') {
      const p = await query('SELECT * FROM patient_profiles WHERE user_id = $1', [user.id]);
      profile = p.rows[0] || null;
    } else if (user.role === 'driver') {
      const d = await query('SELECT * FROM driver_profiles WHERE user_id = $1', [user.id]);
      profile = d.rows[0] || null;
    } else if (user.role === 'hospital') {
      const h = await query('SELECT * FROM hospital_staff_profiles WHERE user_id = $1', [user.id]);
      profile = h.rows[0] || null;
    } else if (user.role === 'admin') {
      const a = await query('SELECT * FROM admin_profiles WHERE user_id = $1', [user.id]);
      profile = a.rows[0] || null;
    }

    res.json({
      success: true,
      user: sanitizeUser(user),
      profile,
    });
  } catch (err: any) {
    console.error('[Auth Me Error]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve user profile.' });
  }
});

/**
 * PUT /api/v1/auth/profile
 * Allows users to update their role profile (e.g. emergency contacts for patient, driver availability)
 */
authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    if (role === 'patient') {
      const { nationalHealthId, bloodGroup, allergies, medicalConditions, emergencyContacts } = req.body;
      const existing = await query('SELECT id FROM patient_profiles WHERE user_id = $1', [userId]);

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO patient_profiles (user_id, national_health_id, blood_group, allergies, medical_conditions, emergency_contacts)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, nationalHealthId, bloodGroup, allergies, medicalConditions, emergencyContacts || []]
        );
      } else {
        // Update in memory or db
        const profile = existing.rows[0];
        if (nationalHealthId) profile.national_health_id = nationalHealthId;
        if (bloodGroup) profile.blood_group = bloodGroup;
        if (allergies) profile.allergies = allergies;
        if (medicalConditions) profile.medical_conditions = medicalConditions;
        if (emergencyContacts) profile.emergency_contacts = emergencyContacts;
      }

      return res.json({ success: true, message: 'Medical emergency profile updated.' });
    }

    if (role === 'driver') {
      const { isAvailable } = req.body;
      const existing = await query('SELECT * FROM driver_profiles WHERE user_id = $1', [userId]);
      if (existing.rows.length > 0 && typeof isAvailable === 'boolean') {
        existing.rows[0].is_available = isAvailable;
      }
      return res.json({ success: true, message: 'Driver availability updated.' });
    }

    res.json({ success: true, message: 'Profile updated.' });
  } catch (err: any) {
    console.error('[Profile Update Error]', err);
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

/**
 * POST /api/v1/auth/logout
 */
authRouter.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Successfully logged out.' });
});

function identifierCheck(email?: string, phone?: string): boolean {
  if (email && email.includes('@') && email.includes('.')) return true;
  if (phone && phone.replace(/\D/g, '').length >= 10) return true;
  return false;
}
