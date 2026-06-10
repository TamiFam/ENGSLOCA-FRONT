import axios from "../../services/axios";

// Глобальная функция для открытия модалки
let showAuthModal = () => {};

export const setAuthModalHandler = (handler) => {
  showAuthModal = handler;
};

const handleApiError = (error) => {
  console.error('API Error:', error.response?.data || error.message);
  
  // 👇 Обрабатываем ошибки авторизации
  if (error.response?.status === 401 || error.response?.status === 403) {
    showAuthModal();
    const authError = new Error('Требуется авторизация');
    authError.isAuthError = true;
    throw authError;
  }
  
  throw error;
};

export const fetchWords = async (params) => {
  try {
    const response = await axios.get("/words", { params });
    return response;
  } catch (error) {
    // 👇 Сначала проверяем авторизацию, потом другие ошибки
    if (error.response?.status === 401 || error.response?.status === 403) {
      return handleApiError(error);
    }
    
    if (error.response?.status === 404 || error.response?.status === 500) {
      return {
        data: {
          words: [],
          total: 0,
          page: 1,
          pages: 1
        }
      };
    }
    
    return handleApiError(error);
  }
};

export const fetchAllWeekWords = async (week) => {
  try {
    const response = await axios.get("/words", { 
      params: { 
        week: week,
        limit: 1000 // Большой лимит чтобы получить все слова
      } 
    });
    return response;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return handleApiError(error);
    }
    
    if (error.response?.status === 404 || error.response?.status === 500) {
      return {
        data: {
          words: [],
          week: week,
          total: 0
        }
      };
    }
    
    return handleApiError(error);
  }
};

export const createWord = async (data) => {
  try {
    const response = await axios.post("/words", data);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateWord = async (id, data) => {
  try {
    const response = await axios.put(`/words/${id}`, data);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteWord = async (id) => {
  try {
    const response = await axios.delete(`/words/${id}`);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAvailableWeeks = async () => {
  try {
    const response = await axios.get("/words/weeks");
    return response;
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        data: {
          weeks: [1]
        }
      };
    }
    return handleApiError(error);
  }
};
// wordsAPI.js - добавь эту функцию в конец файла:

export const searchExactWord = async (word, week = null) => {
  try {
    const params = { 
      search: word.trim(),
      limit: 1, // Увеличим лимит для поиска
      page: 1
    };
    
    if (week) params.week = week;
    
    console.log('🔍 searchExactWord: Параметры запроса:', params);
    
    const response = await axios.get("/words", { params });
    
    console.log('📊 searchExactWord: Ответ API:', {
      status: response.status,
      data: response.data,
      wordsCount: response.data?.words?.length || 0,
      firstWord: response.data?.words?.[0]
    });
    
    // Ищем точное совпадение
    const words = response.data?.words || [];
    const searchTerm = word.trim().toLowerCase();
    
    let exactMatch = null;
    for (const w of words) {
      if (w.word && w.word.toLowerCase() === searchTerm) {
        exactMatch = w;
        break;
      }
    }
    
    // Если не нашли точное совпадение, берем первое слово
    if (!exactMatch && words.length > 0) {
      exactMatch = words[0];
      console.log(`⚠️ Точное совпадение не найдено, берем первое: "${exactMatch.word}"`);
    }
    
    const result = {
      ...response,
      data: {
        ...response.data,
        found: !!exactMatch,
        exactMatch: exactMatch,
        message: exactMatch 
          ? `Найдено слово: "${exactMatch.word}"` 
          : `Слово "${word}" не найдено`
      }
    };
    
    console.log('✅ searchExactWord: Итоговый результат:', {
      found: result.data.found,
      exactMatch: result.data.exactMatch,
      exactMatchKeys: exactMatch ? Object.keys(exactMatch) : 'нет'
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ searchExactWord: Ошибка:', error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return handleApiError(error);
    }
    
    if (error.response?.status === 404 || error.response?.status === 500) {
      return {
        data: {
          words: [],
          found: false,
          exactMatch: null,
          message: `Слово "${word}" не найдено`
        }
      };
    }
    
    return handleApiError(error);
  }
};