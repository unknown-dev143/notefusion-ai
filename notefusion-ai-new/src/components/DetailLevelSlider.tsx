import React, { useState } from 'react';

interface DetailLevelSliderProps {
  onChange: (level: string) => void;
  value: string;
}

const DetailLevelSlider: React.FC<DetailLevelSliderProps> = ({ onChange, value }) => {
  const levels = ['concise', 'standard', 'in-depth'];
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Detail Level
      </label>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min="0"
          max="2"
          value={levels.indexOf(value)}
          onChange={(e) => onChange(levels[parseInt(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-600 capitalize w-20">
          {value}
        </span>
      </div>
    </div>
  );
};

export default DetailLevelSlider;
