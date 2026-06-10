import React, { useEffect } from "react";



const WordsStats = ({ onClose, userId  }) => {
  

  // Пример с fetch
const [testResults, setTestResults] = React.useState([]);



useEffect(() => {
  console.log("userId:", userId);

 fetch(`/api/tests/${userId}`)
  .then(async (res) => {
    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    return JSON.parse(text);
  })
  .then(data => {
    console.log("PARSED DATA:", data);
    setTestResults(data.testResults || []);
  })
  .catch(err => console.error("ERROR:", err));
}, []);

const testsCount = testResults.length;
// console.log(testsCount)
console.log("RENDER testResults:", testResults);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-gray-700">
        <h2 className="font-black text-lg dark:text-white">
          📊 СТАТИСТИКА
        </h2>

        <button
          onClick={onClose}
          className="w-8 h-8 bg-red-500 text-white border-2 border-black rounded-lg hover:bg-red-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Общая статистика */}
        <div className="border-3 border-black p-4 bg-yellow-100 dark:bg-gray-700 dark:text-white">
          <h3 className="font-bold mb-3">📚 Общая информация</h3>

          <div className="space-y-2">
            <div>Всего слов: <strong>123</strong></div>
            <div>Пройдено тестов: <strong>{testsCount}</strong></div>
            <div>Средний результат: <strong>82%</strong></div>
            <div>Лучший результат: <strong>100%</strong></div>
          </div>
        </div>

        {/* Прогресс */}
        <div className="border-3 border-black p-4 bg-green-100 dark:bg-gray-700 dark:text-white">
          <h3 className="font-bold mb-3">🏆 Прогресс</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Неделя 1</span>
                <span>100%</span>
              </div>

              <div className="h-4 border-2 border-black bg-white">
                <div className="h-full w-full bg-green-500"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Неделя 2</span>
                <span>70%</span>
              </div>

              <div className="h-4 border-2 border-black bg-white">
                <div className="h-full w-[70%] bg-green-500"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Неделя 3</span>
                <span>30%</span>
              </div>

              <div className="h-4 border-2 border-black bg-white">
                <div className="h-full w-[30%] bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Достижения */}
        <div className="border-3 border-black p-4 bg-blue-100 dark:bg-gray-700 dark:text-white">
          <h3 className="font-bold mb-3">🎖 Достижения</h3>

          <div className="space-y-2">
            <div>✅ Первый тест</div>
            <div>🔥 5 тестов подряд</div>
            <div>🏆 100% результат</div>
            <div>📚 Изучено 100 слов</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordsStats;