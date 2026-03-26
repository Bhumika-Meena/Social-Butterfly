import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, meApi, signupApi } from "../api/authApi";

export const AuthContext = createContext(null);

const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadMe() {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const me = await meApi(token);
        if (mounted) setUser(me);
      } catch (err) {
        if (mounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    loadMe();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function signup(payload) {
    const data = await signupApi(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    navigate("/social");
  }

  async function login(payload) {
    const data = await loginApi(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    navigate("/social");
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  const value = useMemo(() => {
    return {
      token,
      user,
      authLoading,
      signup,
      login,
      logout,
      isAuthed: Boolean(token),
    };
  }, [token, user, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

