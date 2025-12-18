/**
 * UploadProgress Component
 * Shows file upload progress with cancel option
 */

import { IoCloseOutline, IoDocumentTextOutline } from 'react-icons/io5';

interface UploadProgressProps {
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  onRemove: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadProgress = ({
  fileName,
  fileSize,
  progress,
  status,
  onRemove,
}: UploadProgressProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-[#248CD0]';
      case 'uploaded':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'uploaded':
        return 'Ready to send';
      case 'error':
        return 'Upload failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#F5F7FB] rounded-[10px] mb-2">
      {/* File icon */}
      <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[#EBEBEB]">
        <IoDocumentTextOutline className="w-4 h-4 text-[#248CD0]" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-[#000000] font-open-sans truncate">
            {fileName}
          </span>
          <span className="text-xs text-[#A9A9A9] font-open-sans ml-2">
            {formatFileSize(fileSize)}
          </span>
        </div>

        {/* Progress bar */}
        {status === 'uploading' && (
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor()} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Status text */}
        <span
          className={`text-xs font-open-sans ${
            status === 'error' ? 'text-red-500' : 'text-[#A9A9A9]'
          }`}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors"
        title="Remove file"
      >
        <IoCloseOutline className="w-4 h-4 text-[#A9A9A9]" />
      </button>
    </div>
  );
};

export default UploadProgress;
