"use client";

import { useState, useRef } from "react";

interface AssetFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

interface FileUploadProps {
  assetId: number;
  existingFiles: AssetFile[];
  onFilesChange: (files: AssetFile[]) => void;
  disabled?: boolean;
}

export default function AssetFileUpload({
  assetId,
  existingFiles,
  onFilesChange,
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎬";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊";
    return "📎";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");
    setUploadProgress(`Uploading ${files.length} file(s)...`);

    try {
      const formData = new FormData();
      formData.append("assetId", assetId.toString());
      
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch("/api/asset-files", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const uploadedFiles = await response.json();
        onFilesChange([...existingFiles, ...uploadedFiles]);
        setUploadProgress("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to upload files");
      }
    } catch (err) {
      setError("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(`/api/asset-files/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onFilesChange(existingFiles.filter((f) => f.id !== fileId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete file");
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting");
    }
  };

  const isImageFile = (fileType: string) => fileType.startsWith("image/");

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <label className="upload-label">Attachments</label>
        <div className="upload-area">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="file-input"
            id="asset-file-input"
          />
          <label htmlFor="asset-file-input" className="upload-button">
            {isUploading ? uploadProgress : "📁 Choose Files"}
          </label>
          <span className="upload-hint">Click to select files (multiple allowed)</span>
        </div>
        {error && <span className="error-message">{error}</span>}
      </div>

      {existingFiles.length > 0 && (
        <div className="files-list">
          <h4>Attached Files ({existingFiles.length})</h4>
          <div className="files-grid">
            {existingFiles.map((file) => (
              <div key={file.id} className="file-item">
                {isImageFile(file.fileType) ? (
                  <div className="file-preview">
                    <img src={file.fileUrl} alt={file.fileName} />
                  </div>
                ) : (
                  <div className="file-icon">{getFileIcon(file.fileType)}</div>
                )}
                <div className="file-info">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-name"
                    title={file.fileName}
                  >
                    {file.fileName.length > 20
                      ? file.fileName.substring(0, 20) + "..."
                      : file.fileName}
                  </a>
                  <span className="file-size">{formatFileSize(file.fileSize)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.id)}
                  className="delete-btn"
                  title="Delete file"
                  disabled={disabled}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .file-upload-container {
          margin-top: 16px;
        }

        .upload-section {
          margin-bottom: 16px;
        }

        .upload-label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
        }

        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          background: #fafafa;
          transition: border-color 0.2s;
        }

        .upload-area:hover {
          border-color: #0070f3;
        }

        .file-input {
          display: none;
        }

        .upload-button {
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .upload-button:hover {
          background-color: #0060df;
        }

        .upload-hint {
          margin-top: 8px;
          font-size: 12px;
          color: #888;
        }

        .error-message {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          color: #e53e3e;
        }

        .files-list {
          margin-top: 16px;
        }

        .files-list h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #555;
        }

        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .file-item {
          display: flex;
          flex-direction: column;
          padding: 12px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          position: relative;
          transition: box-shadow 0.2s;
        }

        .file-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .file-preview {
          width: 100%;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 4px;
          background: #f5f5f5;
          margin-bottom: 8px;
        }

        .file-preview img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .file-icon {
          font-size: 48px;
          text-align: center;
          margin-bottom: 8px;
        }

        .file-info {
          flex: 1;
        }

        .file-name {
          display: block;
          font-size: 13px;
          color: #0070f3;
          text-decoration: none;
          word-break: break-word;
        }

        .file-name:hover {
          text-decoration: underline;
        }

        .file-size {
          display: block;
          font-size: 11px;
          color: #888;
          margin-top: 4px;
        }

        .delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border: none;
          background: #ff4444;
          color: white;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .file-item:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: #cc0000;
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
