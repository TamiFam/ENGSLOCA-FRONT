import { useAuth } from "../../context/AuthContext";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import TestModal from "../tests/TestModal";
import { fetchAllWeekWords } from '../words/wordsAPI'
import { usePage } from "../../context/PageContext";
import SentenceTestModal from "../tests/SentenceTestModal";
import VoiceTestModal from "../tests/voiceTestModal";

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
  const { currentPage } = usePage()
  const [porverkaWordsModal, setProverkaWordsModal] = useState(false);
  const [sentenceTestOpen, setSentenceTestOpen] = useState(false);
  const [voiceTestOpen,setVoiceTestOpen] = useState(false)

  const [weekTestOn, setWeekTestOn] = useState(()=> {
    return localStorage.getItem(`weekTestOn-${currentWeek}-page-${currentPage}`) === 'true'
  });
  
  const [weekWords, setWeekWords] = useState([]);
  const [testResults,setTestResults] = useState([])
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
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
    }, [currentWeek]); 

    useEffect(() => {
      // Сохраняем значение weekTestOn в localStorage
      localStorage.setItem(`weekTestOn-${currentWeek}-page-${currentPage}`, weekTestOn.toString());
    }, [weekTestOn, currentWeek,currentPage])

    const openSentenceTest = () => setSentenceTestOpen(true);
    const closeSentenceTest = () => setSentenceTestOpen(false);

    const openVoiceTest = () => setVoiceTestOpen(true);
const closeVoiceTest = () => setVoiceTestOpen(false);

  // ✅ Мемоизируем проверку прав
  const canAdd = useMemo(() => {
    return user && (user.role === "admin" || user.role === "member");
  }, [user]);

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

  
  // ✅ Объявляем checkUserTestResult как useCallback
  const checkUserTestResult = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${API_BASE}/api/tests/${user._id}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.testResults)) {
        
        // Ищем тест для текущей недели И текущей страницы
        const pageTest = data.testResults.find(t => 
          Number(t.week) === Number(currentWeek)  && (
    t.pageInfo?.page === "all" ||
    String(t.pageInfo?.page) === String(currentPage)
  )
        );
        if (pageTest && pageTest.score > 50) {
          setTestResults(pageTest);
          setWeekTestOn(true);
          localStorage.setItem(`weekTestOn-${currentWeek}-page-${currentPage}`, 'true');
        } else {
          setTestResults(null);
          setWeekTestOn(false);
          localStorage.removeItem(`weekTestOn-${currentWeek}-page-${currentPage}`);
        }
      }
    } catch (err) {
      console.error("Ошибка проверки теста:", err);
    }
  }, [user, currentWeek,currentPage]);
  
  useEffect(() => {
    const handlePageChange = () => {
      // Принудительно проверяем тест при смене страницы
      checkUserTestResult();
    };
  
    window.addEventListener('pageChanged', handlePageChange);
    
    return () => {
      window.removeEventListener('pageChanged', handlePageChange);
    };
  }, [checkUserTestResult]);
  
  useEffect(() => {
    checkUserTestResult();
  }, [checkUserTestResult,currentPage]);

 
  const handleTestComplete = async (results) => {
    console.log("Результаты теста:", results);
  
    const score = results.tolerantPercentage || Math.round((results.correctWithTolerance / results.total) * 100);
    
    if (!user?._id) {
      console.error("Пользователь не найден, результат не будет сохранён");
      return;
    }
    const payload = {
      userId: user._id,
      week: currentWeek,
      score,
      pageInfo: {
        page: results.page, // 'all' или номер страницы
        mode: results.mode, // 'page' или 'all'
        pageNumber: results.pageInfo?.pageNumber || null,
        wordsCount: results.pageInfo?.wordsCount || results.total,
        totalPages: results.pageInfo?.totalPages || 1
      },
    };
  
    console.log("Отправляем результат:", payload);
  
    try {
      const res = await fetch(`${API_BASE}/api/tests`, {
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
  // Создаем объект с результатами ДО проверки условия
  const newTestResult = {
    week: currentWeek,
    score: score,
    date: new Date().toISOString(),
    pageInfo: payload.pageInfo
  };
  
      
      if (data.updated) {
        // Результат был обновлен (новый результат лучше)
        setTestResults(newTestResult);

        if (score > 50) {
          setWeekTestOn(true);
          localStorage.setItem(`weekTestOn-${currentWeek}-page-${currentPage}`, 'true');
          showToast(`Тест пройден! Новый результат: ${score}%`, "success");
        } else {
          setWeekTestOn(false);
          localStorage.removeItem(`weekTestOn-${currentWeek}-page-${currentPage}`);
          showToast(`Тест не пройден. Набрано ${score}% из 50%`, "warning");
        }
      } else {
         // Результат не был обновлен (предыдущий результат лучше)
         const page = currentPage.toString();
         const currentWeekResult = data.testResults.find(t => 
           Number(t.week) === Number(currentWeek) && 
           String(t.pageInfo?.page) === String(page)
         );
         console.log("Все результаты:", data.testResults);
console.log("Текущая неделя:", currentWeek);
console.log("Текущая страница:", currentPage);
      if (currentWeekResult) {
        setTestResults(currentWeekResult);
        // ✅ Синхронизируем состояние с серверным результатом
        if (currentWeekResult.score > 50) {
          setWeekTestOn(true);
          localStorage.setItem(`weekTestOn-${currentWeek}-page-${currentPage}`, 'true');
        } else {
          setWeekTestOn(false);
          localStorage.removeItem(`weekTestOn-${currentWeek}-page-${currentPage}`);
        }
      }
      showToast(`Тест пройден, но предыдущий результат был лучше (${currentWeekResult?.score}%)`, "info");
    }
    } catch (err) {
      console.error("Ошибка при сохранении результата:", err.message);
      // Откатываем состояние если сохранение не удалось
      setWeekTestOn(false);
      localStorage.removeItem(`weekTestOn-${currentWeek}-page-${currentPage}`);
    }
  };
  


  return (
    <div className="bg-white border-4 border-black dark:bg-gray-800 dark:border-gray-600 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 relative transition-colors duration-300  ">
      <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-4 h-4 sm:w-6 sm:h-6 bg-black dark:bg-gray-400 transition-colors duration-300 "></div>
      <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-4 h-4 sm:w-6 sm:h-6 bg-black dark:bg-gray-400 transition-colors duration-300"></div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {/* <div className="text-center sm:text-left">
          <h2 className="text-sm sm:text-xl lg:text-sx font-black text-black dark:text-white  transition-colors duration-300">
            WEEK 
            <h3 className="flex justify-center">{currentWeek}</h3>                                                                              //ЦИФРЫ НЕДЕЛИ ВАЖНО
          </h2>
          
          <p className="text-gray-400 font-bold text-sm sm:text-base transition-colors duration-300">
            📚 {wordsCount} 
          </p>
        </div> */}

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/*ТЕСТ СЛОВ ПРОВЕРКА */}

          <div className="relative">
            <div
              className={`px-3 py-3 font-black border-3 border-black dark:bg-gray-400 flex items-center text-sm justify-center gap-2 transition-all duration-300  ${
                weekTestOn
                  ? "bg-green-400 hover:bg-green-300 dark:bg-green-300 dark:hover:bg-green-400"
                  : "bg-red-400 hover:bg-red-300 dark:bg-red-300 dark:hover:bg-red-400"
              }`}
            >
              <button
                className="cursor-pointer text-center transition-colors duration-300  min-w-[100px] min-h-10"
                onClick={handleOpenTestModal}
              >
                <div className="text-xs">ТЕСТ</div>
                <div className="text-xs font-normal">
                  {weekTestOn && testResults?.score
                    ? `✅ Пройден на ${testResults.score} %` 
                    : "❌ Требуется прохождение"
                    }
                </div>
              </button>
            <div>
            
            </div>
            </div>
            <div className="flex justify-center items-center">
            {/* <button
    onClick={openSentenceTest}
    disabled={!canAdd || loading}
    className={`px-1 py-1 bg-blue-600 text-black  hover:bg-blue-700 text-xs mb-3 ${
      canAdd
        ? "bg-green-400 text-black border-black hover:bg-green-200  transition-colors duration-300 dark:bg-green-300"
        : "bg-gray-500 text-gray-200 border-gray-400 cursor-not-allowed transition-colors duration-300"
    }`}
  >
    Новый тест c  предложениями
  </button> */}
            </div>

            {/* Подсказка при наведении */}
            {!weekTestOn && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black dark:bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none transition-colors duration-300">
                Пройдите тест для активации
              </div>
            )}
          </div>
          <button
    onClick={openSentenceTest}
    disabled={!canAdd || loading}
    className={`px-4 py-4 font-black  border-3 border-black dark:bg-green-300 flex items-center justify-center transition-all  duration-200 text-xs  min-w-[100px] ${
      canAdd
        ? "bg-green-300  border-black hover:bg-green-200  transition-colors duration-300 dark:bg-green-300"
        : "bg-green-300 text-black  dark:bg-green-200 cursor-not-allowed transition-colors duration-300"
    }`}
  >
   Тест c  предложениями
  
  </button>
  
 
  {/* <button
    onClick={openVoiceTest} // открывает модалку
    className="px-4 py-4 font-black  border-3 border-black bg-green-300 hover:bg-green-200  dark:bg-green-300 flex items-center justify-center transition-all  duration-200 text-xs  min-w-[100px]"
  >
   Новый голосовой тест
  </button> */}



          {/* Кнопка скрытия всех слов */}
          <button
            onClick={toggleAllWordsVisibility}
            className={`px-4 py-4 font-black border-3 border-black hover:bg-green-200 dark:bg-gray-300 flex items-center justify-center transition-all  duration-200 text-xs  min-w-[150px]  ${
              allWordsHidden
                ? "bg-green-300 text-black hover:bg-green-200 dark:bg-green-300"
                : "bg-green-300 text-black  dark:bg-green-300"
            }`}
            title={allWordsHidden ? "Показать все слова" : "Скрыть все слова"}
          >
            <div className="text-center whitespace-nowrap  ">
              {allWordsHidden ? "РЕЖИМ ОБУЧЕНИЯ ✅" : "РЕЖИМ ОБУЧЕНИЯ ❌"}
            </div>
          </button>

          {/* Кнопка добавления слова */}
          <button
            className={`px-3 py-3 font-bold text-xs sm:text-base border-3 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 flex-1   ${
              canAdd
                ? "bg-blue-500 hover:bg-blue-400 dark:hover:bg-blue-300 text-black border-black transition-colors duration-300 dark:bg-blue-500"
                : "bg-gray-500 text-black border-black cursor-not-allowed transition-colors duration-300"
            }`}
            onClick={() => requireAuth(handleAddClick)}
            disabled={!canAdd || loading}
          >
            <span className="text-sm xs:text-xl">⚡</span>
            <span className="text-xs ">ДОБАВИТЬ СЛОВО</span>
            <span className="text-sm xs:text-xl">⚡</span>
          </button>
        </div>
        <TestModal
          isOpen={porverkaWordsModal}
          onClose={handleCloseTestModal}
          currentWeek={currentWeek}
          onTestComplete={handleTestComplete}
        />
        <SentenceTestModal
        isOpen={sentenceTestOpen}
        onClose={closeSentenceTest}
        words={weekWords}
        />
       
      </div>
    </div>
  );
}
export default memo(AddWeeker);