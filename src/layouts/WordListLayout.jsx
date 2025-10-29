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
      <div className="relative z-50">
        <Link
          to="/"
          className="absolute left-2 top-4 font-mono text-3xl px-4 py-1 tracking-widest 
             transition-transform duration-200 ease-in-out hover:scale-125"
        >
          🏠
        </Link>
      </div>

      {/* Основной контент */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
