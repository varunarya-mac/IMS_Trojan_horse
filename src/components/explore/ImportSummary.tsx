/**
 * ImportSummary Component
 * Displays import results with animated counters
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  IoCheckmarkCircle,
  IoWarning,
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5';
import type { ImportSummaryDTO } from '../../types/alarm';

interface ImportSummaryProps {
  summary: ImportSummaryDTO;
}

interface CounterProps {
  label: string;
  value: number;
  color: string;
}

function AnimatedCounter({ label, value, color }: CounterProps) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (countRef.current && value > 0) {
      gsap.from(countRef.current, {
        textContent: 0,
        duration: 1,
        ease: 'power1.out',
        snap: { textContent: 1 },
        onUpdate: function () {
          if (countRef.current) {
            countRef.current.textContent = Math.round(
              parseFloat(countRef.current.textContent || '0')
            ).toString();
          }
        },
      });
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
      <span
        ref={countRef}
        className={`text-3xl font-bold ${color}`}
      >
        {value}
      </span>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

export function ImportSummary({ summary }: ImportSummaryProps) {
  const [showErrors, setShowErrors] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const totalCreated =
    summary.disciplinesCreated +
    summary.disciplineTypesCreated +
    summary.alarmPatternsCreated +
    summary.classesCreated +
    summary.fieldsCreated;

  const hasErrors = summary.errors.length > 0;

  // Animate success checkmark
  useEffect(() => {
    if (successRef.current) {
      gsap.fromTo(
        successRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  return (
    <div className="w-full">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div
          ref={successRef}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            hasErrors ? 'bg-yellow-100' : 'bg-green-100'
          }`}
        >
          {hasErrors ? (
            <IoWarning className="w-8 h-8 text-yellow-600" />
          ) : (
            <IoCheckmarkCircle className="w-8 h-8 text-green-600" />
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
        {hasErrors ? 'Import Completed with Warnings' : 'Import Successful'}
      </h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        {totalCreated} items imported successfully
        {hasErrors && `, ${summary.errors.length} errors`}
      </p>

      {/* Counters Grid */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        <AnimatedCounter
          label="Disciplines"
          value={summary.disciplinesCreated}
          color="text-blue-600"
        />
        <AnimatedCounter
          label="Types"
          value={summary.disciplineTypesCreated}
          color="text-indigo-600"
        />
        <AnimatedCounter
          label="Alarms"
          value={summary.alarmPatternsCreated}
          color="text-green-600"
        />
        <AnimatedCounter
          label="Classes"
          value={summary.classesCreated}
          color="text-orange-600"
        />
        <AnimatedCounter
          label="Fields"
          value={summary.fieldsCreated}
          color="text-purple-600"
        />
      </div>

      {/* Errors Section */}
      {hasErrors && (
        <div className="border border-yellow-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 hover:bg-yellow-100 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-yellow-800">
              <IoWarning className="w-4 h-4" />
              {summary.errors.length} Warning{summary.errors.length > 1 ? 's' : ''}
            </span>
            {showErrors ? (
              <IoChevronUp className="w-4 h-4 text-yellow-600" />
            ) : (
              <IoChevronDown className="w-4 h-4 text-yellow-600" />
            )}
          </button>

          {showErrors && (
            <div className="max-h-40 overflow-y-auto">
              {summary.errors.map((error, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-sm border-t border-yellow-100"
                >
                  <span className="font-medium text-gray-700">
                    [{error.type}] {error.name}:
                  </span>{' '}
                  <span className="text-gray-600">{error.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImportSummary;
