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
    week: currentWeek || 1,
    wordsCount: 15,
  });
  const [weekWords, setWeekWords] = useState([]);
  const [loading, setLoading] = useState(false); // ← ДОБАВИЛ loading состояние
  const [currentTest, setCurrentTest] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState(null);



  // 👇 Загружаем слова при изменении выбранной недели в настройках
  useEffect(() => {
    if (isOpen && testStage === 'config') {
      loadWeekWords(testConfig.week);
    }
  }, [testConfig.week, isOpen, testStage]);

  // 👇 Функция загрузки слов недели
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

  // Генерируем тест
  const generateTest = () => {
    const availableWords = [...weekWords];
    
    // Перемешиваем слова
    const shuffled = availableWords.sort(() => Math.random() - 0.5);
    
    // Берем нужное количество слов
    const testWords = shuffled.slice(0, Math.min(testConfig.wordsCount, availableWords.length));
    
    const test = {
      id: Date.now(),
      week: testConfig.week,
      words: testWords,
      totalQuestions: testWords.length,
      createdAt: new Date().toISOString()
    };
    
    setCurrentTest(test);
    setTestStage('testing');
    setUserAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Обработка ответа
  const handleAnswer = (wordId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [wordId]: answer
    }));
  };

  // Переход к следующему вопросу
  const nextQuestion = () => {
    if (currentQuestionIndex < currentTest.words.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  // Завершение теста и подсчет результатов
  const finishTest = () => {
    const results = {
      total: currentTest.words.length,
      correct: 0,
      correctWithTolerance: 0, // правильные с допуском
      incorrect: 0,
      details: []
    };
  
    currentTest.words.forEach(word => {
      const userAnswer = userAnswers[word._id] || '';
      
      // Нормализуем ответы
      const normalizedUserAnswer = userAnswer.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedCorrectAnswer = word.word.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Проверяем точное совпадение
      const isExactCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      
      // Проверяем с допуском одной ошибки
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
      results.tolerantPercentage =  Math.round((results.correctWithTolerance / results.total) * 100);
  
      results.details.push({
        english: word.word,
        russian: word.translation,
        userAnswer,
        resultType, // 'exact', 'tolerant', 'incorrect'
        isCorrect: isExactCorrect || isTolerantCorrect
      });
    });
  
    setTestResults(results);
    setTestStage('results');
    onTestComplete?.(results);
  };
  
  // Функция проверки с допуском одной ошибки
  const checkWithTolerance = (userAnswer, correctAnswer) => {
    if (userAnswer === correctAnswer) return true;
    
    // Если ответы полностью разные
    if (userAnswer.length === 0) return false;
    
    // Рассчитываем расстояние Левенштейна (количество изменений)
    const distance = calculateLevenshteinDistance(userAnswer, correctAnswer);
    
    // Допускаем 1 ошибку на 5 символов, но минимум 1 ошибку
    const maxAllowedErrors = Math.max(1, Math.floor(correctAnswer.length / 5));
    
    return distance <= maxAllowedErrors;
  };
  
  // Функция расчета расстояния Левенштейна
  const calculateLevenshteinDistance = (a, b) => {
    const matrix = [];
    
    // Инициализация матрицы
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Заполнение матрицы
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // замена
            matrix[i][j - 1] + 1,     // вставка
            matrix[i - 1][j] + 1      // удаление
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  };
  // Начать тест заново
  const restartTest = () => {
    resetTest();
  };

  const weeks = Array.from({ length: 10 }, (_, i) => i + 1);

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {testStage === 'config' && 'Настройка теста'}
            {testStage === 'testing' && `Тест недели ${testConfig.week}`}
            {testStage === 'results' && 'Результаты теста'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors "
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Этап настройки */}
          {testStage === 'config' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите неделю для теста
                </label>
                <select
                  value={testConfig.week}
                  onChange={(e) => setTestConfig(prev => ({ 
                    ...prev, 
                    week: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {weeks.map(week => (
                    <option key={week} value={week}>
                      Неделя {week} {week === currentWeek && "(текущая)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество слов в тесте
                </label>
                <select
                  value={testConfig.wordsCount}
                  onChange={(e) => setTestConfig(prev => ({ 
                    ...prev, 
                    wordsCount: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[25,50,75].map(num => (
                    <option key={num} value={num}>
                      {num} слов
                    </option>
                  ))}
                </select>
                
                {/* 👇 ОТОБРАЖАЕМ ИНДИКАТОР ЗАГРУЗКИ */}
                {loading ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Загрузка слов недели {testConfig.week}...
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Доступно слов в неделе {testConfig.week}: {weekWords.length}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Как работает тест:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Вам показываются английские слова</li>
                  <li>• Вы вводите перевод на русский</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={generateTest}
                  disabled={weekWords.length === 0 || loading} // ← БЛОКИРУЕМ ПРИ ЗАГРУЗКЕ
                  className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                <div className="text-lg font-semibold">
                  Вопрос {currentQuestionIndex + 1} из {currentTest.totalQuestions}
                </div>
                <div className="text-sm text-gray-500">
                  Неделя {testConfig.week}
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-500 mb-2">Переведите на английский:</div>
                <div className="text-3xl font-bold text-gray-800 mb-6">
                  {currentTest.words[currentQuestionIndex].translation}
                </div>
                
                <input
                  type="text"
                  value={userAnswers[currentTest.words[currentQuestionIndex]._id] || ''}
                  onChange={(e) => handleAnswer(currentTest.words[currentQuestionIndex]._id, e.target.value)}
                  placeholder="Введите перевод..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                  autoFocus
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Назад
                </button>
                
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      <h3 className="text-2xl font-bold mb-2">
        Тест завершен!
      </h3>
      <p className="text-gray-600">
        Неделя {testConfig.week} • {testResults.total} слов
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-800">{testResults.correct}</div>
        <div className="text-sm text-green-600">Точно</div>
      </div>
      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-yellow-800">
          {testResults.correctWithTolerance - testResults.correct}
        </div>
        <div className="text-sm text-yellow-600">С ошибкой</div>
      </div>
      <div className="bg-red-100 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-800">{testResults.incorrect}</div>
        <div className="text-sm text-red-600">Неправильно</div>
      </div>
    </div>

    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
      <h4 className="font-semibold mb-3">Детали результатов:</h4>
      <div className="space-y-2">
        {testResults.details.map((detail, index) => (
          <div key={index} className={`p-2 rounded border ${
            detail.resultType === 'exact' ? 'bg-green-50 border-green-200' :
            detail.resultType === 'tolerant' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-600">{detail.russian}</span>
                <span className="text-gray-400 mx-2">→</span>
                <span className="font-medium">{detail.english}</span>
              </div>
              <span className={`text-sm ${
                detail.resultType === 'exact' ? 'text-green-600' :
                detail.resultType === 'tolerant' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {detail.resultType === 'exact' ? '✓' :
                 detail.resultType === 'tolerant' ? '⚠️' : '✗'}
              </span>
            </div>
            {detail.resultType !== 'exact' && (
              <div className="text-sm text-gray-600 mt-1">
                Ваш ответ: "{detail.userAnswer || '—'}"<br/>
                {detail.resultType === 'tolerant' && (
                  <span className="text-yellow-600">Принято с небольшой ошибкой</span>
                )}
                {detail.resultType === 'incorrect' && (
                  <span>Правильно: "{detail.english}"</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-800 mb-2">Статистика:</h4>
      <div className="text-blue-700 text-sm">
        <p>• Точно правильно: <strong>{testResults.correct}</strong> слов</p>
        <p>• С допуском ошибки: <strong>{testResults.correctWithTolerance - testResults.correct}</strong> слов</p>
        <p>• Всего засчитано: <strong>{testResults.correctWithTolerance}</strong> из {testResults.total}</p>
        <p>• Успешность: <strong>{Math.round((testResults.correctWithTolerance / testResults.total) * 100)}%</strong></p>
      </div>
    </div>

    <div className="flex justify-center gap-4">
      <button
        onClick={restartTest}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Пройти еще раз
      </button>
      <button
        onClick={handleClose}
        className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
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