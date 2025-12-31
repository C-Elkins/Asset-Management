import { ipcMain } from 'electron';
import { getDatabase } from '../database/db';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const SALT_ROUNDS = 12; // bcrypt work factor - higher = more secure but slower
const MAX_LOGIN_ATTEMPTS = 5; // Maximum failed login attempts before lockout
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const SESSION_FILE = path.join(app.getPath('userData'), 'session.json');

// Rate limiting storage
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const loginAttempts: Map<string, LoginAttempt> = new Map();

// Session storage - will be persisted to disk
let currentSession: { userId: number; username: string; role: string } | null = null;

/**
 * Load session from disk (called on app startup)
 */
function loadSession(): void {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf8');
      const session = JSON.parse(data);

      // Validate session data
      if (session && session.userId && session.username && session.role) {
        currentSession = session;
        console.log(`Session restored for user: ${session.username}`);
      }
    }
  } catch (error) {
    console.error('Failed to load session:', error);
    // Delete corrupted session file
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  }
}

/**
 * Save session to disk
 */
function saveSession(): void {
  try {
    if (currentSession) {
      fs.writeFileSync(SESSION_FILE, JSON.stringify(currentSession), {
        encoding: 'utf8',
        mode: 0o600 // Read/write for owner only
      });
    } else {
      // Delete session file on logout
      if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
      }
    }
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Hash a password using bcrypt
 * Much more secure than SHA-256 - designed for password hashing
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against bcrypt hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if user is rate limited
 */
function isRateLimited(username: string): { limited: boolean; remainingTime?: number } {
  const attempt = loginAttempts.get(username);

  if (!attempt) {
    return { limited: false };
  }

  const now = Date.now();

  // Check if user is currently locked out
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const remainingTime = Math.ceil((attempt.lockedUntil - now) / 1000 / 60); // minutes
    return { limited: true, remainingTime };
  }

  // Reset lockout if duration has passed
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.delete(username);
    return { limited: false };
  }

  return { limited: false };
}

/**
 * Record a failed login attempt
 */
function recordFailedAttempt(username: string): void {
  const attempt = loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
  const now = Date.now();

  // Reset count if last attempt was more than 15 minutes ago
  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    attempt.count = 0;
  }

  attempt.count++;
  attempt.lastAttempt = now;

  // Lock account if max attempts reached
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
    console.warn(`Account locked due to too many failed attempts: ${username}`);
  }

  loginAttempts.set(username, attempt);
}

/**
 * Clear failed login attempts (on successful login)
 */
function clearFailedAttempts(username: string): void {
  loginAttempts.delete(username);
}

/**
 * Setup all authentication-related IPC handlers
 */
