import { useAuth } from "../../context/AuthContext";
import { memo, useCallback, useMemo } from "react";

function AddWeeker({ 
  currentWeek, 
  wordsCount,  // ← меняем words на wordsCount
  showToast, 
  setAuthModalOpen, 
  setWordModalOpen, 
  setEditWord, 
  loading,
  allWordsHidden,
  setAllWordsHidden 
}) {
  const { user } = useAuth();

  // ✅ Мемоизируем проверку прав
  const canAdd = useMemo(() => {
    return user && (user.role === "admin" || user.role === "member");
  }, [user]);

  // ✅ Мемоизируем обработчики
  const handleAddClick = useCallback(() => {
    setEditWord(null);
    setWordModalOpen(true);
  }, [setEditWord, setWordModalOpen]);

  const requireAuth = useCallback((action) => {
    if (!user) {
      showToast("Для выполнения действия требуется авторизация", "warning");
      setAuthModalOpen(true);
      return;
    }
    action();
  }, [user, showToast, setAuthModalOpen]);

  const toggleAllWordsVisibility = useCallback(() => {
    setAllWordsHidden(!allWordsHidden);
    showToast(
      allWordsHidden ? "Все слова показаны" : "Все слова скрыты", 
      "info"
    );
  }, [allWordsHidden, setAllWordsHidden, showToast]);

  // ✅ Мемоизируем текст количества слов
  const wordsCountText = useMemo(() => {
    if (wordsCount === 1) return "слово";
    if (wordsCount < 5) return "слова";
    return "слов";
  }, [wordsCount]);

  return (
    <div className="bg-white border-4 border-black p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 relative">
      <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-4 h-4 sm:w-6 sm:h-6 bg-black"></div>
      <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-4 h-4 sm:w-6 sm:h-6 bg-black"></div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
            WEEK {currentWeek}
          </h2>
          <p className="text-gray-600 font-bold text-sm sm:text-base">
            📚 {wordsCount} {wordsCountText}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Кнопка скрытия всех слов */}
          <button
            onClick={toggleAllWordsVisibility}
            className={`px-4 py-3 font-black border-4 border-black flex items-center justify-center gap-2 transition-all duration-200 focus:translate-x-0.5 focus:translate-y-0.5 focus:outline-none ${
              allWordsHidden
                ? "bg-green-200 text-black shadow-[4px_4px_0_0_#000] focus:shadow-[2px_2px_0_0_#000]"
                : "bg-red-200 text-black shadow-[4px_4px_0_0_#000] focus:shadow-[2px_2px_0_0_#000]"
            }`}
            title={allWordsHidden ? "Показать все слова" : "Скрыть все слова"}
          >
            {allWordsHidden ? "👁️ ПОКАЗАТЬ" : "👁️‍🗨️ СКРЫТЬ"}
          </button>

          {/* Кнопка добавления слова */}
          <button
            className={`px-4 sm:px-6 lg:px-8 py-3 font-bold text-sm sm:text-base border-4 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 flex-1 ${
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
      </div>
    </div>
  );
}
export default memo(AddWeeker);