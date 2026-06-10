import { useEffect, useState, useCallback, useMemo } from "react";
import {
  fetchWords,
  createWord,
  updateWord,
  deleteWord,
  setAuthModalHandler,
} from "./wordsAPI";
import WordModal from "./WordModal";
import AuthModal from "./AuthModal";
import { useAuth } from "../../context/AuthContext";
import WeekSelector from "../../components/WeekSelector";
import ParticipantsSidebar from "./ParticipantsSidebar";

import { useAppEvents } from "../../context/AppEventsContext";
import Toast from "../../components/Toast";
import WorldInfoModal from "./WorldInfoModal";
import AddWeeker from "./AddWeeker";

import WordsPageSwitcher from "./WordsPageSwitcher";
import WordCard from "./WordCard";
import "../../../styles/snow.css";
import { useTheme } from "../../hooks/useTheme";
import { Snowflakes } from "../../effect/snow/snowflakes";
import { usePage } from "../../context/PageContext";
import Chat from "../../components/Chat";
import { WordSearch } from "../../components/WordSearch";
import WordsStats from "../../components/wordsStats";


export default function WordList() {
  const { changePage } = usePage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [words, setWords] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const saved = localStorage.getItem("currentWeek");
    return saved ? parseInt(saved) : 1; // По умолчанию 1, а не undefined
  });
  const { currentPage } = usePage();
  const page = Number(currentPage);
  const [weekPages, setWeekPages] = useState(() => {
    const saved = localStorage.getItem("weekPages");
    return saved ? JSON.parse(saved) : {};
  });
  const [backgroundWords, setBackgroundWords] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [wordInfoModal, setWordInfoModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editWord, setEditWord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [authError, setAuthError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  const { triggerParticipantsRefresh } = useAppEvents();
  const [allWordsHidden, setAllWordsHidden] = useState(false);
  const [totalWordsCount, setTotalWordsCount] = useState(0);

  const [searchResult, setSearchResult] = useState(null); // { word: null, found: false, query: '' }


  useEffect(() => {
    localStorage.setItem("weekPages", JSON.stringify(weekPages));
  }, [weekPages]);

  // 👇 Функция для показа тостов
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };
 // Вместо них добавь эти:


 // Временно замени handleSearchResult на тестовую версию:
const handleSearchResult = (result) => {
  console.log('🔍 Получен результат поиска:', result);
  
  // Если результат null или undefined
  if (!result) {
    console.log('⚠️ Результат null/undefined');
    setSearchResult(null);
    return;
  }
  
  // Если результат пришел, но без word (только found: false)
  if (result.found === false) {
    console.log('❌ Слово не найдено:', result.query);
    setSearchResult(result);
    return;
  }
  
  // Если есть word - проверяем структуру
  if (result.word) {
    console.log('✅ Найдено слово, проверяем структуру:', {
      word: result.word,
      hasId: '_id' in result.word,
      hasWord: 'word' in result.word,
      hasTranslation: 'translation' in result.word
    });
    
    // Если у слова нет нужных полей, добавляем моковые
    if (!result.word._id || !result.word.word) {
      console.log('⚠️ У слова неполная структура, добавляем моковые данные');
      const mockWord = {
        _id: 'search_' + Date.now(),
        word: result.word.word || result.query || 'Unknown',
        translation: result.word.translation || 'Перевод не найден',
        transcriptionUK: result.word.transcriptionUK || '[test]',
        partOfSpeech: result.word.partOfSpeech || 'noun',
        category: result.word.category || 'search',
        week: result.word.week || currentWeek,
        examples: result.word.examples || ['Пример использования'],
        notes: result.word.notes || 'Найдено через поиск',
        createdAt: result.word.createdAt || new Date().toISOString(),
        author: result.word.author || { _id: 'system', username: 'System' }
      };
      
      setSearchResult({
        ...result,
        word: mockWord
      });
    } else {
      setSearchResult(result);
    }
  } else {
    console.log('⚠️ Нет поля word в результате');
    setSearchResult(result);
  }
};

const handleClearSearch = () => {
  setSearchResult(null);
};



  const handlePageChange = (newPage) => {
    changePage(newPage);
    if (currentWeek) {
      setWeekPages((prev) => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek], // сохраняем существующие данные
          currentPage: newPage, // текущая страница
          totalPages: prev[currentWeek]?.totalPages || totalPages, // общее кол-во страниц
        },
      }));
    }
  };

  const closeToast = () => {
    setToast(null);
  };
  const handlePrevPage = useCallback(() => {
    changePage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    changePage((p) => p + 1);
  }, []);

  useEffect(() => {
    setAuthModalHandler(() => {
      setAuthModalOpen(true);
      setAuthError("Для выполнения действия требуется авторизация");
    });
  }, []);

  const handleWeekChange = (week) => {
    // Сохраняем текущую страницу для предыдущей недели
    if (currentWeek) {
      setWeekPages((prev) => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          currentPage: page,
          totalPages: totalPages,
        },
      }));
    }

    // Устанавливаем новую неделю
    setCurrentWeek(week);

    // WeekSelector сам проверит корректность страницы через getPagesCount
    // и вызовет onPageChange(1) если нужно

    localStorage.setItem("currentWeek", week);
  };
  const getPagesCount = (week) => {
    if (week === currentWeek) {
      return totalPages;
    }
    // ✅ Возвращаем сохраненное количество страниц для конкретной недели
    return weekPages[week]?.totalPages || 1;
  };
  useEffect(() => {
    if (currentWeek && totalPages) {
      setWeekPages((prev) => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          totalPages,
        },
      }));
    }
  }, [currentWeek, totalPages]);

  const canEdit = (user) => {
    return user && (user.role === "admin" || user.role === "member");
  };

  const canDelete = (user) => {
    return user && user.role === "admin"; // Только админ может удалять
  };

  // const canAdd = (user) => {
  //   return user && (user.role === "admin" || user.role === "member");
  // };

  const loadWords = async () => {
    setLoading(true);
    try {
      const res = await fetchWords({ page, limit: 10, week: currentWeek });
      // console.log("📊 Ответ от API:", res.data);

      if (res.data && Array.isArray(res.data.words)) {
        setWords(res.data.words);
        setTotalPages(res.data.pages || 1);
        setTotalWordsCount(res.data.total || 0);
        // 🔥 Кешируем слова для фона только если массив пустой
        if (backgroundWords.length === 0 && res.data.words.length > 0) {
          setBackgroundWords(res.data.words);
        }
      } else {
        setWords([]);
        setTotalPages(1);
        setTotalWordsCount(0);
      }
    } catch (err) {
      // 🔥 ИГНОРИРУЕМ ОШИБКИ АВТОРИЗАЦИИ - ПОКАЗЫВАЕМ СЛОВА ВСЕМ
      console.log("Ошибка при загрузке слов:", err);
      setWords([]);
      setTotalPages(1);
      setTotalWordsCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, [page, currentWeek]);

  const stableHandleEditClick = useCallback(
    (word) => {
      if (!user) {
        showToast("Для редактирования слов требуется авторизация", "warning");
        setAuthModalOpen(true);
        return;
      }
      // 👇 Проверка прав для редактирования
      if (!canEdit(user)) {
        showToast("У вас нет прав для редактирования слов", "error");
        return;
      }
      setEditWord(word);
      setWordModalOpen(true);
    },
    [user, showToast]
  ); // ← зависимости: user и showToast

  const stableHandleWordInfo = useCallback(
    (word) => {
      if (!user) {
        showToast("Для редактирования слов требуется авторизация", "warning");
        setAuthModalOpen(true);
        return;
      }
      setSelectedWord(word);
      setWordInfoModal(true);
    },
    [user, showToast]
  ); // ← зависимости: user и showToast
  const mixWords = () => {
    setWords((prevWords) => {
      const shuffled = [...prevWords];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    showToast("Слова перемешаны!", "info");
  };
  const handleDeleteClick = async (id) => {
    if (!user) {
      showToast("Для удаления слов требуется авторизация", "warning"); // 👈
      setAuthModalOpen(true);
      return;
    }

    // 👇 Проверка прав для удаления
    if (!canDelete(user)) {
      showToast("Только администратор может удалять слова", "error"); // 👈
      return;
    }

    showToast(
      <div className="flex flex-col gap-2">
        <p className="font-black">Удалить слово?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              closeToast();
              try {
                await deleteWord(id);
                loadWords();
                triggerParticipantsRefresh();
                showToast("Слово успешно удалено", "success"); // 👈
              } catch (err) {
                if (err.isAuthError) {
                  setAuthError("Для удаления слов требуется авторизация");
                  setAuthModalOpen(true);
                }
              }
            }}
            className="bg-red-500 text-white px-3 py-1 border-2 border-black text-sm font-bold hover:bg-red-600"
          >
            УДАЛИТЬ
          </button>
          <button
            onClick={closeToast}
            className="bg-gray-500 text-white px-3 py-1 border-2 border-black text-sm font-bold hover:bg-gray-600"
          >
            ОТМЕНА
          </button>
        </div>
      </div>,
      "error"
    );
  };

  const handleSave = async (data) => {
    try {
      console.log("📝 handleSave вызван с данными:", data);

      let wordData;
      let wordId;
      let isEditingWord = false;

      if (editWord) {
        // 📝 Редактирование основного слова (из WordModal)
        console.log("✏️ Режим редактирования слова:", editWord);
        wordData = { ...data, week: currentWeek };
        wordId = editWord._id;
        isEditingWord = true;
      } else if (selectedWord) {
        // 💬 Добавление примеров/заметок к существующему слову (из WorldInfoModal)
        console.log("💬 Режим обновления информации слова:", selectedWord);
        wordData = {
          ...selectedWord, // берем все данные слова
          examples: data.examples, // обновляем examples
          notes: data.notes, // обновляем notes
        };
        wordId = selectedWord._id;
        isEditingWord = true;
      } else {
        // ➕ Создание нового слова
        console.log("➕ Режим создания нового слова");
        wordData = { ...data, week: currentWeek };
      }

      console.log("📤 Отправляемые данные:", wordData);

      // Выбираем действие: обновление или создание
      let result;
      if (isEditingWord) {
        console.log("🔄 Обновление слова с ID:", wordId);
        result = await updateWord(wordId, wordData);
      } else {
        console.log("🆕 Создание нового слова");
        result = await createWord(wordData);
      }

      console.log("✅ Успешный ответ от сервера:", result);

      // Закрываем правильную модалку и сбрасываем состояния
      if (editWord) {
        setWordModalOpen(false);
        setEditWord(null);
      }
      if (selectedWord) {
        setWordInfoModal(false);
        setSelectedWord(null);
      }
      if (!editWord && !selectedWord) {
        setWordModalOpen(false);
      }

      // Обновляем данные
      await loadWords();
      triggerParticipantsRefresh();

      // Показываем соответствующее уведомление
      if (isEditingWord) {
        showToast("Данные слова обновлены!", "success");
      } else {
        showToast("Слово добавлено!", "success");
      }
    } catch (err) {
      console.error("❌ Ошибка сохранения:", err);
      console.error("❌ Детали ошибки:", {
        message: err.message,
        status: err.status,
        data: err.data,
        isAuthError: err.isAuthError,
      });

      if (err.isAuthError) {
        showToast("Для сохранения требуется авторизация", "warning");
        setAuthModalOpen(true);
        // Закрываем все модалки при ошибке авторизации
        setWordModalOpen(false);
        setWordInfoModal(false);
      } else {
        // Показываем более детальное сообщение об ошибке
        const errorMessage = err.message || "Ошибка при сохранении";
        showToast(
          <div>
            <div className="font-bold">Ошибка сохранения</div>
            <div className="text-sm">{errorMessage}</div>
          </div>,
          "error"
        );
      }
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setAuthError(null);
    showToast("Авторизация успешна!", "success"); // 👈
    setTimeout(() => {
      loadWords();
    }, 500);
  };

  const memoizedAddWeeker = useMemo(() => {
    return (
      <AddWeeker
        currentWeek={currentWeek}
        wordsCount={totalWordsCount}
        showToast={showToast}
        setAuthModalOpen={setAuthModalOpen}
        setWordModalOpen={setWordModalOpen}
        setEditWord={setEditWord}
        loading={loading}
        allWordsHidden={allWordsHidden}
        setAllWordsHidden={setAllWordsHidden}
      />
    );
  }, [currentWeek, loading, allWordsHidden]);

  // ✅ Мемоизируем WeekSelector

  // ✅ Мемоизируем модалки
  const worldInfoModal = useMemo(
    () => (
      <WorldInfoModal
        isOpen={wordInfoModal}
        onClose={() => {
          setWordInfoModal(false);
          setSelectedWord(null);
        }}
        onSave={handleSave}
        initialData={selectedWord}
      />
    ),
    [wordInfoModal, selectedWord]
  );

  const wordModal = useMemo(
    () => (
      <WordModal
        isOpen={wordModalOpen}
        onClose={() => setWordModalOpen(false)}
        onSave={handleSave}
        initialData={editWord}
      />
    ),
    [wordModalOpen, editWord]
  );

  const authModal = useMemo(
    () => (
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthError(null);
        }}
        onSuccess={handleAuthSuccess}
        error={authError}
      />
    ),
    [authModalOpen, authError]
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-x-hidden ">
      {/* Кнопка переключения темы */}
      <style>
        {`
  @keyframes themeSwitch {
    0% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
    50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
    100% { transform: scale(1) rotate(360deg); opacity: 1; }
  }
`}
      </style>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-full m-2 bg-white dark:bg-black relative overflow-hidden"
      >
        <span
          key={theme}
          className="text-3xl inline-block animate-[themeSwitch_0.6s_ease-in-out]"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </button>

      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed top-4 right-4 z-50 p-3 bg-blue-500 border-3 text-sm border-black text-white rounded-full shadow-lg hover:bg-blue-600 dark:border-3 dark:border-green-200 transition-colors duration-200 hidden md:block"
        title="Community Chat"
      >
        {showChat ? "✕" : "💬"}
      </button>
   <button
  onClick={() => setShowStats(!showStats)}
  className="absolute top-103 right-96 z-50 w-12 h-12 bg-yellow-400 border-3 border-black text-black dark:border-gray-600 shadow-[4px_4px_0px_0px_black] dark:shadow-[6px_6px_0px_0px_gray] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
>
  📊
</button>

      {/* Toast уведомление */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* СНЕЖИНКИ */}
      <Snowflakes />

      {/* Абстрактные геометрические фигуры - скрыты на мобильных */}
      <div className="fixed inset-0 pointer-events-none hidden md:block z-10">
        {/* Плавающие слова с анимацией */}
        <div className="absolute top-14 left-10 text-3xl font-black  dark:text-white  text-gray-800 opacity-35 transform -rotate-12 animate-float-1 blur-[3px]">
          {backgroundWords[1]?.word}
        </div>
        <div className="absolute top-12 right-16 text-3xl font-black dark:text-white text-gray-800 opacity-35 transform rotate-6 animate-float-2 blur-[3px]">
          {backgroundWords[0]?.translation}
        </div>
        <div className="absolute bottom-28 left-20 text-3xl font-black dark:text-white text-gray-800 opacity-35 transform rotate-45 animate-float-3 blur-[2px]">
          {backgroundWords[2]?.word}
        </div>
        <div className="absolute bottom-36 right-24 text-3xl font-black  dark:text-white text-gray-800 opacity-35 transform -rotate-45 animate-float-4 blur-[3px]">
          {backgroundWords[3]?.word}
        </div>
        <div className="absolute top-1/3 left-1/4 text-3xl font-black dark:text-white text-gray-800 opacity-35 transform rotate-12 animate-float-5 blur-[2px]">
          {backgroundWords[5]?.translation}
        </div>
        <div className="absolute top-2/3 right-1/4 text-3xl font-black dark:text-white text-gray-800 opacity-35 transform -rotate-8 animate-float-6 blur-[3px]">
          {backgroundWords[6]?.word}
        </div>

        {/* Дополнительные слова для большего заполнения */}
        <div className="absolute top-40 left-1/2 text-3xl font-black  dark:text-white text-gray-800 opacity-35 transform -rotate-3 animate-float-7 blur-[3px]">
          {backgroundWords[7]?.translation}
        </div>
        <div className="absolute bottom-10 right-1/3 text-3xl font-black  dark:text-white text-gray-800 opacity-35 transform rotate-15 animate-float-8 blur-[3px]">
          {backgroundWords[8]?.word}
        </div>
        <div className="absolute top-1/4 right-8 text-3xl font-black  dark:text-white text-gray-800 opacity-35 transform -rotate-20 animate-float-9 blur-[3px]">
          {backgroundWords[9]?.translation}
        </div>
        <div className="absolute bottom-44 left-1/4 text-3xl font-black  dark:text-white text-gray-800 opacity-35 transform rotate-25 animate-float-10 blur-[3px]">
          {backgroundWords[10]?.word}
        </div>
      </div>

      {/* Грубые линии-разделители */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black"></div>
      <div className="fixed top-0 left-0 w-1 h-full bg-black"></div>
      <div className="fixed bottom-0 left-0 w-full h-2 bg-black"></div>
      <div className="fixed top-0 right-0 w-1 h-full bg-black"></div>

      {/* Мобильное меню */}
      {wordModalOpen === true ? null : (
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-gray-200 text-gray-800 w-9 h-9 flex items-center justify-center rounded-xl shadow-xl hover:shadow-xl 
          transition-all duration-300 border border-gray-300 dark:border-gray-400 hover:bg-gray-200 dark:bg-gray-500"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      )}

      {/* Мобильное меню контент */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 p-6 md:hidden dark:bg-black  ">
          <div className="pt-16 ">
            {user ? (
              <div className="space-y-4 mb-8 ">
                {/* 👇 КНОПКА ЧАТА В МОБИЛЬНОМ МЕНЮ */}
                <button
                  onClick={() => {
                    setShowChat(!showChat);
                    setMobileMenuOpen(false); // закрываем меню при открытии чата
                  }}
                  className="bg-blue-200 border-2 border-black px-4 py-3 text-base font-bold hover:bg-blue-300 transition-colors duration-200 w-full"
                >
                  {showChat ? "✕ Закрыть чат" : "💬 Открыть чат"}
                </button>
                <div className="bg-green-200 border-2 border-black  px-4 py-3 text-base font-bold ">
                  ✅ {user.username}
                </div>

                <button
                  onClick={logout}
                  className="bg-red-200 border-2 border-black px-4 py-3 text-base font-bold hover:bg-red-300 transition-colors duration-200 w-full "
                >
                  🚪 Выйти
                </button>
              </div>
            ) : (
              <div className="bg-yellow-200   border-2 border-black px-4 py-2 text-sm font-bold mb-4 mt-4 flex justify-center">
                <button onClick={() => setAuthModalOpen(true)}>
                  🔒 Требуется авторизация
                </button>
              </div>
            )}
            {authModal}
            <div className="mb-8">
              <ParticipantsSidebar />
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className=" text-black dark:text-white border-2 dark:bg-gray-800 dark:border-gray-400 border-black px-6 py-3 font-bold w-full mt-8"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Участники в стиле пост-интернет - скрыты на мобильных */}
      <div className="fixed top-27 left-8 z-50 hidden md:block">
        <div className="bg-white border-4  border-black shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
          <ParticipantsSidebar />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Хедер*/}
        <div className="text-center mb-8 sm:mb-16">
          <div
            className="inline-block bg-yellow-300 dark:bg-blue-300 border-4 border-black  px-4 sm:px-8 py-3 sm:py-4 mb-4 sm:mb-6 rotate-1 sm:rotate-2 hover:rotate-0 transition-transform
           duration-300"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-tight">
              ENGLISH
              <br />
              WORDS
            </h1>
          </div>

          <div className="bg-white border-4 border-black dark:bg-blue-100 inline-block px-4 sm:px-6 py-2 sm:py-3 -rotate-1 sm:-rotate-1 hover:rotate-0 transition-transform duration-300">
            <p className="text-base sm:text-xl font-bold text-gray-800">
              Изучаем слова со всем миром 🎯
            </p>
          </div>

          {/* Десктопная версия пользовательской информации */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8 ">
                <div className="bg-green-200 border-2 border-black px-4 py-2 text-sm font-bold ">
                  ✅ {user.username}
                </div>
                <button
                  onClick={logout}
                  className="bg-red-200 border-2 border-black px-4 py-2 text-sm font-bold hover:bg-red-300 transition-colors duration-200"
                >
                  🚪 Выйти
                </button>
              </div>
            ) : (
              <div className="bg-yellow-200 border-2 border-black px-4 py-2 text-sm font-bold inline-block mt-4">
                <button onClick={() => setAuthModalOpen(true)}>
                  🔒 Требуется авторизация
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WeekSelector с адаптивным стилем */}
        <WeekSelector
          currentWeek={currentWeek}
          onWeekChange={handleWeekChange}
          currentPage={page}
          onPageChange={handlePageChange}
          getPagesCount={getPagesCount}
          wordsCount={totalWordsCount}
        />

        {/* ВТОРАЯ СЕКЦИЯ С "ДОБАВИТЬ СЛОВО"*/}
        {memoizedAddWeeker}

        {/* Список слов с адаптивным дизайном */}
       {/* Список слов с адаптивным дизайном */}
{loading ? (
  <div className="bg-white border-4 border-black p-8 sm:p-12 text-center dark:bg-gray-700 ">
    <div className="flex justify-center space-x-2 ">
      <div className="w-3 h-3 bg-black animate-bounce"></div>
      <div
        className="w-3 h-3 bg-black animate-bounce"
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className="w-3 h-3 bg-black animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></div>
    </div>
  </div>
) : (
  <>
    <WordsPageSwitcher
      totalPages={totalPages}
      page={page}
      onPrev={handlePrevPage}
      onNext={handleNextPage}
      onSelectPage={changePage}
    />
    <div className="flex justify-center items-center pb-9">
      <button
        onClick={mixWords}
        className="
          bg-black hover:bg-gray-800
          dark:bg-white dark:hover:bg-gray-200
          border-2 border-black dark:border-white
          px-6 py-3
          font-bold text-white dark:text-black
          transition-all duration-300
          hover:scale-105
          active:scale-95
          group
        "
      >
        <span className="flex items-center gap-2">
          <span className="group-hover:rotate-90 transition-transform duration-300">
            ↻
          </span>
          SHUFFLE
          <span className="group-hover:-rotate-90 transition-transform duration-300">
            ↺
          </span>
        </span>
      </button>
    </div>
    <div className="mb-6 relative">
      <div className="absolute -top-4 right-0">
        <WordSearch 
          currentWeek={currentWeek}
          showToast={showToast}
          onSearchResult={handleSearchResult}
        />
      </div>
    </div>

    {/* ВАЖНО: Показываем или результат поиска, или все слова */}
    {searchResult ? (
      <div className="space-y-4 sm:space-y-6">
        {/* Минимальная панель с кнопкой возврата */}
        <div className="flex justify-end">
          <button
            onClick={handleClearSearch}
            className="text-sm text-red-500 hover:text-black dark:hover:text-white px-3 py-1  pt-4 border border-gray-400 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Вернуться ко всем словам"
          >
            ← Вернуться
          </button>
        </div>

        {/* Показываем найденное слово ИЛИ сообщение "не найдено" */}
        {searchResult.found ? (
          <WordCard
            key={`search-${searchResult.word._id}`}
            word={searchResult.word}
            index={0}
            allWordsHidden={allWordsHidden}
            onEditClick={stableHandleEditClick}
            onWordInfo={stableHandleWordInfo}
            onDeleteClick={handleDeleteClick}
            user={user}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">
              Слово не найдено
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              "{searchResult.query}" не найдено в неделе {currentWeek}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleClearSearch}
                className="w-full max-w-xs mx-auto bg-black dark:bg-white text-white dark:text-black px-6 py-3 font-bold border-2 border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                Вернуться ко всем словам
              </button>
              <p className="text-sm text-gray-500">
                Проверьте правильность написания
              </p>
            </div>
          </div>
        )}
      </div>
    ) : words.length === 0 ? (
      // НЕТ СЛОВ: показываем сообщение о пустоте
      <div className="bg-white dark:bg-gray-800 border-4 border-black p-8 sm:p-12 lg:p-16 text-center relative">
        <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🔄</div>
        <h3 className="text-xl sm:text-2xl font-black text-black mb-3 sm:mb-4">
          {currentWeek === 1 ? "ПУСТОТА" : `WEEK ${currentWeek} EMPTY`}
        </h3>
        <p className="text-gray-600 font-bold text-sm sm:text-base">
          НАЧНИТЕ ДОБАВЛЯТЬ СЛОВА
        </p>
      </div>
    ) : (
      // ОБЫЧНЫЙ РЕЖИМ: показываем все 10 слов
      <div className="space-y-4 sm:space-y-6">
        {words.map((w, index) => (
          <WordCard
            key={w._id}
            word={w}
            index={index}
            allWordsHidden={allWordsHidden}
            onEditClick={stableHandleEditClick}
            onWordInfo={stableHandleWordInfo}
            onDeleteClick={handleDeleteClick}
            user={user}
          />
        ))}
      </div>
    )}

    {/* Пейджер показываем только если НЕ в режиме поиска */}
    {!searchResult && words.length > 0 && (
      <WordsPageSwitcher
        totalPages={totalPages}
        page={page}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
        onSelectPage={changePage}
      />
    )}
  </>
)}

        {worldInfoModal}

        {wordModal}

        {authModal}
      </div>

      {/* Футер в стиле минимализм */}
      <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 text-xs text-gray-500 font-mono">
        ENGLISH WORDS v1.5
      </div>

      <div>
          {showStats && (
    <div className="fixed top-10 left-4 right-4 bottom-4 md:left-auto md:right-4 md:top-20 md:w-86 md:bottom-4 z-50 bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 shadow-2xl rounded-lg overflow-hidden">
      <WordsStats onClose={() => setShowStats(false)} userId={user?._id} />
    </div>
  )}
        {showChat && (
          <div className="fixed top-10 left-4 right-4 bottom-4 md:left-auto md:right-4 md:top-20 md:w-96 md:bottom-4 z-50 bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 shadow-2xl rounded-lg overflow-hidden">
            <Chat onClose={() => setShowChat(false)} />
               
          </div>
        )}
        
      </div>
      
    </div>
  );
}
