import { useState, useEffect } from 'react';
import { getAvailableWeeks } from '../features/words/wordsAPI';

export default function WeekSelector({ currentWeek, onWeekChange }) {
  const [weeks, setWeeks] = useState([1]);
  const [newWeek, setNewWeek] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAvailableWeeks();
  }, []);

  const loadAvailableWeeks = async () => {
    try {
      setLoading(true);
      const response = await getAvailableWeeks();
      const availableWeeks = response.data.weeks.length > 0 ? response.data.weeks : [1];
      setWeeks(availableWeeks);
      
      if (!availableWeeks.includes(currentWeek)) {
        onWeekChange(availableWeeks[0]);
      }
    } catch (err) {
      console.error('Ошибка загрузки недель:', err);
      const savedWeeks = JSON.parse(localStorage.getItem('availableWeeks')) || [1];
      setWeeks(savedWeeks);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeek = () => {
    const weekNum = parseInt(newWeek);
    if (weekNum && !weeks.includes(weekNum)) {
      const updatedWeeks = [...weeks, weekNum].sort((a, b) => a - b);
      setWeeks(updatedWeeks);
      localStorage.setItem('availableWeeks', JSON.stringify(updatedWeeks));
      setNewWeek('');
      setShowAddForm(false);
      onWeekChange(weekNum);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddWeek();
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-4 border-black p-4 sm:p-6 mb-6 sm:mb-8 relative">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="h-4 bg-black w-20"></div>
          <div className="h-10 bg-gray-300 w-32 sm:w-40 border-2 border-black"></div>
          <div className="h-4 bg-black w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black p-4 sm:p-6 mb-6 sm:mb-8 relative">
      {/* Декоративные угловые элементы */}
      <div className="absolute -top-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
      <div className="absolute -top-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
      <div className="absolute -bottom-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
      
      {/* Основной контент */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Верхняя строка - выбор недели и статистика */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <span className="text-base sm:text-lg font-black text-black whitespace-nowrap">
            📅 НЕДЕЛЯ:
            </span>
            
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={currentWeek} 
                onChange={(e) => onWeekChange(parseInt(e.target.value))}
                className="appearance-none bg-white border-2 border-black px-3 sm:px-4 py-2 pr-8 font-black text-black focus:outline-none focus:bg-yellow-100 cursor-pointer w-full sm:w-18 text-sm sm:text-base"
              >
                {weeks.map(week => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Статистика - всегда видима на мобильных */}
            <div className="sm:hidden">
              <span className="inline-flex items-center px-2 py-1 text-xs font-black bg-black text-white border-2 border-black">
                {weeks.length}
              </span>
            </div>
          </div>

          {/* Десктопная статистика */}
          <div className="hidden sm:block">
            <span className="inline-flex items-center px-3 py-1 text-sm font-black bg-black text-white border-2 border-black">
              ВСЕГО: {weeks.length}
            </span>
          </div>
        </div>

        {/* Нижняя часть - добавление новой недели */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 sm:pt-0 border-t-2 border-gray-300 sm:border-t-0">
          {/* Мобильная кнопка добавления */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-black text-white px-4 py-2 font-black border-2 border-black hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <span className="text-lg">+</span>
              ДОБАВИТЬ НЕДЕЛЮ
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="number"
                    value={newWeek}
                    onChange={(e) => setNewWeek(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="№ недели"
                    className="w-full px-3 py-2 border-2 border-black text-black font-black bg-white focus:outline-none focus:bg-yellow-100 text-center text-sm sm:text-base"
                    min="1"
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={handleAddWeek}
                  disabled={!newWeek}
                  className="bg-green-600 text-white px-3 py-2 font-black border-2 border-black hover:bg-green-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-sm sm:text-base whitespace-nowrap"
                >
                  <span className="text-lg">✓</span>
                  ОК
                </button>
              </div>
              
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewWeek('');
                }}
                className="bg-red-600 text-white px-3 py-2 font-black border-2 border-black hover:bg-red-700 transition-all duration-200 flex items-center gap-1 w-full sm:w-auto justify-center text-sm sm:text-base mt-2 sm:mt-0"
              >
                <span className="text-lg">✕</span>
                ОТМЕНА
              </button>
            </div>
          )}

          {/* Десктопная форма добавления */}
          <div className="hidden sm:flex sm:items-center gap-3">
            <div className="relative">
              <input
                type="number"
                value={newWeek}
                onChange={(e) => setNewWeek(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="№"
                className="w-20 px-3 py-2 border-2 border-black text-black font-black bg-white focus:outline-none focus:bg-yellow-100 text-center"
                min="1"
              />
            </div>
            <button
              onClick={handleAddWeek}
              disabled={!newWeek}
              className="bg-black text-white px-4 py-2 font-black border-2 border-black hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
            >
              <span className="text-lg">+</span>
              ДОБАВИТЬ
            </button>
          </div>
        </div>

        {/* Мобильная подсказка */}
        {showAddForm && (
          <div className="bg-yellow-100 border-2 border-yellow-400 p-2 text-center">
            <p className="text-xs text-yellow-800 font-bold">
              Введите номер новой недели
            </p>
          </div>
        )}
      </div>

      {/* Мобильная статистика (альтернативное расположение) */}
      <div className="sm:hidden mt-3 pt-3 border-t-2 border-gray-300 text-center">
        <span className="inline-flex items-center px-3 py-1 text-xs font-black bg-gray-200 text-black border-2 border-gray-400">
          ДОСТУПНО НЕДЕЛЬ: {weeks.length}
        </span>
      </div>
    </div>
  );
}