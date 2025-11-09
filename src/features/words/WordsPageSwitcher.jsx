import React from "react";

function WordsPageSwitcher({ totalPages, page, onPrev, onNext, onSelectPage }) {
  // создаём массив номеров страниц [1, 2, 3, ...]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      {totalPages > 1 && (
        <div className="mb-[45px] mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 ">
          {/* Кнопка Назад */}
          <button
            onClick={onPrev}
            disabled={page === 1}
            className="bg-white text-black border-2 border-black dark:bg-transparent dark:border-gray-300 dark:text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base 
            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 
            w-full sm:w-auto"
          >
            ← BACK
          </button>

          {/* Номера страниц */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => onSelectPage(p)}
                className={`px-4 py-2 border-2 font-bold text-sm sm:text-base transition-all duration-200
                  ${
                    p === page
                      ? "bg-black text-white border-black dark:border-gray-500"
                      : "bg-white text-black border-black hover:bg-black hover:text-white dark:border-gray-500"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Кнопка Вперёд */}
          <button
            onClick={onNext}
            disabled={page >= totalPages}
            className="bg-white text-black border-2 border-black dark:bg-transparent dark:border-gray-300 dark:text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base 
            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 
            w-full sm:w-auto"
          >
            NEXT →
          </button>
        </div>
      )}
    </>
  );
}

export default React.memo(WordsPageSwitcher);
