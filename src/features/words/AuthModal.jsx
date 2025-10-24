import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser as apiLogin, registerUser as apiRegister } from "../../features/auth/authAPI";

export default function AuthModal({ isOpen, onClose, onSuccess, error }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // 🔥 ДОБАВИЛ: предотвращаем всплытие
    
    setLoading(true);
    setFormError("");

    try {
      let response;
      if (isLogin) {
        response = await apiLogin(formData);
      } else {
        response = await apiRegister(formData);
      }
      
      // Сохраняем токен и пользователя
      authLogin(response.data.token, response.data.user);
      
      // Закрываем модалку и вызываем успех
      setFormData({ username: "", password: "" });
      onSuccess();
    } catch (err) {
      console.error("Auth error:", err);
      setFormError(err.response?.data?.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ДОБАВИЛ: отдельный обработчик для мобильных касаний
  const handleMobileSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(e);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setFormError("");
    setFormData({ username: "", password: "" });
  };

  // 🔥 ДОБАВИЛ: обработчик закрытия по оверлею
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick} // 🔥 ДОБАВИЛ: закрытие по клику на оверлей
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 mx-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {isLogin ? "Вход в систему" : "Регистрация"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 w-10 h-10 flex items-center justify-center" // 🔥 ДОБАВИЛ: размер для касания
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {(error || formError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error || formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"> {/* 🔥 ИЗМЕНИЛ: mb-1 → mb-2 */}
              Имя пользователя
            </label>
            <input
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
              // 🔥 ИЗМЕНИЛ: py-2 → py-3, добавил text-base для iOS
              placeholder="Ваше имя" 
              minLength="2"
              autoComplete="username" // 🔥 ДОБАВИЛ: для автозаполнения
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"> {/* 🔥 ИЗМЕНИЛ: mb-1 → mb-2 */}
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              // 🔥 ИЗМЕНИЛ: py-2 → py-3, добавил text-base для iOS
              placeholder="••••••••"
              minLength="6"
              autoComplete={isLogin ? "current-password" : "new-password"} // 🔥 ДОБАВИЛ: для автозаполнения
            />
          </div>

          <button
  type="button" // 🔥 МЕНЯЕМ на type="button"
  onClick={(e) => {
    console.log('📱 CLICK DETECTED');
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      handleSubmit(e);
    }, 50);
  }}
  onTouchStart={(e) => {
    console.log('📱 TOUCH DETECTED');
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(e);
  }}
  onTouchEnd={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      handleSubmit(e);
    }, 50);
  }}
  style={{
    minHeight: '50px',
    fontSize: '18px',
    WebkitTapHighlightColor: 'transparent'
  }}
  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0"
>
  {loading ? '⏳ Загрузка...' : (isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ')}
</button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200"> {/* 🔥 ИЗМЕНИЛ: добавил отступы и границу */}
          <button
            onClick={handleSwitchMode}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSwitchMode();
            }}
            className="w-full text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium py-2" 
            // 🔥 ДОБАВИЛ: w-full и py-2 для лучшего касания
          >
            {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </button>
          <button
  onClick={() => alert('CLICK WORKING')}
  onTouchEnd={() => alert('TOUCH WORKING')}
  style={{ padding: '20px', background: 'red', color: 'white' }}
>
  ТЕСТ КНОПКИ
</button>
        </div>
      </div>
    </div>
  );
}