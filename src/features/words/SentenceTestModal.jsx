import { useState, useEffect } from "react";
import axiosInstance from "../../services/axios"

export default function SentenceTestModal({ words, isOpen , onClose  }) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSentence, setUserSentence] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setUserSentence("");
      setCheckResult(null);
    }
  }, [isOpen]);

  const currentWord = words[currentIndex];

  const checkSentence = async () => {
    setChecking(true);
    try {
      const response = await axiosInstance.post("/deepseek/check-sentence", {
        word: currentWord.word,
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
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserSentence("");
      setCheckResult(null);
    } else {
        onClose(); // закрываем модалку
    }
  };
  if (!isOpen) return null;

  return (
    <>
      

      {/* Модалка */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-xl border border-gray-700">

            {/* Заголовок */}
            <h2 className="text-xl font-bold text-white text-center mb-4">
              Составьте предложение
            </h2>

            {/* Слово */}
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center mb-4">
              <p className="text-gray-400 text-sm">Используйте слово:</p>
              <p className="text-2xl font-bold text-white">{currentWord.word}</p>
              <p className="text-gray-400 text-sm mt-1">{currentWord.translation}</p>
            </div>

            {/* Поле ввода */}
            <textarea
              className="w-full h-28 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 mb-4"
              placeholder="Напишите предложение на английском..."
              value={userSentence}
              onChange={(e) => setUserSentence(e.target.value)}
            />

            {/* Кнопки */}
            {!checkResult && (
              <button
                onClick={checkSentence}
                disabled={checking || userSentence.length < 3}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {checking ? "Проверяем..." : "Проверить"}
              </button>
            )}

            {/* Результат проверки */}
            {checkResult && (
              <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                {checkResult.error && <p className="text-red-400">{checkResult.error}</p>}

                {!checkResult.error && (
                  <>
                    <p className="text-white text-lg mb-2">
                      {checkResult.correct ? "✅ Правильно!" : "❌ Есть ошибки"}
                    </p>

                    {checkResult.feedback && (
                      <p className="text-gray-300 mb-2">{checkResult.feedback}</p>
                    )}

                    {checkResult.correctedSentence && (
                      <p className="text-green-400 italic">
                        💡 Исправление: {checkResult.correctedSentence}
                      </p>
                    )}
                  </>
                )}

                <button
                  onClick={next}
                  className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Далее →
                </button>
              </div>
            )}

            {/* Закрыть */}
            <button
              onClick={onClose}
              className="mt-3 w-full py-2 text-gray-400 hover:text-white"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}
