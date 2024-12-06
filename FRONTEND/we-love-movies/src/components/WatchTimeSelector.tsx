import React from 'react';
import { WatchTime } from '../types/interfaces';

interface WatchTimeSelectorProps {
    onSelect: (time: WatchTime) => void;
    currentValue: WatchTime | '';
  }
  
  const WatchTimeSelector: React.FC<WatchTimeSelectorProps> = ({ onSelect, currentValue }) => {
    const watchTimes: { value: WatchTime; label: string; icon: string }[] = [
      { value: 'morning', label: 'Morning', icon: '🌅' },
      { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
      { value: 'evening', label: 'Evening', icon: '🌆' },
      { value: 'night', label: 'Night', icon: '🌙' }
    ];
  
    return (
      <div className="grid grid-cols-2 gap-3">
        {watchTimes.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
              currentValue === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            <span className="text-2xl" role="img" aria-label={label}>
              {icon}
            </span>
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    );
  };
  
  export default WatchTimeSelector;