import React from 'react';

export function WeekStats({ position = 'left', wordsCount }) {
  const posClass = position === 'left' ? "top-3 left-3" : "top-3 right-3";

  return (
    <div className={`absolute ${posClass} text-center sm:text-left`}>
      <h2 className="text-xs sm:text-sm lg:text-base font-black text-black dark:text-white transition-colors duration-300">
        WEEK
      </h2>

      <p className="text-gray-400 font-bold text-xs sm:text-sm lg:text-base transition-colors duration-300">
        📚 {wordsCount}
      </p>
    </div>
  );
}
