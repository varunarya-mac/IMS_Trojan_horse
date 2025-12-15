/**
 * ImportModal Component
 * Modal for importing JSON configuration files with parallel per-discipline imports
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  IoClose,
  IoCloudUpload,
  IoDocument,
  IoTrash,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoEllipsisHorizontal,
} from 'react-icons/io5';
import { useQueryClient } from '@tanstack/react-query';
import { alarmApi } from '../../services/alarmApi';
import { alarmKeys } from '../../hooks/useAlarms';
import { ImportSummary } from './ImportSummary';
import type { ImportSummaryDTO } from '../../types/alarm';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FilePreview {
  name: string;
  size: string;
  enterpriseName?: string;
  enterpriseVersion?: number;
  disciplineCount?: number;
  alarmCount?: number;
}

interface ParsedDiscipline {
  name: string;
  data: object;
  alarmCount: number;
}

interface DisciplineImportStatus {
  disciplineName: string;
  status: 'pending' | 'importing' | 'done' | 'error';
  result?: ImportSummaryDTO;
  error?: string;
}

type ImportStep = 'idle' | 'parsing' | 'validating' | 'importing' | 'complete' | 'error';

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const [_file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [parsedDisciplines, setParsedDisciplines] = useState<ParsedDiscipline[]>([]);
  const [enterpriseInfo, setEnterpriseInfo] = useState<{ name: string; version: number } | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [currentStep, setCurrentStep] = useState<ImportStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [disciplineStatuses, setDisciplineStatuses] = useState<DisciplineImportStatus[]>([]);
  const [aggregatedResult, setAggregatedResult] = useState<ImportSummaryDTO | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Animate modal entrance
  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Parse and validate JSON file
  const parseJsonFile = useCallback((content: string, fileName: string, fileSize: number) => {
    try {
      const data = JSON.parse(content);

      if (!data.enterprise) {
        throw new Error("Invalid format - missing 'enterprise' root object");
      }

      const enterprise = data.enterprise;
      const disciplines = enterprise.disciplines || data.disciplines;

      if (!disciplines || !Array.isArray(disciplines)) {
        throw new Error("Invalid format - missing 'disciplines' array");
      }

      // Parse each discipline
      const parsed: ParsedDiscipline[] = [];
      let totalAlarmCount = 0;

      for (const discipline of disciplines) {
        let alarmCount = 0;
        if (discipline.discipline_types) {
          for (const type of discipline.discipline_types) {
            if (type.alarm_patterns) {
              alarmCount += type.alarm_patterns.length;
            }
          }
        }
        totalAlarmCount += alarmCount;
        parsed.push({
          name: discipline.name || 'Unknown',
          data: discipline,
          alarmCount,
        });
      }

      setFilePreview({
        name: fileName,
        size: formatFileSize(fileSize),
        enterpriseName: enterprise.name,
        enterpriseVersion: enterprise.version,
        disciplineCount: disciplines.length,
        alarmCount: totalAlarmCount,
      });

      setEnterpriseInfo({
        name: enterprise.name,
        version: enterprise.version,
      });

      setParsedDisciplines(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
      setFilePreview(null);
      setParsedDisciplines([]);
      setEnterpriseInfo(null);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.name.endsWith('.json')) {
        setError('Please select a JSON file');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }

      setFile(selectedFile);
      setCurrentStep('idle');
      setAggregatedResult(null);
      setDisciplineStatuses([]);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        parseJsonFile(content, selectedFile.name, selectedFile.size);
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsText(selectedFile);
    },
    [parseJsonFile]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  // Handle parallel import
  const handleImport = async () => {
    if (!enterpriseInfo || parsedDisciplines.length === 0) return;

    setCurrentStep('parsing');
    setError(null);

    // Initialize discipline statuses
    const initialStatuses: DisciplineImportStatus[] = parsedDisciplines.map((d) => ({
      disciplineName: d.name,
      status: 'pending',
    }));
    setDisciplineStatuses(initialStatuses);

    // Simulate parsing delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    setCurrentStep('validating');

    await new Promise((resolve) => setTimeout(resolve, 300));
    setCurrentStep('importing');

    try {
      // Start all imports in parallel
      const importPromises = parsedDisciplines.map(async (discipline, index) => {
        // Update status to importing
        setDisciplineStatuses((prev) =>
          prev.map((s, i) => (i === index ? { ...s, status: 'importing' } : s))
        );

        try {
          const result = await alarmApi.importSingleDiscipline(
            enterpriseInfo,
            discipline.data,
            overwriteExisting
          );

          // Update status to done
          setDisciplineStatuses((prev) =>
            prev.map((s, i) =>
              i === index ? { ...s, status: 'done', result } : s
            )
          );

          return { success: true, result, disciplineName: discipline.name };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Import failed';

          // Update status to error
          setDisciplineStatuses((prev) =>
            prev.map((s, i) =>
              i === index ? { ...s, status: 'error', error: errorMessage } : s
            )
          );

          return { success: false, error: errorMessage, disciplineName: discipline.name };
        }
      });

      // Wait for all imports to complete
      const results = await Promise.all(importPromises);

      // Aggregate results
      const aggregated: ImportSummaryDTO = {
        disciplinesCreated: 0,
        disciplineTypesCreated: 0,
        alarmPatternsCreated: 0,
        classesCreated: 0,
        fieldsCreated: 0,
        errors: [],
      };

      for (const r of results) {
        if (r.success && r.result) {
          aggregated.disciplinesCreated += r.result.disciplinesCreated;
          aggregated.disciplineTypesCreated += r.result.disciplineTypesCreated;
          aggregated.alarmPatternsCreated += r.result.alarmPatternsCreated;
          aggregated.classesCreated += r.result.classesCreated;
          aggregated.fieldsCreated += r.result.fieldsCreated;
          aggregated.errors.push(...r.result.errors);
        } else if (!r.success) {
          aggregated.errors.push({
            type: 'discipline',
            name: r.disciplineName,
            message: r.error || 'Unknown error',
          });
        }
      }

      setAggregatedResult(aggregated);
      setCurrentStep('complete');

      // Invalidate all alarm queries to refresh data
      queryClient.invalidateQueries({
        queryKey: alarmKeys.all,
      });
    } catch (err) {
      setCurrentStep('error');
      setError(err instanceof Error ? err.message : 'Import failed');
    }
  };

  // Handle close
  const handleClose = () => {
    if (currentStep === 'complete') {
      onSuccess();
    }
    // Reset state
    setFile(null);
    setFilePreview(null);
    setParsedDisciplines([]);
    setEnterpriseInfo(null);
    setOverwriteExisting(false);
    setCurrentStep('idle');
    setError(null);
    setAggregatedResult(null);
    setDisciplineStatuses([]);
    onClose();
  };

  // Remove file
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setParsedDisciplines([]);
    setEnterpriseInfo(null);
    setError(null);
  };

  // Get status icon for discipline
  const getStatusIcon = (status: DisciplineImportStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'importing':
        return <IoEllipsisHorizontal className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'done':
        return <IoCheckmarkCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <IoAlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  // Calculate overall progress
  const completedCount = disciplineStatuses.filter(
    (s) => s.status === 'done' || s.status === 'error'
  ).length;
  const progressPercent =
    disciplineStatuses.length > 0
      ? (completedCount / disciplineStatuses.length) * 100
      : 0;

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Import Configuration</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IoClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* File Upload Zone */}
          {!filePreview && currentStep === 'idle' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="file"
                accept=".json"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <IoCloudUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag & drop your JSON file here, or{' '}
                  <span className="text-blue-600 font-medium">browse</span>
                </p>
                <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
              </label>
            </div>
          )}

          {/* File Preview */}
          {filePreview && currentStep === 'idle' && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IoDocument className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{filePreview.name}</p>
                    <p className="text-sm text-gray-500">{filePreview.size}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <IoTrash className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Preview Details */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    {filePreview.enterpriseName || '-'}
                  </p>
                  <p className="text-xs text-gray-500">Enterprise</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-600">
                    {filePreview.disciplineCount}
                  </p>
                  <p className="text-xs text-gray-500">Disciplines</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">
                    {filePreview.alarmCount}
                  </p>
                  <p className="text-xs text-gray-500">Alarm Patterns</p>
                </div>
              </div>

              {/* Discipline List Preview */}
              {parsedDisciplines.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Disciplines to import:</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedDisciplines.map((d, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200"
                      >
                        {d.name} ({d.alarmCount} alarms)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Override Toggle */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Override existing alarms (creates new version)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Import Progress */}
          {currentStep !== 'idle' && currentStep !== 'complete' && (
            <div className="space-y-4">
              {/* Overall Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    {currentStep === 'parsing' && 'Parsing JSON...'}
                    {currentStep === 'validating' && 'Validating structure...'}
                    {currentStep === 'importing' && 'Importing disciplines...'}
                  </span>
                  {currentStep === 'importing' && (
                    <span>{completedCount} / {disciplineStatuses.length}</span>
                  )}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentStep === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-green-500'
                    }`}
                    style={{
                      width:
                        currentStep === 'parsing'
                          ? '25%'
                          : currentStep === 'validating'
                          ? '50%'
                          : `${50 + progressPercent * 0.5}%`,
                    }}
                  />
                </div>
              </div>

              {/* Per-discipline Progress */}
              {currentStep === 'importing' && disciplineStatuses.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {disciplineStatuses.map((status, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        status.status === 'importing'
                          ? 'bg-blue-50 border border-blue-200'
                          : status.status === 'done'
                          ? 'bg-green-50 border border-green-200'
                          : status.status === 'error'
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status.status)}
                        <span
                          className={`text-sm font-medium ${
                            status.status === 'importing'
                              ? 'text-blue-700'
                              : status.status === 'done'
                              ? 'text-green-700'
                              : status.status === 'error'
                              ? 'text-red-700'
                              : 'text-gray-600'
                          }`}
                        >
                          {status.disciplineName}
                        </span>
                      </div>
                      {status.status === 'done' && status.result && (
                        <span className="text-xs text-green-600">
                          {status.result.alarmPatternsCreated} alarms
                        </span>
                      )}
                      {status.status === 'error' && (
                        <span className="text-xs text-red-600">Failed</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Import Summary */}
          {currentStep === 'complete' && aggregatedResult && (
            <ImportSummary summary={aggregatedResult} />
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl mt-4">
              <IoAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          {currentStep === 'idle' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!enterpriseInfo || parsedDisciplines.length === 0}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  enterpriseInfo && parsedDisciplines.length > 0
                    ? 'bg-[#1D2441] text-white hover:bg-[#2a3456]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Import
              </button>
            </>
          )}

          {currentStep !== 'idle' && currentStep !== 'complete' && currentStep !== 'error' && (
            <button
              disabled
              className="px-6 py-2 text-sm font-medium bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed"
            >
              Importing...
            </button>
          )}

          {(currentStep === 'complete' || currentStep === 'error') && (
            <button
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium bg-[#1D2441] text-white hover:bg-[#2a3456] rounded-lg transition-colors"
            >
              {currentStep === 'complete' ? 'Done' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
