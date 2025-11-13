// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getMe,loginUser,logoutUser  } from "../features/auth/authAPI";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await getMe();
      console.log("✅ User authenticated:", res.data); // для отладки
      setUser(res.data);
    } catch (err) {
      console.log("❌ Not authenticated:", err.message); // для отладки
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  

  const login =  async (credentials) => {
    try {
      const res = await loginUser(credentials);
      setUser(res.data.user);
      await checkAuth();
    } catch (err) {
      console.error("Login error", err);
      setUser(null);
      throw err
    }
  };

  const logout = async () => {
    await logoutUser()
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
