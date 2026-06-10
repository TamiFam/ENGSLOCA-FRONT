import { useState, useEffect } from "react";

const phrases = [
  { id: 1, ru: "Привет, как дела?", en: "Hello, how are you?" },
  { id: 2, ru: "Я люблю программировать", en: "I love programming" },
];

export default function VoiceTestModal({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSpeech, setUserSpeech] = useState("");
  const [score, setScore] = useState(0);
  const [listening, setListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentPhrase = phrases[currentIndex];

  // Сброс состояния при открытии/закрытии
  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setUserSpeech("");
      setScore(0);
      setListening(false);
      setIsFinished(false);
    }
  }, [isOpen]);

  const handleStart = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает распознавание речи");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserSpeech(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
  };

  const handleCheck = () => {
    const correct = userSpeech.trim().toLowerCase() === currentPhrase.en.toLowerCase();
    if (correct) setScore(prev => prev + 1);

    if (currentIndex + 1 >= phrases.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setUserSpeech("");
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < phrases.length) {
      setCurrentIndex(prev => prev + 1);
      setUserSpeech("");
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserSpeech("");
    setScore(0);
    setIsFinished(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Голосовой тест
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {isFinished ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
              Тест завершен!
            </h3>
            <p className="text-lg mb-6 dark:text-white">
              Ваш результат: <span className="font-bold">{score}/{phrases.length}</span>
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Пройти заново
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Скажите на английском:
              </p>
              <p className="text-lg font-bold text-black dark:text-white">
                {currentPhrase.ru}
              </p>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Правильный ответ: "{currentPhrase.en}"
              </p> */}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm dark:text-white">
                  Прогресс: {currentIndex + 1}/{phrases.length}
                </div>
                <div className="text-sm font-bold dark:text-white">
                  Счет: {score}
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={listening}
                className={`w-full py-3 rounded mb-4 font-bold ${
                  listening
                    ? "bg-yellow-500 text-black"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } transition-colors`}
              >
                {listening ? "🎤 Слушаю вашу речь..." : "🎤 Начать говорить"}
              </button>

              {userSpeech && (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-900 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Вы сказали:
                  </p>
                  <p className="text-black dark:text-white font-medium">
                    "{userSpeech}"
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCheck}
                  disabled={!userSpeech}
                  className={`flex-1 py-3 rounded font-bold ${
                    userSpeech
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  } transition-colors`}
                >
                  Проверить
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 font-bold transition-colors"
                >
                  Пропустить
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}