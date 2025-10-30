
import React from "react";
 function WordsPageSwitcher({totalPages,page,onPrev,onNext}) {





return (
    <>
    {totalPages > 1 && (
              <div className=" mb-[45px]  md-8 mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <button
                  onClick={onPrev}
                  disabled={page === 1}
                  className="bg-white border-2 border-black px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all duration-200 w-full sm:w-auto"
                >
                  ← BACK
                </button>
                <span className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base border-2 border-black text-center w-full sm:w-auto">
                  PAGE {page} OF {totalPages}
                </span>
                <button
                  onClick={onNext}
                  disabled={page >= totalPages}
                  className="bg-white border-2 border-black px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all duration-200 w-full sm:w-auto"
                >
                  NEXT →
                </button>
              </div>
            )}
    </>
)
}
export default  React.memo(WordsPageSwitcher)