export function setupAuthHandlers() {
  const db = getDatabase();

  // Load persisted session on startup
  loadSession();

  // Login with rate limiting
  ipcMain.handle('auth:login', async (_, credentials: { username: string; password: string }) => {
    try {
      const { username, password } = credentials;

      // Validate input
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Check rate limiting
      const rateLimitCheck = isRateLimited(username);
      if (rateLimitCheck.limited) {
        throw new Error(`Too many failed login attempts. Account locked for ${rateLimitCheck.remainingTime} more minutes.`);
      }

      // Find user
      const user = db.prepare(`
        SELECT id, username, password_hash, full_name, role, is_active, created_at, last_login_at, updated_at
        FROM users
        WHERE username = ? AND is_active = 1
      `).get(username) as any;

      if (!user) {
        recordFailedAttempt(username);
        throw new Error('Invalid username or password');
      }

      // Verify password with bcrypt
      const isValidPassword = await verifyPassword(password, user.password_hash);

      if (!isValidPassword) {
        recordFailedAttempt(username);
        throw new Error('Invalid username or password');
      }

      // Clear failed attempts on successful login
      clearFailedAttempts(username);

      // Update last login time
      db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

      // Create and persist session
      currentSession = {
        userId: user.id,
        username: user.username,
        role: user.role
      };
      saveSession();

      // Get updated user data (without password hash)
      const updatedUser = db.prepare(`
        SELECT id, username, full_name, role, is_active, created_at, last_login_at, updated_at
        FROM users
        WHERE id = ?
      `).get(user.id);

      console.log(`User logged in: ${username} (${user.role})`);

      return {
        user: updatedUser,
        loggedIn: true
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  });

  // Logout with session cleanup
  ipcMain.handle('auth:logout', async () => {
    const username = currentSession?.username;
    currentSession = null;
    saveSession(); // Clear persisted session
    if (username) {
      console.log(`User logged out: ${username}`);
    }
    return { success: true };
  });

  // Get current user (with session validation)
  ipcMain.handle('auth:getCurrentUser', async () => {
    if (!currentSession) {
      return null;
    }

    try {
      const user = db.prepare(`
        SELECT id, username, full_name, role, is_active, created_at, last_login_at, updated_at
        FROM users
        WHERE id = ? AND is_active = 1
      `).get(currentSession.userId);

      // Invalidate session if user not found or inactive
      if (!user) {
        currentSession = null;
        saveSession();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  });

  // Create user with bcrypt password hashing (admin only, OR first user creation)
  ipcMain.handle('auth:createUser', async (_, userData: { username: string; password: string; full_name: string; role?: string }) => {
    try {
      // Check if any users exist (allow first user creation without auth)
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      const isFirstUser = userCount.count === 0;

      // Check if user is logged in and is admin (unless this is the first user)
      if (!isFirstUser && (!currentSession || currentSession.role !== 'admin')) {
        throw new Error('Admin access required');
      }

      const { username, password, full_name, role = isFirstUser ? 'admin' : 'user' } = userData;

      // Validate input
      if (!username || !password || !full_name) {
        throw new Error('Username, password, and full name are required');
      }

      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (role !== 'admin' && role !== 'user') {
        throw new Error('Invalid role. Must be "admin" or "user"');
      }

      // Check if username already exists
      const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (existing) {
        throw new Error('Username already exists');
      }

      // Hash password with bcrypt
      const passwordHash = await hashPassword(password);

      // Insert user
      const result = db.prepare(`
        INSERT INTO users (username, password_hash, full_name, role, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(username, passwordHash, full_name, role);

      // Fetch and return created user
      const newUser = db.prepare(`
        SELECT id, username, full_name, role, is_active, created_at, last_login_at, updated_at
        FROM users
        WHERE id = ?
      `).get(result.lastInsertRowid);

      console.log(`User created: ${username} (${role})`);
      return newUser;
    } catch (error: any) {
      console.error('Create user error:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  });

  // Get all users (admin only)
  ipcMain.handle('auth:getAllUsers', async () => {
    try {
      // Check if user is logged in and is admin
      if (!currentSession || currentSession.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const users = db.prepare(`
        SELECT id, username, full_name, role, is_active, created_at, last_login_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `).all();

      return users;
    } catch (error: any) {
      console.error('Get all users error:', error);
      throw new Error(error.message || 'Failed to fetch users');
    }
  });

  // Update user with bcrypt for password changes (admin only)
  ipcMain.handle('auth:updateUser', async (_, id: number, updates: { full_name?: string; role?: string; is_active?: number; password?: string }) => {
    try {
      // Check if user is logged in and is admin
      if (!currentSession || currentSession.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const updateParts: string[] = [];
      const values: any[] = [];

      if (updates.full_name !== undefined) {
        updateParts.push('full_name = ?');
        values.push(updates.full_name);
      }

      if (updates.role !== undefined) {
        if (updates.role !== 'admin' && updates.role !== 'user') {
          throw new Error('Invalid role');
        }
        updateParts.push('role = ?');
        values.push(updates.role);
      }

      if (updates.is_active !== undefined) {
        updateParts.push('is_active = ?');
        values.push(updates.is_active);
      }

      if (updates.password !== undefined) {
        if (updates.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        updateParts.push('password_hash = ?');
        const hashedPassword = await hashPassword(updates.password);
        values.push(hashedPassword);
      }

      if (updateParts.length === 0) {
        return { success: true };
      }

      updateParts.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      db.prepare(`
        UPDATE users
        SET ${updateParts.join(', ')}
        WHERE id = ?
      `).run(...values);

      console.log(`User ${id} updated`);
      return { success: true };
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  });

  // Delete user (admin only)
  ipcMain.handle('auth:deleteUser', async (_, id: number) => {
    try {
      // Check if user is logged in and is admin
      if (!currentSession || currentSession.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Prevent deleting yourself
      if (currentSession.userId === id) {
        throw new Error('Cannot delete your own account');
      }

      // Check if user exists
      const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id) as any;
      if (!user) {
        throw new Error('User not found');
      }

      // Delete user
      db.prepare('DELETE FROM users WHERE id = ?').run(id);

      console.log(`User deleted: ${user.username}`);
      return { success: true };
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  });

  // Change password with bcrypt (any logged-in user)
  ipcMain.handle('auth:changePassword', async (_, oldPassword: string, newPassword: string) => {
    try {
      // Check if user is logged in
      if (!currentSession) {
        throw new Error('Must be logged in to change password');
      }

      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      // Get current user
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(currentSession.userId) as any;

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password with bcrypt
      const isValidPassword = await verifyPassword(oldPassword, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password with bcrypt
      const newPasswordHash = await hashPassword(newPassword);

      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newPasswordHash, currentSession.userId);

      console.log(`Password changed for user ${currentSession.username}`);
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  });

  console.log('Auth IPC handlers registered');
}
