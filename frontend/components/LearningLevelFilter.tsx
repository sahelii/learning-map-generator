'use client';

type Level = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

interface LearningLevelFilterProps {
  selected: Level;
  onChange: (value: Level) => void;
}

const LEVELS: Level[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function LearningLevelFilter({ selected, onChange }: LearningLevelFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {LEVELS.map((level) => {
        const isSelected = selected === level;
        const baseClasses =
          'rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
        const stateClasses = isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow ring-2 ring-blue-300'
          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600';

        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`${baseClasses} ${stateClasses}`}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}
