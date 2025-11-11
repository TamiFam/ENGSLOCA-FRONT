import React from "react";
import { SpeakerWaveIcon } from "@heroicons/react/24/solid";

const WordCard = React.memo(
  ({
    word,
    index,
    allWordsHidden,
    onEditClick,
    onWordInfo,
    onDeleteClick,
    user,
  }) => {
    const canEdit = user && (user.role === "admin" || user.role === "member");
    const canDelete = user && user.role === "admin";

    // ✅ функция для озвучки
    const speakWord = (text) => {
      if (!window.speechSynthesis) {
        alert("Ваш браузер не поддерживает озвучку 😢");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // или "en-GB" если хочешь британский акцент
      utterance.rate = 0.9; // чуть медленнее, чтобы чётче звучало
      speechSynthesis.speak(utterance);
    };

    const isNew =
      (Date.now() - new Date(word.createdAt)) / (1000 * 60 * 60 * 24) < 1;

    // Проверяем является ли текущий пользователь автором слова
    const isAuthor = user && word.author && word.author._id === user.id;

    return (
      <div
        className={`bg-white border-4 border-black dark:bg-gray-900 dark:border-gray-600 p-4 sm:p-6 lg:p-8 hover:shadow-[4px_4px_0_0_#000] sm:hover:shadow-[8px_8px_0_0_#000] transition-all duration-300 group relative ${
          index % 2 === 0
            ? "sm:rotate-1 hover:rotate-0"
            : "sm:-rotate-1 hover:rotate-0"
        }`}
      >
        {/* Номер карточки */}
        <div
          className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-black dark:bg-gray-700  text-white flex items-center 
      justify-center text-xl sm:text-sm font-bold"
        >
          {index + 1}
        </div>

        {/* Блок автора - добавляем в верхний правый угол */}
        {word.author && (
          <div className=" absolute -top-2 -right-2 sm:-top-3 sm:-right-3 ">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full border-2 border-black text-xs font-bold  ${
                isAuthor
                  ? "bg-green-100 text-green-800"
                  : word.author.role === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              <span className="text-xs">✍️</span>

              <span className="">{word.author.username}</span>

              {/* <span className="ml-1 text-xl">★</span> */}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xl sm:text-2xl lg:text-2xl font-black wrap-break-word dark:text-white transition-all duration-500 ${
                      allWordsHidden
                        ? "filter blur-[5px] opacity-70 backdrop-blur-sm bg-white/20 rounded-lg px-2"
                        : "filter blur-0 text-black"
                    }`}
                  >
                    {word.word}
                  </span>
                  {/* ✅ кнопка озвучки */}
                  <button
                    onClick={() => speakWord(word.word)}
                    className="w-6 h-6 bg-indigo-100 text-indigo-600 border border-indigo-300 hover:bg-indigo-200 hover:text-indigo-700 hover:border-indigo-400 flex items-center justify-center rounded-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                    title="Озвучить"
                  >
                    <SpeakerWaveIcon className="w-4 h-4" />
                  </button>

                  {/* кнопка доп инфы */}
                  <button
                    onClick={() => onWordInfo(word)}
                    className="w-7 h-7 sm:w-7 sm:h-7 bg-purple-500 text-white border-2 border-black hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center shrink-0"
                    title="Детали и заметки"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3a2 2 0 00-2 2v3a2 2 0 01-2 2H4a2 2 0 100 4h1a2 2 0 012 2v3a2 2 0 002 2m6-18a2 2 0 012 2v3a2 2 0 002 2h1a2 2 0 110 4h-1a2 2 0 00-2 2v3a2 2 0 01-2 2"
                      />
                    </svg>
                  </button>
                </div>

                <span
                  className={`text-lg sm:text-lg text-gray-500 font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 self-start ${
                    allWordsHidden
                      ? "filter blur-[5px] text-gray-400"
                      : "filter blur-0 text-black"
                  }`}
                >
                  [{word.transcriptionUK}]
                </span>

                <span className="hidden sm:inline text-2xl text-gray-300">
                  —
                </span>

                <span className="text-xl sm:text-2xl font-bold lg:text-xl text-gray-800 wrap-break-words dark:text-gray-200">
                  {word.translation}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
              <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                {word.partOfSpeech}
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                {word.category}
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                WEEK {word.week}
              </span>
            </div>
          </div>

          {user && (
            <div className="flex gap-2 sm:ml-6 opacity-100 transition-opacity duration-300 self-end sm:self-start">
              <button
                onClick={() => onEditClick(word)}
                disabled={!canEdit}
                className="w-8 h-8 sm:w-8 sm:h-8 bg-blue-500 text-white border-2 border-black hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center shrink-0"
                title="Редактировать"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDeleteClick(word._id)}
                disabled={!canDelete}
                className="w-8 h-8 sm:w-8 sm:h-8 bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors duration-200 flex items-center justify-center shrink-0"
                title="Удалить"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 hover:rotate-90"
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
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center w-full justify-between mt-2">
          {isNew && (
            <span className="inline-block w-fit rounded-full bg-red-100 px-2 py-0.5 text-xs sm:text-sm font-semibold text-red-600">
              NEW
            </span>
          )}
        </div>
      </div>
    );
  }
);

export default WordCard;
