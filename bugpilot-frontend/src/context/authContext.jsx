import { createContext, useContext, useEffect, useReducer } from "react";
import { getMeApi, loginApi, logoutApi } from "../api/auth.api";

const AuthContext = createContext(null);

const initialState = {
  user:        null,
  accessToken: localStorage.getItem("accessToken") || null,
  loading:     true,
  error:       null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":    return { ...state, user: action.payload, loading: false, error: null };
    case "SET_LOADING": return { ...state, loading: action.payload };
    case "SET_ERROR":   return { ...state, error: action.payload, loading: false };
    case "LOGOUT":      return { ...initialState, loading: false, accessToken: null };
    default:            return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) { dispatch({ type: "SET_LOADING", payload: false }); return; }
      try {
        const { data } = await getMeApi();
        dispatch({ type: "SET_USER", payload: data.data });
      } catch {
        localStorage.removeItem("accessToken");
        dispatch({ type: "LOGOUT" });
      }
    };
    check();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const { data } = await loginApi(credentials);
    localStorage.setItem("accessToken", data.data.accessToken);
    dispatch({ type: "SET_USER", payload: data.data.user });
    return data.data;
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.removeItem("accessToken");
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) =>
    dispatch({ type: "SET_USER", payload: { ...state.user, ...userData } });

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};