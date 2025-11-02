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