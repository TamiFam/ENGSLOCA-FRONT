import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGoToWords = () => {
    navigate('/words');
  };

  return (
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
      </div>

      {/* Основной контент с кнопкой перехода */}
      <div className="bg-white border-4 border-black p-6 sm:p-8 mb-8 relative">
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-black"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-black"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-black"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-black"></div>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-black mb-4">
            ДОБРО ПОЖАЛОВАТЬ В IZU4ALKA!
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            Тут мы будем изучать наши слова
          </p>
          <p className="text-gray-600 mb-4 text-lg">
            Добавлять новые и редактировать старые
          </p>
          
          <button
            onClick={handleGoToWords}
            className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-bold text-lg border-4 border-black hover:bg-white hover:text-black transition-all duration-200 inline-flex items-center gap-3 mt-4"
          >
            <span className="text-xl">📚</span>
            ПЕРЕЙТИ К СЛОВАМ
          </button>
        </div>
      </div>

      {/* Дополнительные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-blue-100 border-4 border-black p-4 sm:p-6 text-center hover:rotate-1 transition-transform duration-300">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-black text-black mb-2">ЭФФЕКТИВНО</h3>
          <p className="text-gray-700 text-sm">Систематическое изучение слов по неделям</p>
        </div>
        
        <div className="bg-green-100 border-4 border-black p-4 sm:p-6 text-center hover:-rotate-1 transition-transform duration-300">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="font-black text-black mb-2">ПРОГРЕСС</h3>
          <p className="text-gray-700 text-sm">Отслеживайте ваш прогресс в изучении</p>
        </div>
        
        <div className="bg-yellow-100 border-4 border-black p-4 sm:p-6 text-center hover:rotate-1 transition-transform duration-300">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-black text-black mb-2">СООБЩЕСТВО</h3>
          <p className="text-gray-700 text-sm">Изучайте слова вместе с другими участниками</p>
        </div>
      </div>
    </div>
  );
}