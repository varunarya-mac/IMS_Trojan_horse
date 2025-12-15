/**
 * DisciplineTabs Component
 * Tab navigation for filtering alarms by discipline
 */

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { DisciplineDTO } from '../../types/alarm';

interface DisciplineTabsProps {
  disciplines: DisciplineDTO[];
  selectedDisciplineId: string | null;
  onSelectDiscipline: (disciplineId: string | null) => void;
}

export function DisciplineTabs({
  disciplines,
  selectedDisciplineId,
  onSelectDiscipline,
}: DisciplineTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    if (tabsRef.current) {
      gsap.fromTo(
        tabsRef.current.children,
        { y: -10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  return (
    <div
      ref={tabsRef}
      className="flex flex-wrap items-center gap-2 mb-6"
    >
      {/* All tab */}
      <button
        onClick={() => onSelectDiscipline(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedDisciplineId === null
            ? 'bg-[#1D2441] text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>

      {/* Discipline tabs */}
      {disciplines.map((discipline) => (
        <button
          key={discipline.id}
          onClick={() => onSelectDiscipline(discipline.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedDisciplineId === discipline.id
              ? 'bg-[#1D2441] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {discipline.name}
        </button>
      ))}
    </div>
  );
}

export default DisciplineTabs;
