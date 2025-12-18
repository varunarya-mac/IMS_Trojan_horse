/**
 * GraphDisplay Component
 * Displays graph image with loading state and controls
 * Fetches image using Appwrite SDK to handle authenticated storage
 */

import { useState, useEffect, useCallback } from 'react';
import { IoExpandOutline, IoDownloadOutline, IoRefreshOutline } from 'react-icons/io5';
import { chatApi } from '../../services/chatApi';
import type { GraphConfig } from '../../types/chat';

interface GraphDisplayProps {
  graphImageId: string;
  graphConfig?: GraphConfig;
  onExpand?: () => void;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

const GraphDisplay = ({
  graphImageId,
  graphConfig,
  onExpand,
}: GraphDisplayProps) => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Load graph image using Appwrite SDK
   * Downloads as blob and creates local URL to bypass CORS
   */
  const loadGraph = useCallback(async () => {
    if (!graphImageId) return;

    setLoadingState('loading');
    setErrorMessage(null);

    try {
      console.log('Loading graph with fileId:', graphImageId);
      const blob = await chatApi.getFileContent(graphImageId);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setLoadingState('success');
    } catch (error) {
      console.error('Failed to load graph:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load graph');
      setLoadingState('error');
    }
  }, [graphImageId]);

  // Load graph when component mounts or graphImageId changes
  useEffect(() => {
    loadGraph();

    // Cleanup: revoke blob URL when component unmounts or ID changes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [graphImageId, loadGraph]);

  /**
   * Handle retry button click
   */
  const handleRetry = () => {
    loadGraph();
  };

  /**
   * Handle download button click
   * Downloads the image file using the blob
   */
  const handleDownload = async () => {
    try {
      const blob = await chatApi.getFileContent(graphImageId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `graph-${graphImageId}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Error state with retry option
  if (loadingState === 'error') {
    return (
      <div className="mb-4 bg-[#F5F7FB] rounded-[15px] p-6 text-center">
        <p className="text-sm text-[#A9A9A9] font-open-sans mb-3">
          Unable to load graph
        </p>
        {errorMessage && (
          <p className="text-xs text-red-500 font-open-sans mb-3">
            {errorMessage}
          </p>
        )}
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#248CD0] text-white text-sm font-medium rounded-lg hover:bg-[#1c7ab8] transition-colors"
        >
          <IoRefreshOutline className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {graphConfig?.title && (
        <h3 className="text-sm font-semibold text-[#000000] font-open-sans mb-3">
          {graphConfig.title}
        </h3>
      )}

      <div className="relative bg-white border border-[#EBEBEB] rounded-[15px] overflow-hidden min-h-[200px]">
        {/* Loading state */}
        {loadingState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F7FB]">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}

        {/* Graph image - uses blob URL from SDK download */}
        {blobUrl && loadingState === 'success' && (
          <img
            src={blobUrl}
            alt={graphConfig?.title || 'Analysis Graph'}
            className="w-full h-auto"
          />
        )}

        {/* Controls overlay */}
        {loadingState === 'success' && (
          <div className="absolute top-2 right-2 flex gap-2">
            {onExpand && (
              <button
                onClick={onExpand}
                className="w-8 h-8 flex items-center justify-center bg-white/90 rounded-lg border border-[#EBEBEB] hover:bg-white transition-colors"
                title="Expand"
              >
                <IoExpandOutline className="w-4 h-4 text-[#000000]" />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="w-8 h-8 flex items-center justify-center bg-white/90 rounded-lg border border-[#EBEBEB] hover:bg-white transition-colors"
              title="Download"
            >
              <IoDownloadOutline className="w-4 h-4 text-[#000000]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphDisplay;
