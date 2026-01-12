import { useState, useEffect } from "react";

const phrases = [
  { id: 1, ru: "Привет, как дела?", en: "Hello, how are you?" },
  { id: 2, ru: "Я люблю программировать", en: "I love programming" },
];

export default function VoiceTestModal() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSpeech, setUserSpeech] = useState("");
  const [score, setScore] = useState(0);
  const [listening, setListening] = useState(false);

  const currentPhrase = phrases[currentIndex];

  const handleStart = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Ваш браузер не поддерживает распознавание речи");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // английский
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserSpeech(transcript);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  };

  const handleCheck = () => {
    // простое сравнение (можно заменить на API перевод/сравнение)
    const correct = userSpeech.trim().toLowerCase() === currentPhrase.en.toLowerCase();
    if (correct) setScore((prev) => prev + 1);

    setUserSpeech("");
    setCurrentIndex((prev) => prev + 1);
  };

  if (currentIndex >= phrases.length) {
    return <div>Тест завершен! Ваш счет: {score}/{phrases.length}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p><strong>Скажи на английском:</strong> {currentPhrase.ru}</p>
      </div>

      <div>
        <button onClick={handleStart} disabled={listening}>
          {listening ? "Слушаю..." : "Говорю"}
        </button>
      </div>

      <div>
        <p>Вы сказали: {userSpeech}</p>
      </div>

      <div>
        <button onClick={handleCheck} disabled={!userSpeech}>
          Проверить
        </button>
      </div>
    </div>
  );
}
