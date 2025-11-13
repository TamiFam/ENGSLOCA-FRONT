import { useState, useEffect } from "react";
import { fetchAllWeekWords } from "../words/wordsAPI";

export default function TestModal({
  isOpen,
  onClose,
  currentWeek,
  onTestComplete,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [testStage, setTestStage] = useState("config");
  const [testConfig, setTestConfig] = useState({
    week: currentWeek,
  });
  const [weekWords, setWeekWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState(null);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMode, setSelectedMode] = useState("page"); // 'page' или 'all'
  const wordsPerPage = 10;

  useEffect(() => {
    if (isOpen) {
      console.log(
        "Открываем модалку, загружаем слова для недели:",
        currentWeek
      );
      loadWeekWords(currentWeek);
      resetTest();
    }
  }, [isOpen, currentWeek]);

  const loadWeekWords = async (week) => {
    setLoading(true);
    try {
      const response = await fetchAllWeekWords(week);
      setWeekWords(response.data.words || []);
    } catch (error) {
      console.error("Ошибка загрузки слов:", error);
      setWeekWords([]);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setTestStage("config");
    setCurrentTest(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTestResults(null);
    setCurrentPage(1);
    setSelectedMode("page");
  };

  // Пагинация - разбиваем слова на страницы по 10
  const totalPages = Math.ceil(weekWords.length / wordsPerPage);

  const getCurrentPageWords = () => {
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    return weekWords.slice(startIndex, endIndex);
  };

  const getAllWords = () => {
    return weekWords;
  };

  const getTestWords = () => {
    return selectedMode === "all" ? getAllWords() : getCurrentPageWords();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedMode("page");
  };

  const handleSelectAllWords = () => {
    setSelectedMode("all");
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
      resetTest();
    }, 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const generateTest = () => {
    // Берем слова в зависимости от выбранного режима
    const testWords = getTestWords();

    const test = {
      id: Date.now(),
      week: currentWeek,
      words: testWords,
      totalQuestions: testWords.length,
      createdAt: new Date().toISOString(),
      page: selectedMode === "all" ? "all" : currentPage,
      mode: selectedMode,
    };

    setCurrentTest(test);
    setTestStage("testing");
    setUserAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (wordId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [wordId]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentTest.words.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const results = {
      total: currentTest.words.length,
      correct: 0,
      correctWithTolerance: 0,
      incorrect: 0,
      details: [],
      testedWeek: currentTest.week,
      page: currentTest.page,
      mode: currentTest.mode,
    };

    currentTest.words.forEach((word) => {
      const userAnswer = userAnswers[word._id] || "";
      const normalizedUserAnswer = userAnswer
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      const normalizedCorrectAnswer = word.word
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      const isExactCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      const isTolerantCorrect = checkWithTolerance(
        normalizedUserAnswer,
        normalizedCorrectAnswer
      );

      let resultType = "incorrect";
      if (isExactCorrect) {
        resultType = "exact";
        results.correct++;
        results.correctWithTolerance++;
      } else if (isTolerantCorrect) {
        resultType = "tolerant";
        results.correctWithTolerance++;
      } else {
        results.incorrect++;
      }

      results.details.push({
        english: word.word,
        russian: word.translation,
        userAnswer,
        resultType,
        isCorrect: isExactCorrect || isTolerantCorrect,
      });
    });

    setTestResults(results);
    setTestStage("results");
    onTestComplete?.(results, currentTest.week);
  };

  const checkWithTolerance = (userAnswer, correctAnswer) => {
    if (userAnswer === correctAnswer) return true;
    if (userAnswer.length === 0) return false;

    const distance = calculateLevenshteinDistance(userAnswer, correctAnswer);
    const maxAllowedErrors = Math.max(1, Math.floor(correctAnswer.length / 5));

    return distance <= maxAllowedErrors;
  };

  const calculateLevenshteinDistance = (a, b) => {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  const restartTest = () => {
    resetTest();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 transition-all duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transition-all duration-200 ${
          isClosing ? "scale-95 translate-y-4" : "scale-100 translate-y-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 bg-gray-800">
          {/* Невидимый элемент для балансировки */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 opacity-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Заголовок по центру */}
          <h2 className="text-lg sm:text-xl font-bold text-white text-center flex-1 mx-2">
            {testStage === "config" && `Неделя ${currentWeek}`}
            {testStage === "testing" &&
              `Тест - ${
                selectedMode === "all" ? "Все слова" : `Стр. ${currentPage}`
              }`}
            {testStage === "results" && "Результаты"}
          </h2>

          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="p-1 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex-shrink-0"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Контент */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)] bg-gray-900">
          {testStage === "config" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Отображение недели */}

              {/* Статистика - компактная для мобильных */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Всего слов
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-white">
                      {weekWords.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      На странице
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-blue-400">
                      {getCurrentPageWords().length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Страниц</p>
                    <p className="text-lg sm:text-xl font-bold text-green-400">
                      {totalPages}
                    </p>
                  </div>
                </div>
              </div>

              {/* Выбор режима тестирования */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 text-center">
                  Выберите слова для теста
                </h3>

                {/* Кнопка "Все слова" */}
                <div className="mb-4">
                  <button
                    onClick={handleSelectAllWords}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedMode === "all"
                        ? "bg-green-900/30 border-green-500 text-green-300"
                        : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-semibold text-sm sm:text-base">
                          Все слова
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Все {weekWords.length} слов недели
                        </div>
                      </div>
                      {selectedMode === "all" && (
                        <div className="bg-green-500 rounded-full p-1">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Разделитель */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gray-800 px-2 text-sm text-gray-400">
                      или выберите страницу
                    </span>
                  </div>
                </div>

                {/* Выбор страницы - в виде кликабельных карточек */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedMode === "page" && currentPage === page
                            ? "bg-blue-900/30 border-blue-500 text-blue-300"
                            : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold text-sm sm:text-base">
                            {page}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            слов:{" "}
                            {page === totalPages
                              ? weekWords.length % wordsPerPage || wordsPerPage
                              : wordsPerPage}
                          </div>
                        </div>
                        {selectedMode === "page" && currentPage === page && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  )}
                </div>

                {/* Навигация по страницам для мобильных */}
                {totalPages > 5 && (
                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex-1 px-3 py-2 text-xs bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      ←
                    </button>
                    <div className="text-sm text-gray-300">
                      {currentPage} / {totalPages}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex-1 px-3 py-2 text-xs bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>

              {/* Превью выбранных слов */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                <h4 className="text-sm font-semibold text-white mb-2 text-center">
                  {selectedMode === "all"
                    ? `Все слова (${weekWords.length})`
                    : `Страница ${currentPage} (${
                        getCurrentPageWords().length
                      } слов)`}
                </h4>
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {(selectedMode === "all"
                    ? weekWords.slice(0, 10)
                    : getCurrentPageWords()
                  ).map((word, index) => (
                    <div
                      key={word._id}
                      className="p-2 rounded-lg bg-gray-700/50 border border-gray-600"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">
                            {word.word}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {word.translation}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          #
                          {selectedMode === "all"
                            ? index + 1
                            : (currentPage - 1) * wordsPerPage + index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedMode === "all" && weekWords.length > 10 && (
                    <div className="text-center text-xs text-gray-400 py-2">
                      ... и еще {weekWords.length - 10} слов
                    </div>
                  )}
                </div>
              </div>

              {/* Инструкция - компактная */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-blue-300 mb-1 text-sm">
                  Как работает тест:
                </h3>
                <ul className="text-blue-200 text-xs space-y-0.5">
                  <li>• Выберите "Все слова" или конкретную страницу</li>
                  <li>• Тест по всем выбранным словам</li>
                  <li>• Русский → Английский перевод</li>
                </ul>
              </div>

              {/* Кнопка начала теста */}
              <div className="flex justify-center">
                <button
                  onClick={generateTest}
                  disabled={
                    weekWords.length === 0 ||
                    loading ||
                    getTestWords().length === 0
                  }
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed border border-green-500 hover:border-green-400 text-sm sm:text-base"
                >
                  {loading
                    ? "Загрузка..."
                    : weekWords.length === 0
                    ? "Нет слов для теста"
                    : selectedMode === "all"
                    ? `Тест: Все слова (${weekWords.length})`
                    : `Начать тест`}
                </button>
              </div>
            </div>
          )}

          {/* Этап тестирования - адаптивный */}
          {testStage === "testing" && currentTest && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center mb-3">
                <div className="text-base font-semibold text-white">
                  {currentQuestionIndex + 1}/{currentTest.totalQuestions}
                </div>
                <div className="text-xs text-gray-400">
                  {currentTest.mode === "all"
                    ? "Все слова"
                    : `Стр. ${currentTest.page}`}
                </div>
              </div>

              <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 sm:p-6 text-center">
                <div className="text-xs sm:text-sm text-gray-400 mb-2">
                  Переведите на английский:
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 break-words">
                  {currentTest.words[currentQuestionIndex].translation}
                </div>

                <input
                  type="text"
                  value={
                    userAnswers[currentTest.words[currentQuestionIndex]._id] ||
                    ""
                  }
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  onChange={(e) =>
                    handleAnswer(
                      currentTest.words[currentQuestionIndex]._id,
                      e.target.value
                    )
                  }
                  inputMode="text"
                  placeholder="Введите перевод..."
                  autoComplete="new-password" // Специальное значение для полного отключения
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  list="autocompleteOff" // Блокирует выпадающие подсказки
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-base sm:text-lg bg-gray-800 text-white placeholder-gray-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-between gap-2">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
                >
                  Назад
                </button>

                <button
                  onClick={nextQuestion}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 border border-blue-500 hover:border-blue-400"
                >
                  {currentQuestionIndex === currentTest.words.length - 1
                    ? "Завершить"
                    : "Далее"}
                </button>
              </div>
            </div>
          )}

          {/* Этап результатов - адаптивный */}
          {testStage === "results" && testResults && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl mb-3">
                  {testResults.correctWithTolerance === testResults.total
                    ? "🎉"
                    : testResults.correctWithTolerance >=
                      testResults.total * 0.7
                    ? "👍"
                    : "😔"}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 text-white">
                  Тест завершен!
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  {testResults.mode === "all"
                    ? "Все слова"
                    : `Стр. ${testResults.page}`}{" "}
                  • {testResults.total} слов
                </p>
              </div>

              {/* Статистика в одну строку на мобильных */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-300">
                    {testResults.correct}
                  </div>
                  <div className="text-xs sm:text-sm text-green-400">Точно</div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-300">
                    {testResults.correctWithTolerance - testResults.correct}
                  </div>
                  <div className="text-xs sm:text-sm text-yellow-400">
                    С ошибкой
                  </div>
                </div>
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-red-300">
                    {testResults.incorrect}
                  </div>
                  <div className="text-xs sm:text-sm text-red-400">Ошибки</div>
                </div>
              </div>

              {/* Детали результатов - компактные */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 max-h-40 sm:max-h-60 overflow-y-auto border border-gray-700">
                <h4 className="font-semibold mb-2 text-white text-sm sm:text-base">
                  Результаты:
                </h4>
                <div className="space-y-1">
                  {testResults.details.map((detail, index) => (
                    <div
                      key={index}
                      className={`p-1.5 rounded border text-xs ${
                        detail.resultType === "exact"
                          ? "bg-green-900/20 border-green-700"
                          : detail.resultType === "tolerant"
                          ? "bg-yellow-900/20 border-yellow-700"
                          : "bg-red-900/20 border-red-700"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-300 truncate">
                              {detail.russian}
                            </span>
                            <span className="text-gray-500">→</span>
                            <span className="text-white truncate">
                              {detail.english}
                            </span>
                          </div>
                          {detail.resultType !== "exact" && (
                            <div className="text-gray-400 mt-0.5">
                              Ваш ответ: "{detail.userAnswer || "—"}"
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-xs ml-1 flex-shrink-0 ${
                            detail.resultType === "exact"
                              ? "text-green-400"
                              : detail.resultType === "tolerant"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {detail.resultType === "exact"
                            ? "✓"
                            : detail.resultType === "tolerant"
                            ? "⚠️"
                            : "✗"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Статистика - компактная */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-blue-300 mb-1 text-sm">
                  Статистика:
                </h4>
                <div className="text-blue-200 text-xs space-y-0.5">
                  <p>
                    • Точно:{" "}
                    <strong className="text-white">
                      {testResults.correct}
                    </strong>
                  </p>
                  <p>
                    • С ошибкой:{" "}
                    <strong className="text-white">
                      {testResults.correctWithTolerance - testResults.correct}
                    </strong>
                  </p>
                  <p>
                    • Всего:{" "}
                    <strong className="text-white">
                      {testResults.correctWithTolerance}
                    </strong>
                    /{testResults.total}
                  </p>
                  <p>
                    • Успешность:{" "}
                    <strong className="text-white">
                      {Math.round(
                        (testResults.correctWithTolerance / testResults.total) *
                          100
                      )}
                      %
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-2 sm:gap-4">
                <button
                  onClick={restartTest}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 border border-blue-500 hover:border-blue-400"
                >
                  Еще раз
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
