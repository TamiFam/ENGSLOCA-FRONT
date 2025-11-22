import { useState, useEffect } from "react";
import axiosInstance from "../../services/axios"

export default function SentenceTestModal({ words, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSentence, setUserSentence] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMode, setSelectedMode] = useState("page");
  const wordsPerPage = 10;

  const totalPages = Math.ceil(words.length / wordsPerPage);

  const getCurrentPageWords = () => {
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    return words.slice(startIndex, endIndex);
  };

  const getAllWords = () => words;

  const getAvailableWords = () => {
    return selectedMode === "all" ? getAllWords() : getCurrentPageWords();
  };

  useEffect(() => {
    if (isOpen && words.length > 0) {
      setCurrentIndex(0);
      setUserSentence("");
      setCheckResult(null);
      setTimer(0);
      setCurrentPage(1);
      setSelectedMode("page");
      const pageWords = getCurrentPageWords();
      if (pageWords.length > 0) {
        setSelectedWord(pageWords[0]);
      }
    }
  }, [isOpen, words]);

  // Таймер
  useEffect(() => {
    let interval;
    if (checking) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [checking]);

  const checkSentence = async () => {
    if (!selectedWord) return;
    
    setChecking(true);
    setTimer(0);
    try {
      const response = await axiosInstance.post("/deepseek/check-sentence", {
        word: selectedWord.word,
        sentence: userSentence,
      });
      setCheckResult(response.data);
    } catch (error) {
      console.error(error);
      setCheckResult({ error: "Ошибка при проверке" });
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    const availableWords = getAvailableWords();
    if (currentIndex < availableWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedWord(availableWords[currentIndex + 1]);
      setUserSentence("");
      setCheckResult(null);
      setTimer(0);
    } else {
      onClose();
    }
  };

  const handleWordSelect = (word) => {
    setSelectedWord(word);
    setUserSentence("");
    setCheckResult(null);
    const availableWords = getAvailableWords();
    const newIndex = availableWords.findIndex(w => w.word === word.word);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedMode("page");
    setCurrentIndex(0);
    const pageWords = getCurrentPageWords();
    if (pageWords.length > 0) {
      setSelectedWord(pageWords[0]);
    }
    setUserSentence("");
    setCheckResult(null);
  };

  if (!isOpen) return null;

  const formatTime = (seconds) => `${seconds} сек`;

  const availableWords = getAvailableWords();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gray-900 p-4 sm:p-6 rounded-xl w-full max-w-md sm:max-w-xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold text-white text-center mb-4">
          Составьте предложение
        </h2>

        {/* Выбор страницы */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Страница:</span>
            <span className="text-gray-400 text-sm">
              {currentPage} / {totalPages}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`p-1 sm:p-2 text-xs sm:text-sm rounded-lg border-2 transition-all ${
                  currentPage === page
                    ? "bg-blue-900/30 border-blue-500 text-blue-300"
                    : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>

        {/* Выбор слова */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto py-1">
            {availableWords.map((word, index) => (
              <button
                key={word._id || index}
                onClick={() => handleWordSelect(word)}
                className={`px-2 sm:px-3 py-1 sm:py-2 text-sm rounded-lg border transition-colors flex-shrink-0 ${
                  selectedWord?.word === word.word
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {word.word}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2 text-center">
            Слов: {availableWords.length}
          </p>
        </div>

        {/* Таймер */}
        {checking && (
          <div className="mb-4 text-center">
            <div className="text-blue-400 text-sm">
              ⏱️ Проверяем: {formatTime(timer)}
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(timer * 5, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Выбранное слово */}
        {selectedWord && (
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center mb-4">
            <p className="text-gray-400 text-sm">Используйте слово:</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{selectedWord.word}</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">{selectedWord.translation}</p>
          </div>
        )}

        <textarea
          className="w-full h-24 sm:h-28 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 mb-4 placeholder-gray-500 text-sm sm:text-base resize-none"
          placeholder="Напишите предложение на английском..."
          value={userSentence}
          onChange={(e) => setUserSentence(e.target.value)}
          disabled={checking || !selectedWord}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && userSentence.length >= 3 && !checking && selectedWord) {
              e.preventDefault();
              checkSentence();
            }
          }}
        />

        {!checkResult && (
          <button
            onClick={checkSentence}
            disabled={checking || userSentence.length < 3 || !selectedWord}
            className={`w-full py-2 text-white rounded-lg transition-colors text-sm sm:text-base ${
              checking || userSentence.length < 3 || !selectedWord
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {checking ? `🔄 Проверяем... (${timer}сек)` : "✅ Проверить"}
          </button>
        )}

        {checkResult && (
          <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
            {checkResult.error && (
              <p className="text-red-400 text-sm sm:text-base">{checkResult.error}</p>
            )}

            {!checkResult.error && (
              <>
                <p className="text-white text-base sm:text-lg mb-2">
                  {checkResult.correct ? "✅ Правильно!" : "❌ Есть ошибки"}
                </p>

                {checkResult.feedback && (
                  <p className="text-gray-300 mb-2 text-sm sm:text-base">{checkResult.feedback}</p>
                )}

                {checkResult.correctedSentence && !checkResult.correct && (
                  <p className="text-green-400 italic text-sm sm:text-base">
                    💡 Исправление: {checkResult.correctedSentence}
                  </p>
                )}

                {checkResult.correctedTranslation && (
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">
                    📖 Перевод: {checkResult.correctedTranslation}
                  </p>
                )}
              </>
            )}

            <button
              onClick={next}
              className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
            >
              {currentIndex < availableWords.length - 1 ? "Следующее слово →" : "Завершить"}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-1 w-full py-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}