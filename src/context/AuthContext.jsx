// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getMe,loginUser,logoutUser  } from "../features/auth/authAPI";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
      getMe()
        .then(res => setUser(res.data))
        .catch(() => {
          setUser(null);
          
          // localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
  }, []);
  

  const login =  async (credentials) => {
    try {
      const res = await loginUser(credentials);
      setUser(res.data.user);
    } catch (err) {
      console.error("Login error", err);
      setUser(null);
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
