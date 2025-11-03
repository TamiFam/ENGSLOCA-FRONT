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

export default function WordList() {
  const { user, logout } = useAuth();
  const [words, setWords] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const saved = localStorage.getItem("currentWeek");
    return saved ? parseInt(saved) : 1; // По умолчанию 1, а не undefined
  });
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem("page");
    return saved ? Number(saved) : 1;
  });

  const [weekPages, setWeekPages] = useState(() => {
    const saved = localStorage.getItem("weekPages");
    return saved ? JSON.parse(saved) : {};
  });

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

  useEffect(() => {
    localStorage.setItem("weekPages", JSON.stringify(weekPages));
  }, [weekPages]);

  // 👇 Функция для показа тостов
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
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

  useEffect(() => {
    localStorage.setItem("page", page);
  }, [page]);

  const closeToast = () => {
    setToast(null);
  };
  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => p + 1);
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
      console.log("📊 Ответ от API:", res.data);

      if (res.data && Array.isArray(res.data.words)) {
        setWords(res.data.words);
        setTotalPages(res.data.pages || 1);
        setTotalWordsCount(res.data.total || 0);
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
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Toast уведомление */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Абстрактные геометрические фигуры - скрыты на мобильных */}
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-10 left-5 w-40 h-40 bg-red-100 rotate-45 -translate-x-20"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-blue-50 rounded-full translate-x-16"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-100 -rotate-12"></div>
        <div className="absolute bottom-40 right-20 w-36 h-36 bg-green-50 rotate-45 translate-y-10"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-purple-100 -rotate-45"></div>
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
          transition-all duration-300 border border-gray-300 hover:bg-gray-200"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      )}

      {/* Мобильное меню контент */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 p-6 md:hidden">
          <div className="pt-16">
            {user ? (
              <div className="space-y-4 mb-8">
                <div className="bg-green-200 border-2 border-black px-4 py-3 text-base font-bold">
                  ✅ {user.username}
                </div>
                <button
                  onClick={logout}
                  className="bg-red-200 border-2 border-black px-4 py-3 text-base font-bold hover:bg-red-300 transition-colors duration-200 w-full"
                >
                  🚪 Выйти
                </button>
              </div>
            ) : (
              <div className="bg-yellow-200  border-2 border-black px-4 py-2 text-sm font-bold mb-4 mt-4 flex justify-center">                
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
              className="bg-black text-white border-2 border-black px-6 py-3 font-bold w-full mt-8"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Участники в стиле пост-интернет - скрыты на мобильных */}
      <div className="fixed top-27 left-8 z-50 hidden md:block">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
          <ParticipantsSidebar />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Хедер*/}
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-block bg-yellow-300 border-4 border-black px-4 sm:px-8 py-3 sm:py-4 mb-4 sm:mb-6 rotate-1 sm:rotate-2 hover:rotate-0 transition-transform duration-300">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-tight">
              ENGLISH
              <br />
              WORDS
            </h1>
          </div>

          <div className="bg-white border-4 border-black inline-block px-4 sm:px-6 py-2 sm:py-3 -rotate-1 sm:-rotate-1 hover:rotate-0 transition-transform duration-300">
            <p className="text-base sm:text-xl font-bold text-gray-800">
              Изучаем слова всем автодоком 🎯
            </p>
          </div>

          {/* Десктопная версия пользовательской информации */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8">
                <div className="bg-green-200 border-2 border-black px-4 py-2 text-sm font-bold">
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
        />

        {/* ВТОРАЯ СЕКЦИЯ С "ДОБАВИТЬ СЛОВО"*/}
        {memoizedAddWeeker}

        {/* Список слов с адаптивным дизайном */}
        {loading ? (
          <div className="bg-white border-4 border-black p-8 sm:p-12 text-center">
            <div className="flex justify-center space-x-2">
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
        ) : words.length === 0 ? (
          <div className="bg-white border-4 border-black p-8 sm:p-12 lg:p-16 text-center relative">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🔄</div>
            <h3 className="text-xl sm:text-2xl font-black text-black mb-3 sm:mb-4">
              {currentWeek === 1 ? "ПУСТОТА" : `WEEK ${currentWeek} EMPTY`}
            </h3>
            <p className="text-gray-600 font-bold text-sm sm:text-base">
              НАЧНИТЕ ДОБАВЛЯТЬ СЛОВА
            </p>
          </div>
        ) : (
          <>
            <WordsPageSwitcher
              totalPages={totalPages}
              page={page}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
              onSelectPage={setPage}
            />
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
            <WordsPageSwitcher
              totalPages={totalPages}
              page={page}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
              onSelectPage={setPage}
            />
          </>
        )}

       
        {worldInfoModal}

        {wordModal}

        {authModal}
      </div>

      {/* Футер в стиле минимализм */}
      <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 text-xs text-gray-500 font-mono">
        ENGLISH WORDS v1.0
      </div>
    </div>
  );
}
