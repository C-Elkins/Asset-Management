import { ipcMain, dialog, shell } from 'electron';
import { getDatabase } from '../database/db';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

// Get the user data directory for storing attachments
const getAttachmentsDir = () => {
  const userDataPath = app.getPath('userData');
  const attachmentsPath = path.join(userDataPath, 'attachments');

  // Create directory if it doesn't exist
  if (!fs.existsSync(attachmentsPath)) {
    fs.mkdirSync(attachmentsPath, { recursive: true });
  }

  return attachmentsPath;
};

/**
 * Generate a unique filename to avoid collisions
 */
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  return `${nameWithoutExt}_${timestamp}_${random}${ext}`;
};

/**
 * Get file size in a human-readable format
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Setup all attachment-related IPC handlers
 */
export function setupAttachmentHandlers() {
  const db = getDatabase();

  // Get all attachments for an asset
  ipcMain.handle('get-attachments', async (_, assetId: number) => {
    try {
      const attachments = db.prepare(`
        SELECT id, asset_id, file_name, file_path, file_size, file_type,
               uploaded_by, description, created_at
        FROM attachments
        WHERE asset_id = ?
        ORDER BY created_at DESC
      `).all(assetId);

      return attachments;
    } catch (error: any) {
      console.error('Get attachments error:', error);
      throw new Error(error.message || 'Failed to fetch attachments');
    }
  });

  // Upload attachment (file selection dialog)
  ipcMain.handle('upload-attachment', async (_, assetId: number, description?: string) => {
    try {
      // Show file picker dialog
      const dialogResult = await dialog.showOpenDialog({
        title: 'Select File to Attach',
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls'] },
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
        ]
      });

      if (dialogResult.canceled || dialogResult.filePaths.length === 0) {
        throw new Error('No file selected');
      }

      const sourcePath = dialogResult.filePaths[0];
      const originalFileName = path.basename(sourcePath);
      const fileStats = fs.statSync(sourcePath);
      const fileSize = fileStats.size;

      // Get file type (MIME type approximation)
      const ext = path.extname(originalFileName).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
      };
      const fileType = mimeTypes[ext] || 'application/octet-stream';

      // Generate unique filename and destination path
      const uniqueFileName = generateUniqueFileName(originalFileName);
      const attachmentsDir = getAttachmentsDir();
      const destinationPath = path.join(attachmentsDir, uniqueFileName);

      // Copy file to attachments directory
      fs.copyFileSync(sourcePath, destinationPath);

      // Get current user (if available)
      let uploadedBy: string | null = null;
      try {
        // This would need to be passed from the auth context
        // For now, we'll leave it null or you can enhance this
        uploadedBy = null;
      } catch {
        uploadedBy = null;
      }

      // Insert attachment record into database
      const insertResult = db.prepare(`
        INSERT INTO attachments (asset_id, file_name, file_path, file_size, file_type, uploaded_by, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(assetId, originalFileName, destinationPath, fileSize, fileType, uploadedBy, description || null);

      // Fetch and return the created attachment
      const newAttachment = db.prepare(`
        SELECT id, asset_id, file_name, file_path, file_size, file_type,
               uploaded_by, description, created_at
        FROM attachments
        WHERE id = ?
      `).get(insertResult.lastInsertRowid);

      console.log(`Attachment uploaded: ${originalFileName} (${formatFileSize(fileSize)})`);
      return newAttachment;
    } catch (error: any) {
      console.error('Upload attachment error:', error);
      throw new Error(error.message || 'Failed to upload attachment');
    }
  });

  // Delete attachment
  ipcMain.handle('delete-attachment', async (_, id: number) => {
    try {
      // Get attachment info before deleting
      const attachment = db.prepare('SELECT file_path FROM attachments WHERE id = ?').get(id) as any;

      if (!attachment) {
        throw new Error('Attachment not found');
      }

      // Delete the file from disk
      try {
        if (fs.existsSync(attachment.file_path)) {
          fs.unlinkSync(attachment.file_path);
        }
      } catch (fileError) {
        console.warn('Failed to delete file from disk:', fileError);
        // Continue with database deletion even if file deletion fails
      }

      // Delete from database
      db.prepare('DELETE FROM attachments WHERE id = ?').run(id);

      console.log(`Attachment deleted: ID ${id}`);
      return { success: true };
    } catch (error: any) {
      console.error('Delete attachment error:', error);
      throw new Error(error.message || 'Failed to delete attachment');
    }
  });

  // Open attachment with default system application
  ipcMain.handle('open-attachment', async (_, id: number) => {
    try {
      // Get attachment info
      const attachment = db.prepare('SELECT file_path, file_name FROM attachments WHERE id = ?').get(id) as any;

      if (!attachment) {
        throw new Error('Attachment not found');
      }

      if (!fs.existsSync(attachment.file_path)) {
        throw new Error('File not found on disk');
      }

      // Open file with default application
      await shell.openPath(attachment.file_path);

      console.log(`Opened attachment: ${attachment.file_name}`);
      return { success: true };
    } catch (error: any) {
      console.error('Open attachment error:', error);
      throw new Error(error.message || 'Failed to open attachment');
    }
  });

  console.log('Attachment IPC handlers registered');
}
