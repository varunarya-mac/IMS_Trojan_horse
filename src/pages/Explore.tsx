/**
 * Explore Page
 * Displays alarm cards in a grid with discipline filtering
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { IoCloudUpload } from 'react-icons/io5';
import { MainLayout } from '../components/layout';
import { AlarmCard, DisciplineTabs, ImportModal } from '../components/explore';
import { useAllAlarmFlows } from '../hooks/useAlarms';

export function Explore() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch ALL alarm flows at once (cached for 1 hour)
  const { data: allFlowsData, isLoading } = useAllAlarmFlows();

  // Extract disciplines list from cached data (for tabs)
  const disciplines = useMemo(() => {
    if (!allFlowsData) return [];
    return allFlowsData.map((flow) => ({
      id: flow.discipline.id,
      name: flow.discipline.name,
    }));
  }, [allFlowsData]);

  // Filter flows by selected discipline (client-side, NO API call)
  // When "All" is selected (null), show all disciplines
  const filteredFlowsData = useMemo(() => {
    if (!allFlowsData) return [];
    if (selectedDisciplineId === null) {
      // Show all disciplines
      return allFlowsData;
    }
    // Filter to selected discipline
    const found = allFlowsData.find((d) => d.discipline.id === selectedDisciplineId);
    return found ? [found] : [];
  }, [selectedDisciplineId, allFlowsData]);

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

  const handleSelectDiscipline = (disciplineId: string | null) => {
    setSelectedDisciplineId(disciplineId);
  };

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
        {disciplines.length > 0 && (
          <DisciplineTabs
            disciplines={disciplines}
            selectedDisciplineId={selectedDisciplineId}
            onSelectDiscipline={handleSelectDiscipline}
          />
        )}

        {/* Featured Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedDisciplineId ? 'Alarm Flows' : 'All Alarm Flows'}
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1D2441]"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFlowsData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg">No alarm flows found</p>
          </div>
        )}

        {/* Grouped Cards by Discipline and Type */}
        {!isLoading && filteredFlowsData.length > 0 && (
          <div className="space-y-8">
            {filteredFlowsData.map((disciplineData) => (
              <div key={disciplineData.discipline.id}>
                {/* Show discipline name when "All" is selected */}
                {selectedDisciplineId === null && (
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {disciplineData.discipline.name}
                    </h3>
                  </div>
                )}

                {/* Discipline Types */}
                {disciplineData.disciplineTypes?.map((typeGroup) => {
                  if (!typeGroup.alarms || typeGroup.alarms.length === 0) {
                    return null;
                  }

                  return (
                    <section key={typeGroup.disciplineType.id} className="mb-6">
                      {/* Discipline Type Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-md font-semibold text-gray-700">
                          {typeGroup.disciplineType.name}
                        </h4>
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
                            disciplineName={disciplineData.discipline.name}
                            index={index}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ))}
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
