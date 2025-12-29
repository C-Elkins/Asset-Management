import React, { useState, useEffect } from 'react';
import { Attachment } from '../types/api';
import { Upload, FileText, Download, Trash2, Eye, Image, FileSpreadsheet, File as FileIcon } from 'lucide-react';

interface AttachmentManagerProps {
  assetId: number;
  canEdit?: boolean;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({ assetId, canEdit = true }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [assetId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await window.api.getAttachments(assetId);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      await window.api.uploadAttachment(assetId);
      await loadAttachments();
    } catch (error: any) {
      if (error.message !== 'No file selected') {
        alert(`Failed to upload attachment: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, fileName: string) => {
    if (!confirm(`Delete attachment "${fileName}"?`)) return;

    try {
      await window.api.deleteAttachment(id);
      await loadAttachments();
    } catch (error: any) {
      alert(`Failed to delete attachment: ${error.message}`);
    }
  };

  const handleOpen = async (id: number) => {
    try {
      await window.api.openAttachment(id);
    } catch (error: any) {
      alert(`Failed to open attachment: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileIcon size={20} className="text-gray-400" />;

    if (fileType.startsWith('image/')) {
      return <Image size={20} className="text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={20} className="text-red-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet size={20} className="text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText size={20} className="text-blue-600" />;
    } else {
      return <FileIcon size={20} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Attachments ({attachments.length})
        </h3>
        {canEdit && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-2">No attachments yet</p>
          {canEdit && (
            <button
              onClick={handleUpload}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Upload your first file
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
            >
              <div className="flex-shrink-0">
                {getFileIcon(attachment.file_type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.file_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(attachment.file_size)}</span>
                  <span>•</span>
                  <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                  {attachment.uploaded_by && (
                    <>
                      <span>•</span>
                      <span>{attachment.uploaded_by}</span>
                    </>
                  )}
                </div>
                {attachment.description && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {attachment.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpen(attachment.id)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                  title="Open"
                >
                  <Eye size={16} />
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(attachment.id, attachment.file_name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
