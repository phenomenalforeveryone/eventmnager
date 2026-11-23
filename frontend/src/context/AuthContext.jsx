
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session and fetch latest user information
  const refreshUser = async () => {
    const response = await api.get("/auth/me");
    setUser(response.data.user);
    return response.data.user;
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("eventease_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch (error) {
        console.error("Session restore failed:", error.message);
        localStorage.removeItem("eventease_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password
    });

    localStorage.setItem("eventease_token", response.data.token);

    // Fetch the latest role and organizer application status
    const latestUser = await refreshUser();

    return {
      ...response.data,
      user: latestUser
    };
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password
    });

    localStorage.setItem("eventease_token", response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error.message);
    }

    localStorage.removeItem("eventease_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
