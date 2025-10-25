// contexts/AppContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [weeks, setWeeks] = useState([1]);
  const [wordsVersion, setWordsVersion] = useState(0);

  const refreshWeeks = () => {
    setWordsVersion(prev => prev + 1);
  };

  return (
    <AppContext.Provider value={{ weeks, setWeeks, refreshWeeks, wordsVersion }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);