/**
 * AlarmCard Component
 * Displays an alarm pattern as a card with GSAP animations
 */

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { IoFlash, IoSnow, IoSunny, IoLeaf, IoCube } from 'react-icons/io5';
import type { AlarmPatternDTO } from '../../types/alarm';

interface AlarmCardProps {
  alarm: AlarmPatternDTO;
  disciplineName: string;
  index: number;
}

// Map discipline names to colors and icons
const disciplineConfig: Record<
  string,
  { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  refrigeration: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: IoSnow,
  },
  hvac: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    icon: IoFlash,
  },
  lighting: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    icon: IoSunny,
  },
  solar: {
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    icon: IoLeaf,
  },
  default: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: IoCube,
  },
};

function getConfig(disciplineName: string) {
  const key = disciplineName.toLowerCase();
  return disciplineConfig[key] || disciplineConfig.default;
}

export function AlarmCard({ alarm, disciplineName, index }: AlarmCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const config = getConfig(disciplineName);
  const Icon = config.icon;

  // Entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [index]);

  // Hover handlers
  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.02,
        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleClick = () => {
    navigate(`/flow/${alarm.alarmPatternKey}`);
  };

  const nodeCount = alarm.programModules?.length || 0;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ opacity: 0 }}
    >
      {/* Icon Banner */}
      <div
        className={`h-32 ${config.bgColor} flex items-center justify-center relative`}
      >
        <Icon className={`w-16 h-16 ${config.color}`} />
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-600">
          v{alarm.version}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
          {alarm.alarmId}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{disciplineName}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
          {alarm.textExpr || 'No description'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {nodeCount} node{nodeCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Edit Flow
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlarmCard;
