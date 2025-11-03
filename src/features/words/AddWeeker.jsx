import { useAuth } from "../../context/AuthContext";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import TestModal from "./TestModal";
import { fetchAllWeekWords } from '../words/wordsAPI'
function AddWeeker({
  currentWeek,
  wordsCount, 
  
  showToast,
  setAuthModalOpen,
  setWordModalOpen,
  setEditWord,
  loading,
  allWordsHidden,
  setAllWordsHidden,
}) {
  const { user } = useAuth();
  const [porverkaWordsModal, setProverkaWordsModal] = useState(false);
  const [weekTestOn, setWeekTestOn] = useState(false);
  const [weekWords, setWeekWords] = useState([]);
  

    // 👇 Функция загрузки слов недели
    const loadWeekWords = async (week) => {
      
      try {
        const response = await fetchAllWeekWords(week);
        setWeekWords(response.data.words || []);
      } catch (error) {
        console.error('Ошибка загрузки слов:', error);
        setWeekWords([]);
      } finally {
        
      }
    };
    useEffect(() => {
      loadWeekWords(currentWeek);
    }, [currentWeek]); // ← ДОБАВЬ currentWeek В ЗАВИСИМОСТЬ

  

  // ✅ Мемоизируем проверку прав
  const canAdd = useMemo(() => {
    return user && (user.role === "admin" || user.role === "member");
  }, [user]);
  // const canAdd = useMemo(() => {
  //   // Проверяем, есть ли пользователь и его роль
  //   const isRoleValid = user && (user.role === "admin" || user.role === "member");

  //   // Проверяем, не выходной ли день и не 00:00
  //   const today = new Date();
  //   const day = today.getDay(); // 0 = воскресенье, 6 = суббота
  //   const isWeekend = day === 0 || day === 6; // выходные
  //   const isMidnight = today.getHours() === 0 && today.getMinutes() === 0; // 00:00

  //   // Кнопка доступна, если роль валидна и не выходной день
  //   return isRoleValid && !isWeekend && !isMidnight;
  // }, [user]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Принудительно обновляем canAdd каждую минуту
  //     setCanAdd(updateCanAdd());
  //   }, 60 * 1000); // Каждую минуту

  //   return () => clearInterval(interval);  // Очищаем интервал при размонтировании компонента
  // }, []);

  // ✅ Мемоизируем обработчики
  const handleAddClick = useCallback(() => {
    setEditWord(null);
    setWordModalOpen(true);
  }, [setEditWord, setWordModalOpen]);

  const requireAuth = useCallback(
    (action) => {
      if (!user) {
        showToast("Для выполнения действия требуется авторизация", "warning");
        setAuthModalOpen(true);
        return;
      }
      action();
    },
    [user, showToast, setAuthModalOpen]
  );

  const toggleAllWordsVisibility = useCallback(() => {
    setAllWordsHidden(!allWordsHidden);
    showToast(
      allWordsHidden ? "Все слова показаны" : "Все слова скрыты",
      "info"
    );
  }, [allWordsHidden, setAllWordsHidden, showToast]);


  const handleCloseTestModal = useCallback(() => {
    setProverkaWordsModal(false);
  }, []);
  const handleOpenTestModal = useCallback(() => {
    setProverkaWordsModal(true);
  }, []);

 
  const handleTestComplete = async (results) => {
    console.log("Результаты теста:", results);
  
    const score = results.tolerantPercentage;
    
    if (!user?._id) {
      console.error("Пользователь не найден, результат не будет сохранён");
      return;
    }
  
    if (score > 50) {
      setWeekTestOn(true);
    } else {
      setWeekTestOn(false);
      return; // если <= 50, тест не пройден
    }
  
    const payload = {
      userId: user._id,
      week: currentWeek,
      score,
    };
  
    console.log("Отправляем результат:", payload);
  
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("Ошибка от сервера:", data);
        throw new Error(data.message || "Ошибка записи теста");
      }
  
      console.log("Результат успешно сохранён:", data.testResults);
    } catch (err) {
      console.error("Ошибка при сохранении результата:", err.message);
    }
  };
  


  return (
    <div className="bg-white border-4 border-black p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 relative">
      <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-4 h-4 sm:w-6 sm:h-6 bg-black"></div>
      <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-4 h-4 sm:w-6 sm:h-6 bg-black"></div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-sm sm:text-xl font-black text-black mb-2">
            WEEK {currentWeek}
          </h2>
          <p className="text-gray-600 font-bold text-sm sm:text-base">
            📚 {wordsCount} 
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/*ТЕСТ СЛОВ ПРОВЕРКА */}

          <div className="relative">
            <div
              className={`px-4 py-3 font-black border-3 border-black flex items-center text-sm
    justify-center gap-2 transition-all duration-300 ${
      weekTestOn
        ? "bg-green-400 hover:bg-green-300"
        : "bg-red-400 hover:bg-red-300 "
    }`}
            >
              <button
                className="cursor-pointer text-center"
                onClick={handleOpenTestModal}
              >
                <div>НЕДЕЛЬНЫЙ ТЕСТ</div>
                <div className="text-xs font-normal">
                  {weekTestOn
                    ? "✅ Пройден"
                    : "❌ Требуется прохождение"}
                </div>
              </button>
            </div>

            {/* Подсказка при наведении */}
            {!weekTestOn && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Пройдите тест для активации
              </div>
            )}
          </div>

          {/* Кнопка скрытия всех слов */}
          <button
  onClick={toggleAllWordsVisibility}
  className={`px-4 py-3 font-black border-4 border-black flex items-center justify-center transition-all duration-200 text-sm min-w-[200px] ${
    allWordsHidden
      ? "bg-green-200 text-black hover:bg-green-300"
      : "bg-red-200 text-black hover:bg-red-300"
  }`}
  title={allWordsHidden ? "Показать все слова" : "Скрыть все слова"}
>
  <div className="text-center whitespace-nowrap">
    {allWordsHidden ? "РЕЖИМ ОБУЧЕНИЯ ✅" : "РЕЖИМ ОБУЧЕНИЯ ❌"}
  </div>
</button>

          {/* Кнопка добавления слова */}
          <button
            className={`px-4 sm:px-5 lg:px-5 py-3 font-bold text-sm sm:text-base border-4 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 flex-1 ${
              canAdd
                ? "bg-black text-white border-black hover:bg-white hover:text-black"
                : "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"
            }`}
            onClick={() => requireAuth(handleAddClick)}
            disabled={!canAdd || loading}
          >
            <span className="text-lg sm:text-xl">⚡</span>
            <span>ДОБАВИТЬ СЛОВО</span>
          </button>
        </div>
        <TestModal
          isOpen={porverkaWordsModal}
        
          onClose={handleCloseTestModal}
          currentWeek={currentWeek}
          onTestComplete={handleTestComplete}
        />
      </div>
    </div>
  );
}
export default memo(AddWeeker);
