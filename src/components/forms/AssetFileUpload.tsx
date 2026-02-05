"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  FileImage, 
  FileVideo, 
  FileText, 
  File, 
  Trash2,
  ExternalLink,
  Loader2
} from "lucide-react";

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
    if (fileType.startsWith("image/")) return <FileImage className="h-10 w-10 text-blue-500" />;
    if (fileType.startsWith("video/")) return <FileVideo className="h-10 w-10 text-purple-500" />;
    if (fileType.includes("pdf")) return <FileText className="h-10 w-10 text-red-500" />;
    return <File className="h-10 w-10 text-muted-foreground" />;
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Attachments</Label>
        <div className="flex flex-col items-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/30 hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            id={`asset-file-input-${assetId}`}
          />
          <label 
            htmlFor={`asset-file-input-${assetId}`} 
            className="cursor-pointer"
          >
            <Button 
              type="button" 
              variant="default" 
              disabled={disabled || isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploadProgress}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </>
                )}
              </span>
            </Button>
          </label>
          <span className="mt-2 text-xs text-muted-foreground">
            Click to select files (multiple allowed)
          </span>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {existingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Attached Files ({existingFiles.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingFiles.map((file) => (
              <div 
                key={file.id} 
                className="group relative flex flex-col p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
              >
                {isImageFile(file.fileType) ? (
                  <div className="w-full h-24 flex items-center justify-center overflow-hidden rounded bg-muted mb-2">
                    <img 
                      src={file.fileUrl} 
                      alt={file.fileName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 mb-2">
                    {getFileIcon(file.fileType)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate block"
                    title={file.fileName}
                  >
                    {file.fileName.length > 25
                      ? file.fileName.substring(0, 25) + "..."
                      : file.fileName}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded bg-muted hover:bg-accent"
                    title="Open file"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-1.5 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive"
                    title="Delete file"
                    disabled={disabled}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
