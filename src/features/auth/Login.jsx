import { useState } from "react";
import { loginUser } from "./authAPI";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState(""); // 🔥 ИЗМЕНИЛ: email → username
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Login attempt:', { username, password }); // 🔥 ДОБАВИЛ лог
    
    try {
      const res = await loginUser({ username, password }); // 🔥 ИЗМЕНИЛ: email → username
      console.log('✅ Login success:', res.data);
      await login({ username, password });
      navigate("/");
    } catch (err) {
      console.error('❌ Login error:', err);
      alert("Ошибка входа: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold">Вход</h1>
      <input
        className="border p-2 w-full"
        type="text" // 🔥 ИЗМЕНИЛ: username → text
        placeholder="Имя пользователя" // 🔥 ИЗМЕНИЛ: username → Имя пользователя
        value={username} // 🔥 ИЗМЕНИЛ: email → username
        onChange={(e) => setUsername(e.target.value)} // 🔥 ИЗМЕНИЛ: setEmail → setUsername
        required
      />
      <input
        className="border p-2 w-full"
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button 
        type="submit" 
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Войти
      </button>
    </form>
  );
}