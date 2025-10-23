import { useEffect, useState, useCallback } from "react";
import {
  fetchWords,
  createWord,
  updateWord,
  deleteWord,
  setAuthModalHandler
} from "./wordsAPI";
import WordModal from "./WordModal";
import AuthModal from "./AuthModal";
import { useAuth } from "../../context/AuthContext";
import WeekSelector from "../../components/WeekSelector";
import ParticipantsSidebar from "./ParticipantsSidebar";

export default function WordList() {
  const { user, logout } = useAuth();
  const [words, setWords] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [page, setPage] = useState(1);
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editWord, setEditWord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [authError, setAuthError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setAuthModalHandler(() => {
      setAuthModalOpen(true);
      setAuthError("Для выполнения действия требуется авторизация");
    });
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const res = await fetchWords({ page, limit: 10, week: currentWeek });
      
      if (res.data && Array.isArray(res.data.words)) {
        setWords(res.data.words);
        setTotalPages(res.data.pages || 1);
      } else {
        setWords([]);
        setTotalPages(1);
      }
    } catch (err) {
      if (err.isAuthError) {
        setAuthError("Для просмотра слов требуется авторизация");
        setAuthModalOpen(true);
      } else {
        setWords([]);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, [page, currentWeek]);

  const handleAddClick = () => {
    if (!user) {
      setAuthError("Для добавления слов требуется авторизация");
      setAuthModalOpen(true);
      return;
    }
    setEditWord(null);
    setWordModalOpen(true);
  };

  const handleEditClick = (word) => {
    if (!user) {
      setAuthError("Для редактирования слов требуется авторизация");
      setAuthModalOpen(true);
      return;
    }
    setEditWord(word);
    setWordModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!user) {
      setAuthError("Для удаления слов требуется авторизация");
      setAuthModalOpen(true);
      return;
    }

    if (window.confirm("Удалить слово?")) {
      try {
        await deleteWord(id);
        loadWords();
      } catch (err) {
        if (err.isAuthError) {
          setAuthError("Для удаления слов требуется авторизация");
          setAuthModalOpen(true);
        }
      }
    }
  };

  const handleSave = async (data) => {
    try {
      const wordData = editWord 
        ? data 
        : { ...data, week: currentWeek };
      
      const action = editWord
        ? updateWord(editWord._id, wordData)
        : createWord(wordData);
      
      await action;
      setWordModalOpen(false);
      loadWords();
    } catch (err) {
      if (err.isAuthError) {
        setAuthError("Для сохранения слов требуется авторизация");
        setAuthModalOpen(true);
        setWordModalOpen(false);
      }
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setAuthError(null);
    setTimeout(() => {
      loadWords();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
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
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-black text-white w-12 h-12 border-2 border-black flex items-center justify-center"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

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
              <div className="bg-yellow-200 border-2 border-black px-4 py-3 text-base font-bold text-center mb-8">
                🔒 Требуется авторизация
              </div>
            )}
            
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
        {/* Хедер в стиле брутализм */}
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
                🔒 Требуется авторизация
              </div>
            )}
          </div>
        </div>

        {/* WeekSelector с адаптивным стилем */}
        <div className="mb-6 sm:mb-8">
          <WeekSelector 
            currentWeek={currentWeek} 
            onWeekChange={setCurrentWeek} 
          />
        </div>

        {/* Статистика с адаптивным дизайном */}
        <div className="bg-white border-4 border-black p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 relative">
          <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-4 h-4 sm:w-6 sm:h-6 bg-black"></div>
          <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-4 h-4 sm:w-6 sm:h-6 bg-black"></div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
                WEEK {currentWeek}
              </h2>
              <p className="text-gray-600 font-bold text-sm sm:text-base">
                📚 {words.length} {words.length === 1 ? 'слово' : words.length < 5 ? 'слова' : 'слов'}
              </p>
            </div>
            <button
              className="bg-black text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg border-4 border-black hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              onClick={handleAddClick}
              disabled={loading}
            >
              <span className="text-lg sm:text-xl">⚡</span>
              <span className="text-sm sm:text-base">ДОБАВИТЬ СЛОВО</span>
            </button>
          </div>
        </div>

        {/* Список слов с адаптивным дизайном */}
        {loading ? (
          <div className="bg-white border-4 border-black p-8 sm:p-12 text-center">
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-black animate-bounce"></div>
              <div className="w-3 h-3 bg-black animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-black animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
            <div className="space-y-4 sm:space-y-6">
              {words.map((w, index) => (
                <div
                  key={w._id}
                  className={`bg-white border-4 border-black p-4 sm:p-6 lg:p-8 hover:shadow-[4px_4px_0_0_#000] sm:hover:shadow-[8px_8px_0_0_#000] transition-all duration-300 group relative ${
                    index % 2 === 0 ? 'sm:rotate-1 hover:rotate-0' : 'sm:-rotate-1 hover:rotate-0'
                  }`}
                >
                  {/* Номер карточки */}
                  <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-black text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                    {index + 1}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-black break-words">
                          {w.word}
                        </span>
                        <span className="text-sm sm:text-lg text-gray-600 font-mono bg-gray-100 px-2 py-1 self-start">[{w.transcriptionUK}]</span>
                        <span className="hidden sm:inline text-2xl text-gray-400">—</span>
                        <span className="text-xl sm:text-2xl font-bold text-gray-800 break-words">{w.translation}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          {w.partOfSpeech}
                        </span>
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                          {w.category}
                        </span>
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                          WEEK {w.week}
                        </span>
                      </div>

                      {w.examples && w.examples.length > 0 && (
                        <div className="bg-gray-100 border-2 border-gray-300 p-3 sm:p-4">
                          <p className="text-gray-700 text-sm sm:text-base">
                            <span className="font-bold text-black">💬:</span> {w.examples[0]}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {user && (
                      <div className="flex gap-2 sm:ml-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 self-end sm:self-start">
                        <button
                          onClick={() => handleEditClick(w)}
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white border-2 border-black hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center flex-shrink-0"
                          title="Редактировать"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(w._id)}
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors duration-200 flex items-center justify-center flex-shrink-0"
                          title="Удалить"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <button 
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-white border-2 border-black px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all duration-200 w-full sm:w-auto"
                >
                  ← BACK
                </button>
                <span className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base border-2 border-black text-center w-full sm:w-auto">
                  PAGE {page} OF {totalPages}
                </span>
                <button 
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="bg-white border-2 border-black px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all duration-200 w-full sm:w-auto"
                >
                  NEXT →
                </button>
              </div>
            )}
          </>
        )}

        <WordModal
          isOpen={wordModalOpen}
          onClose={() => setWordModalOpen(false)}
          onSave={handleSave}
          initialData={editWord}
        />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            setAuthError(null);
          }}
          onSuccess={handleAuthSuccess}
          error={authError}
        />
      </div>

      {/* Футер в стиле минимализм */}
      <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 text-xs text-gray-500 font-mono">
        ENGLISH WORDS v1.0
      </div>
    </div>
  );
}