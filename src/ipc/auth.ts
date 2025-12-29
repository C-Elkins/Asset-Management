import { ipcMain } from 'electron';
import { getDatabase } from '../database/db';
import * as crypto from 'crypto';

// In-memory session storage (simple implementation for desktop app)
let currentSession: { userId: number; username: string; role: string } | null = null;

/**
 * Hash a password using SHA-256
 * Note: In production, use bcrypt or argon2 for better security
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify password against stored hash
 */
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Setup all authentication-related IPC handlers
 */
export function setupAuthHandlers() {
  const db = getDatabase();

  // Login
  ipcMain.handle('auth:login', async (_, credentials: { username: string; password: string }) => {
    try {
      const { username, password } = credentials;

      // Validate input
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Find user
      const user = db.prepare(`
        SELECT id, username, password_hash, full_name, role, is_active, created_at, last_login_at, updated_at
        FROM users
        WHERE username = ? AND is_active = 1
      `).get(username) as any;

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify password
      if (!verifyPassword(password, user.password_hash)) {
        throw new Error('Invalid username or password');
      }

      // Update last login time
      db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

      // Create session
      currentSession = {
        userId: user.id,
        username: user.username,
        role: user.role
      };

      // Return user data (without password hash)
      const { password_hash, ...userWithoutPassword } = user;

      // Update last_login_at to current timestamp
      const updatedUser = db.prepare(`
        SELECT id, username, full_name, role, is_active, created_at, last_login_at, updated_at
        FROM users
        WHERE id = ?
      `).get(user.id);

      return {
        user: updatedUser,
        loggedIn: true
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  });

  // Logout
  ipcMain.handle('auth:logout', async () => {
    currentSession = null;
    return { success: true };
  });

  // Get current user
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

      return user || null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  });

  // Create user (admin only)
  ipcMain.handle('auth:createUser', async (_, userData: { username: string; password: string; full_name: string; role?: string }) => {
    try {
      // Check if user is logged in and is admin
      if (!currentSession || currentSession.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const { username, password, full_name, role = 'user' } = userData;

      // Validate input
      if (!username || !password || !full_name) {
        throw new Error('Username, password, and full name are required');
      }

      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (role !== 'admin' && role !== 'user') {
        throw new Error('Invalid role. Must be "admin" or "user"');
      }

      // Check if username already exists
      const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (existing) {
        throw new Error('Username already exists');
      }

      // Hash password
      const passwordHash = hashPassword(password);

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

  // Update user (admin only)
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
        if (updates.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        updateParts.push('password_hash = ?');
        values.push(hashPassword(updates.password));
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

  // Change password (any logged-in user)
  ipcMain.handle('auth:changePassword', async (_, oldPassword: string, newPassword: string) => {
    try {
      // Check if user is logged in
      if (!currentSession) {
        throw new Error('Must be logged in to change password');
      }

      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }

      // Get current user
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(currentSession.userId) as any;

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      if (!verifyPassword(oldPassword, user.password_hash)) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const newPasswordHash = hashPassword(newPassword);
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
