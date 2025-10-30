import { useState, useEffect } from "react";
import { getAvailableWeeks } from "../features/words/wordsAPI";

export default function WeekSelector({ currentWeek, onWeekChange,currentPage,onPageChange,getPagesCount }) {
  const [weeks, setWeeks] = useState([])
  
  const [newWeek, setNewWeek] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

 
  useEffect(() => {
    if (weeks.length) localStorage.setItem("availableWeeks", JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    localStorage.setItem("currentWeek", currentWeek);
  }, [currentWeek]);

  useEffect(() => {
    const loadWeeks = async () => {
      setLoading(true);
      try {
        const response = await getAvailableWeeks();
        const availableWeeks = response.data.weeks.length
          ? response.data.weeks.map(Number)
          : [1];
  
        setWeeks(availableWeeks);
  
        // Если текущая неделя не в списке, ставим последнюю или первую
        const newCurrent = availableWeeks.includes(currentWeek)
          ? currentWeek
          : availableWeeks[availableWeeks.length - 1] || 1;

          if (newCurrent !== currentWeek) {
            onWeekChange(newCurrent);
          }
      } catch (err) {
        console.error(err);
        setWeeks([1]);
        if (currentWeek !== 1) {
          onWeekChange(1);
        }
       
      } finally {
        setLoading(false);
      }
    };
  
    loadWeeks();
  }, []);

  const handleAddWeek = () => {
    const weekNum = parseInt(newWeek);
    if (!weekNum || weeks.includes(weekNum)) return;
  
    const updatedWeeks = [...weeks, weekNum].sort((a, b) => a - b);
    setWeeks(updatedWeeks);
    
    onWeekChange(weekNum);
    setNewWeek("");
    setShowAddForm(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleAddWeek();
  };
  const handleWeekChange = (newWeek) => {
    const maxPages = getPagesCount(newWeek); // количество страниц в выбранной неделе
    if (currentPage > maxPages) {
      onPageChange(1); // сброс на первую страницу, если текущая больше
    }
  
    onWeekChange(newWeek);
  };

  // генерация диапазона для компактной пагинации
  const createWeekRange = () => {
    const delta = 2;
    const range = [];
    const minAvailableWeek = Math.min(...weeks);
const maxAvailableWeek = Math.max(...weeks)

    const maxWeek = Math.max(...weeks);
for (let i = Math.max(minAvailableWeek, currentWeek - delta); i <= Math.min(maxWeek, currentWeek + delta); i++) {
  range.push(i);
}


    if (range[0] > minAvailableWeek) range.unshift("...");
    if (range[0] !== minAvailableWeek) range.unshift(minAvailableWeek);
    if (range[range.length - 1] < maxAvailableWeek  - 1) range.push("...");
    if (range[range.length - 1] !== maxAvailableWeek ) range.push(maxAvailableWeek );

    return range;
  };

  const weekRange = createWeekRange();

  if (loading) {
    return (
      <div className="bg-white border-4 border-black p-4 sm:p-6 mb-6 sm:mb-8 relative text-center font-black">
        Загрузка недель...
      </div>
    );
  }

  return (
    <div className=" flex bg-white border-4 border-black p-4 sm:p-6 mb-6 sm:mb-8 relative justify-center">
      {/* Декоративные углы */}
      <div className="absolute -top-2 -left-2 w-3 h-3 bg-black"></div>
      <div className="absolute -top-2 -right-2 w-3 h-3 bg-black"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-black"></div>
      <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-black"></div>

      <div className="flex flex-col gap-6">
        {/* Заголовок */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <span className="text-base sm:text-lg font-black text-black whitespace-nowrap">
            📅 НЕДЕЛЯ:
          </span>

          <span className="inline-flex items-center px-3 py-1 text-sm font-black bg-black text-white border-2 border-black">
            ВСЕГО: {weeks.length}
          </span>
        </div>

        {/* Пагинация недель */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {weekRange.map((w, i) =>
            w === "..." ? (
              <span
                key={`dots-${i}`}
                className="px-3 py-2 text-gray-400 font-black select-none border-2 border-transparent"
              >
                …
              </span>
            ) : (
              <button
                key={w}
                onClick={() => handleWeekChange(w)}
                className={`px-4 py-2 border-2 font-black text-sm sm:text-base transition-all duration-200
                  ${
                    w === currentWeek
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black hover:bg-black hover:text-white"
                  }`}
              >
                {w}
              </button>
            )
          )}
        </div>

        {/* Добавление новой недели */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t-2 border-gray-300">
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
                <input
                  type="number"
                  value={newWeek}
                  onChange={(e) => setNewWeek(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder=""
                  className="w-full sm:w-28 px-3 py-2 border-2 border-black text-black font-black bg-white focus:outline-none focus:bg-yellow-100 text-center text-sm sm:text-base"
                  min="1"
                  autoFocus
                />
                <button
                  onClick={handleAddWeek}
                  disabled={!newWeek}
                  className="bg-green-600 text-white px-3 py-2 font-black border-2 border-black hover:bg-green-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewWeek("");
                  }}
                  className="bg-red-600 text-white px-3 py-2 font-black border-2 border-black hover:bg-red-700 transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
