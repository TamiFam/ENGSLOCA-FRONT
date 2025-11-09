import { useState, useEffect } from "react";
import { fetchAllWeekWords } from "../words/wordsAPI";

export default function TestModal({ 
  isOpen, 
  onClose, 
  currentWeek, 
  onTestComplete,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [testStage, setTestStage] = useState('config');
  const [testConfig, setTestConfig] = useState({
    week: currentWeek,
    wordsCount: 25,
  });
  const [weekWords, setWeekWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    if (isOpen) {
      console.log("Открываем модалку, загружаем слова для недели:", currentWeek);
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
      console.error('Ошибка загрузки слов:', error);
      setWeekWords([]);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setTestStage('config');
    setCurrentTest(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTestResults(null);
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
    const availableWords = [...weekWords];
    const shuffled = availableWords.sort(() => Math.random() - 0.5);
    const testWords = shuffled.slice(0, Math.min(testConfig.wordsCount, availableWords.length));
    
    const test = {
      id: Date.now(),
      week: currentWeek,
      words: testWords,
      totalQuestions: testWords.length,
      createdAt: new Date().toISOString()
    };
    
    setCurrentTest(test);
    setTestStage('testing');
    setUserAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (wordId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [wordId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentTest.words.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
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
      testedWeek: currentTest.week
    };

    currentTest.words.forEach(word => {
      const userAnswer = userAnswers[word._id] || '';
      const normalizedUserAnswer = userAnswer.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedCorrectAnswer = word.word.toLowerCase().replace(/\s+/g, ' ').trim();
      
      const isExactCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      const isTolerantCorrect = checkWithTolerance(normalizedUserAnswer, normalizedCorrectAnswer);
      
      let resultType = 'incorrect';
      if (isExactCorrect) {
        resultType = 'exact';
        results.correct++;
        results.correctWithTolerance++;
      } else if (isTolerantCorrect) {
        resultType = 'tolerant';
        results.correctWithTolerance++;
      } else {
        results.incorrect++;
      }
      results.tolerantPercentage = Math.round((results.correctWithTolerance / results.total) * 100);

      results.details.push({
        english: word.word,
        russian: word.translation,
        userAnswer,
        resultType,
        isCorrect: isExactCorrect || isTolerantCorrect
      });
    });

    setTestResults(results);
    setTestStage('results');
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
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
          <h2 className="text-2xl font-bold text-white">
            {testStage === 'config' && 'Настройка теста'}
            {testStage === 'testing' && `Тест недели ${testConfig.week}`}
            {testStage === 'results' && 'Результаты теста'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-900">
          {testStage === 'config' && (
            <div className="space-y-8">
              {/* Отображение недели */}
              <div className="flex justify-center">
                <span className="inline-flex items-center px-5 py-2 rounded-full bg-blue-900/50 text-blue-300 text-xl font-semibold border border-blue-700">
                  Неделя {currentWeek}
                  <span className="ml-2 bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-base font-medium border border-green-700">
                    текущая
                  </span>
                </span>
              </div>

              {/* Количество слов */}
              <div>
                <label className="block text-lg font-medium text-gray-200 mb-3 text-center">
                  Количество слов в тесте
                </label>
                <select
                  value={testConfig.wordsCount}
                  onChange={(e) =>
                    setTestConfig((prev) => ({
                      ...prev,
                      wordsCount: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-lg bg-gray-800"
                >
                  {[1, 25, 50, 75].map((num) => (
                    <option key={num} value={num} className="bg-gray-800">
                      {num} слов
                    </option>
                  ))}
                </select>
                
                {loading ? (
                  <p className="text-sm text-gray-400 mt-1">
                    Загрузка слов недели {currentWeek}...
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">
                    Доступно слов в неделе - {weekWords.length}
                  </p>
                )}
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">Как работает тест:</h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Вам показываются английские слова</li>
                  <li>• Вы вводите перевод на русский</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={generateTest}
                  disabled={weekWords.length === 0 || loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed border border-green-500 hover:border-green-400"
                >
                  {loading ? 'Загрузка...' : 
                   weekWords.length === 0 ? 'Нет слов для теста' : 'Начать тест'}
                </button>
              </div>
            </div>
          )}

          {/* Этап тестирования */}
          {testStage === 'testing' && currentTest && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-semibold text-white">
                  Вопрос {currentQuestionIndex + 1} из {currentTest.totalQuestions}
                </div>
                <div className="text-sm text-gray-400">
                  Неделя {currentWeek}
                </div>
              </div>

              <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-400 mb-2">Переведите на английский:</div>
                <div className="text-3xl font-bold text-white mb-6">
                  {currentTest.words[currentQuestionIndex].translation}
                </div>
                
                <input
                  type="text"
                  value={userAnswers[currentTest.words[currentQuestionIndex]._id] || ''}
                  onChange={(e) => handleAnswer(currentTest.words[currentQuestionIndex]._id, e.target.value)}
                  placeholder="Введите перевод..."
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg bg-gray-800 text-white placeholder-gray-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
                >
                  Назад
                </button>
                
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 border border-blue-500 hover:border-blue-400"
                >
                  {currentQuestionIndex === currentTest.words.length - 1 ? 'Завершить тест' : 'Далее'}
                </button>
              </div>
            </div>
          )}

          {/* Этап результатов */}
          {testStage === 'results' && testResults && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {testResults.correctWithTolerance === testResults.total ? '🎉' : 
                   testResults.correctWithTolerance >= testResults.total * 0.7 ? '👍' : '😔'}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">
                  Тест завершен!
                </h3>
                <p className="text-gray-400">
                  Неделя {testConfig.week} • {testResults.total} слов
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-300">{testResults.correct}</div>
                  <div className="text-sm text-green-400">Точно</div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-300">
                    {testResults.correctWithTolerance - testResults.correct}
                  </div>
                  <div className="text-sm text-yellow-400">С ошибкой</div>
                </div>
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-300">{testResults.incorrect}</div>
                  <div className="text-sm text-red-400">Неправильно</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-700">
                <h4 className="font-semibold mb-3 text-white">Детали результатов:</h4>
                <div className="space-y-2">
                  {testResults.details.map((detail, index) => (
                    <div key={index} className={`p-2 rounded border ${
                      detail.resultType === 'exact' ? 'bg-green-900/20 border-green-700' :
                      detail.resultType === 'tolerant' ? 'bg-yellow-900/20 border-yellow-700' :
                      'bg-red-900/20 border-red-700'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-300">{detail.russian}</span>
                          <span className="text-gray-500 mx-2">→</span>
                          <span className="font-medium text-white">{detail.english}</span>
                        </div>
                        <span className={`text-sm ${
                          detail.resultType === 'exact' ? 'text-green-400' :
                          detail.resultType === 'tolerant' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {detail.resultType === 'exact' ? '✓' :
                           detail.resultType === 'tolerant' ? '⚠️' : '✗'}
                        </span>
                      </div>
                      {detail.resultType !== 'exact' && (
                        <div className="text-sm text-gray-400 mt-1">
                          Ваш ответ: "<span className="text-gray-300">{detail.userAnswer || '—'}</span>"<br/>
                          {detail.resultType === 'tolerant' && (
                            <span className="text-yellow-400">Принято с небольшой ошибкой</span>
                          )}
                          {detail.resultType === 'incorrect' && (
                            <span>Правильно: "<span className="text-white">{detail.english}</span>"</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">Статистика:</h4>
                <div className="text-blue-200 text-sm">
                  <p>• Точно правильно: <strong className="text-white">{testResults.correct}</strong> слов</p>
                  <p>• С допуском ошибки: <strong className="text-white">{testResults.correctWithTolerance - testResults.correct}</strong> слов</p>
                  <p>• Всего засчитано: <strong className="text-white">{testResults.correctWithTolerance}</strong> из {testResults.total}</p>
                  <p>• Успешность: <strong className="text-white">{Math.round((testResults.correctWithTolerance / testResults.total) * 100)}%</strong></p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={restartTest}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 border border-blue-500 hover:border-blue-400"
                >
                  Пройти еще раз
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"
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