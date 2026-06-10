// components/DevButtonStyled.jsx
import { useState } from 'react';

export const DevButtonStyled = ({ 
  children, 
  message = "В разработке",
  description = "Могут быть ошибки",
  className = "",
  ...props 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        {...props}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          bg-black hover:bg-gray-800
          dark:bg-white dark:hover:bg-gray-200
          border-2 border-black dark:border-white
          px-6 py-3
          font-bold text-white dark:text-black
          transition-all duration-300
          hover:scale-105
          active:scale-95
          relative
          ${className}
        `}
      >
        <span className="flex items-center gap-2">
          {children}
          <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full">
            DEV
          </span>
        </span>
      </button>
      
      {/* 🔥 ТОЧКА-ИНДИКАТОР (всегда видна) */}
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
      
      {/* 🔥 ТУЛТИП - привязан к правому краю */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 right-0 z-50 min-w-max">
          <div className="
            bg-white dark:bg-gray-800 
            border-2 border-black dark:border-white
            shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]
            px-4 py-2
          ">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 text-lg">🚧</span>
              <div>
                <p className="font-bold text-black dark:text-white text-sm">
                  {message}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>
            {/* 🔥 Стрелочка - теперь справа */}
            <div className="absolute top-full right-4 transform -mt-[2px]">
              <div className="border-4 border-transparent border-t-white dark:border-t-gray-800"></div>
              <div className="absolute top-[-2px] left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};