import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser as apiLogin, registerUser as apiRegister } from "../../features/auth/authAPI";

export default function AuthModal({ isOpen, onClose, onSuccess, error }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "" }); // 👈 ИЗМЕНИЛ: email → username
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setFormData({ username: "", password: "" }); // 👈 ИЗМЕНИЛ: email → username
      onSuccess();
    } catch (err) {
      console.error("Auth error:", err);
      setFormError(err.response?.data?.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
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
    setFormData({ username: "", password: "" }); // 👈 ИЗМЕНИЛ: email → username
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? "Вход в систему" : "Регистрация"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя пользователя {/* 👈 ИЗМЕНИЛ: Email → Имя пользователя */}
            </label>
            <input
              type="text" 
              name="username"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Ваше имя" 
              minLength="2" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="••••••••"
              minLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Загрузка..." : (isLogin ? "Войти" : "Зарегистрироваться")}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleSwitchMode}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium"
          >
            {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}