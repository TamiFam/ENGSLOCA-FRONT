// components/WordsLurk.jsx
import { useState, useEffect } from 'react';

export default function WordsLurk({ 
  word, 
  translation, 
  transcriptionUK,
  className = "",
  forceHidden // 👈 принимаем внешнее состояние
}) {
  const [isHidden, setIsHidden] = useState(false);

  // 👇 Синхронизируем с внешним состоянием
  useEffect(() => {
    if (forceHidden !== undefined) {
      setIsHidden(forceHidden);
    }
  }, [forceHidden]);

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  const getHiddenWord = (text) => {
    if (!text) return '•••';
    return '•'.repeat(Math.max(3, text.length));
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Слово и транскрипция */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`text-2xl sm:text-3xl font-black ${
          isHidden ? 'text-gray-400' : 'text-black'
        }`}>
          {isHidden ? getHiddenWord(word) : word}
        </span>
        
        {transcriptionUK && (
          <span className={`text-sm sm:text-lg font-mono bg-gray-100 px-2 py-1 ${
            isHidden ? 'text-gray-300' : 'text-gray-600'
          }`}>
            [{isHidden ? '••••••' : transcriptionUK}]
          </span>
        )}
      </div>

      {/* Разделитель */}
      <span className={`hidden sm:inline text-2xl ${
        isHidden ? 'text-gray-300' : 'text-gray-400'
      }`}>—</span>

      {/* Перевод */}
      <div className="flex-1 min-w-0">
        <span className="text-xl sm:text-2xl font-bold text-gray-800">
          {translation}
        </span>
      </div>

      {/* Кнопка скрытия/показа */}
      <button
        onClick={toggleVisibility}
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 border-2 border-black ${
          isHidden 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isHidden ? "Показать слово" : "Скрыть слово"}
      >
        {isHidden ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M1 1l22 22"/>
          </svg>
        )}
      </button>
    </div>
  );
}