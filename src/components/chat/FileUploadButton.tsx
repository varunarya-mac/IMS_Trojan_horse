/**
 * FileUploadButton Component
 * CSV file upload trigger button with validation
 */

import { useRef } from 'react';
import { IoAddOutline } from 'react-icons/io5';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

const FileUploadButton = ({
  onFileSelect,
  disabled = false,
  accept = '.csv',
  maxSizeMB = 50,
}: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv') {
      alert('Please select a CSV file');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    onFileSelect(file);

    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`w-[33px] h-[33px] flex items-center justify-center border border-[#EBEBEB] rounded-full transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-[#F5F7FB] hover:border-[#248CD0]'
        }`}
        title="Attach CSV file"
      >
        <IoAddOutline className="w-4 h-4 text-[#000000]" />
      </button>
    </>
  );
};

export default FileUploadButton;
