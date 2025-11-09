import React, { useCallback, useMemo } from "react";

React
export const Snowflakes = React.memo(() => {
    const getSnowflakeSymbol = useCallback(() => {
        const snowflakes = ['*', '+', '.', '·', '•', '∘', '⋅', '✱', '✲', '✴'];
      return snowflakes[Math.floor(Math.random() * snowflakes.length)];
    }, []);
  
    // Генерируем снежинки один раз при монтировании
    const snowflakesData = useMemo(() => {
      return Array.from({ length: 90 }).map((_, index) => {
        const snowType = `snow-type-${(index % 3) + 1}`;
        const size = 20 + Math.random() * 10;
        
        return {
          id: index,
          snowType,
          size,
          left: Math.random() * 100,
          top: -5 - Math.random() * 10,
          delay: Math.random() * 20,
          duration: 8 + Math.random() * 15,
          symbol: getSnowflakeSymbol()
        };
      });
    }, [getSnowflakeSymbol]);
  
    return (
      <div className="fixed inset-0 pointer-events-none hidden md:block z-5">
        {snowflakesData.map((snowflake) => (
          <div
            key={snowflake.id}
            className={`absolute text-blue-600 dark:text-white opacity-80 dark:opacity-100 ${snowflake.snowType}`}
            style={{
              left: `${snowflake.left}%`,
              top: `${snowflake.top}%`,
              fontSize: `${snowflake.size}px`,
              animationDelay: `${snowflake.delay}s`,
              animationDuration: `${snowflake.duration}s`,
            }}
          >
            {snowflake.symbol}
          </div>
        ))}
      </div>
    );
  });
  
 