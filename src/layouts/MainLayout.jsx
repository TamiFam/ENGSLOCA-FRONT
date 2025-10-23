// layouts/MainLayout.jsx
import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Твой существующий дизайн */}
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        {/* ... твои декоративные элементы ... */}
      </div>

      {/* Грубые линии-разделители */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black"></div>
      <div className="fixed top-0 left-0 w-1 h-full bg-black"></div>
      <div className="fixed bottom-0 left-0 w-full h-2 bg-black"></div>
      <div className="fixed top-0 right-0 w-1 h-full bg-black"></div>

      {/* Хедер главной страницы */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-white border-4 border-black px-4 py-2 font-bold inline-block">
          🏠 ГЛАВНАЯ
        </div>
      </div>

      {/* Основной контент */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}