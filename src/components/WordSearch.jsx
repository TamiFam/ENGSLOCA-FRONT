// WordSearch.jsx
import React, { useState } from 'react';
import { searchExactWord } from '../features/words/wordsAPI';

export function WordSearch({ 
  currentWeek, 
  showToast,
  onSearchResult = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      if (showToast) showToast("Введите слово для поиска", "warning");
      onSearchResult(null);
      return;
    }
  
    setIsSearching(true);
  
    try {
      console.log('🔍 WordSearch: Ищем слово во всех неделях:', searchTerm.trim());
      
      // Важно: передаем null вместо currentWeek для поиска во всех неделях
      const res = await searchExactWord(searchTerm.trim(), null);
      
      if (res.data.found && res.data.exactMatch) {
        const foundWord = res.data.exactMatch;
        console.log('✅ WordSearch: Найдено в неделе', foundWord.week);
        
        if (showToast) {
          showToast(`✅ Найдено: "${foundWord.word}" (Неделя ${foundWord.week})`, "success");
        }
        
        onSearchResult({
          word: foundWord,
          found: true,
          query: searchTerm.trim()
        });
      } else {
        console.log('❌ WordSearch: Слово не найдено ни в одной неделе');
        if (showToast) {
          showToast(`❌ "${searchTerm.trim()}" не найдено ни в одной неделе`, "warning");
        }
        onSearchResult({
          word: null,
          found: false,
          query: searchTerm.trim()
        });
      }
    } catch (error) {
      console.error("❌ WordSearch: Ошибка поиска:", error);
      if (showToast) {
        showToast("Ошибка при поиске слова", "error");
      }
      onSearchResult(null);
    } finally {
      setIsSearching(false);
      setSearchTerm('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full sm:w-64">
      <div className="relative">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="🔍 search words "
          className="w-full p-3 pl-3 pr-4 text-base text-black dark:text-white  bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-700 transition-colors duration-300"
          type="text"
          disabled={isSearching}
        />
        
        {/* <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M21 19l-4-4m2-5C19 8.5 16.5 6 13 6S7 8.5 7 12s2.5 6 6 6c1.8 0 3.4-.7 4.7-1.8l4.3 4.3L21 19l-4-4c1-1.3 1.8-2.9 1.8-4.7zM13 14c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
        </svg> */}
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      
      {/* <div className="absolute -bottom-6 left-0 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {isSearching ? 'Ищем...' : 'Введите слово и нажмите Enter'}
      </div> */}
    </form>
  );
}