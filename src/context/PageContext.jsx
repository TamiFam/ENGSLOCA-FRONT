import { createContext, useContext, useState, useEffect } from 'react';

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("page") || "1";
  });

  // Слушаем изменения localStorage из других вкладок
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "page") {
        setCurrentPage(e.newValue || "1");
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Функция для смены страницы с событием
  const changePage = (page) => {
    const pageStr = page.toString();
    localStorage.setItem("page", pageStr);
    setCurrentPage(pageStr);
    
    // Дополнительно диспатчим кастомное событие для этой вкладки
    window.dispatchEvent(new CustomEvent('pageChanged', { 
      detail: { page: pageStr } 
    }));
  };

  return (
    <PageContext.Provider value={{ currentPage, changePage }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};