/**
 * Explore Page
 * Displays alarm cards in a grid with discipline filtering
 */

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { IoCloudUpload } from 'react-icons/io5';
import { MainLayout } from '../components/layout';
import { AlarmCard, DisciplineTabs, ImportModal } from '../components/explore';
import { useDisciplines, useAlarmFlowsByDiscipline } from '../hooks/useAlarms';

export function Explore() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch disciplines
  const { data: disciplinesData, isLoading: disciplinesLoading } = useDisciplines();

  // Fetch alarm flows when a discipline is selected
  const { data: flowsData, isLoading: flowsLoading } = useAlarmFlowsByDiscipline(selectedDisciplineId);
console.log('--------data--------------', JSON.stringify(flowsData));
  // Get selected discipline name for display
  const selectedDisciplineName = disciplinesData?.disciplines?.find(
    (d) => d.id === selectedDisciplineId
  )?.name || '';

  // Header animation
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  // Auto-select first discipline when disciplines load
  useEffect(() => {
    if (disciplinesData?.disciplines && disciplinesData.disciplines.length > 0) {
      setSelectedDisciplineId(disciplinesData.disciplines[0].id);
    }
  }, [disciplinesData]);

  const handleSelectDiscipline = (disciplineId: string | null) => {
    setSelectedDisciplineId(disciplineId);
  };

  const isLoading = disciplinesLoading || (selectedDisciplineId && flowsLoading);

  return (
    <MainLayout>
      <div className="flex-1 bg-[#F5F7FB] p-8 overflow-auto">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
            <p className="text-gray-500 mt-1">Browse and manage alarm flows</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              <IoCloudUpload className="w-5 h-5" />
              Import
            </button>
          </div>
        </div>

        {/* Discipline Tabs */}
        {disciplinesData?.disciplines && (
          <DisciplineTabs
            disciplines={disciplinesData.disciplines}
            selectedDisciplineId={selectedDisciplineId}
            onSelectDiscipline={handleSelectDiscipline}
          />
        )}

        {/* Featured Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedDisciplineId ? 'Alarm Flows' : 'Featured'}
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1D2441]"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          selectedDisciplineId &&
          (!flowsData?.disciplineTypes?.length ||
            flowsData.disciplineTypes.every((t) => !t.alarms?.length)) && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-lg">No alarm flows found for this discipline</p>
            </div>
          )}

        {/* Grouped Cards by Discipline Type */}
        {!isLoading &&
          flowsData?.disciplineTypes &&
          flowsData.disciplineTypes.some((t) => t.alarms?.length > 0) && (
            <div className="space-y-8">
              {flowsData.disciplineTypes.map((typeGroup) => {
                if (!typeGroup.alarms || typeGroup.alarms.length === 0) {
                  return null;
                }

                return (
                  <section key={typeGroup.disciplineType.id}>
                    {/* Discipline Type Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-md font-semibold text-gray-700">
                        {typeGroup.disciplineType.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                        {typeGroup.alarms.length} {typeGroup.alarms.length === 1 ? 'alarm' : 'alarms'}
                      </span>
                    </div>

                    {/* Alarm Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {typeGroup.alarms.map((alarm, index) => (
                        <AlarmCard
                          key={alarm.alarmPatternKey}
                          alarm={alarm}
                          disciplineName={flowsData.discipline?.name || selectedDisciplineName}
                          index={index}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

        {/* All view - show message */}
        {!isLoading && !selectedDisciplineId && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg">Select a discipline to view alarm flows</p>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          // Data will be refreshed automatically via React Query invalidation
        }}
      />
    </MainLayout>
  );
}

export default Explore;
