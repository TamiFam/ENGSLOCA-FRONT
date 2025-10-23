import { useState } from "react";
import { registerUser } from "./authAPI";
import { useNavigate } from " "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [username, setUsername] = useState(""); // 🔥 ИЗМЕНИЛ: email → username
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('👤 Register attempt:', { username, password }); // 🔥 ДОБАВИЛ лог
    
    try {
      const res = await registerUser({ username, password }); // 🔥 ИЗМЕНИЛ: email → username
      console.log('✅ Register success:', res.data);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      console.error('❌ Register error:', err);
      alert("Ошибка регистрации: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold">Регистрация</h1>
      <input
        className="border p-2 w-full"
        type="text"
        placeholder="Имя пользователя" // 🔥 ИЗМЕНИЛ: Email → Имя пользователя
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
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Зарегистрироваться
      </button>
    </form>
  );
}