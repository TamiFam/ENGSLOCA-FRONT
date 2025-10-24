
import { Outlet, Link } from "react-router-dom";

export default function WordListLayout() {
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Твой существующий дизайн с декоративными элементами */}
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        {/* ... твои декоративные элементы ... */}
      </div>

      {/* Грубые линии-разделители */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black"></div>
      <div className="fixed top-0 left-0 w-1 h-full bg-black"></div>
      <div className="fixed bottom-0 left-0 w-full h-2 bg-black"></div>
      <div className="fixed top-0 right-0 w-1 h-full bg-black"></div>

      {/* Хедер только с возвратом на главную */}
      <div className="fixed top-4 left-4 z-50">
        <Link 
          to="/"
          className="relative bg-[#0f0f0f] text-[#0ff] font-semibold uppercase 
          tracking-widest px-6 py-2 border-2 border-[#0ff] rounded-md shadow-[0_0_8px_#0ff] hover:bg-[#0ff] hover:text-black transition-all duration-300"
        >
          🏠 НА ГЛАВНУЮ
        </Link>
      </div>

      {/* Основной контент */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}