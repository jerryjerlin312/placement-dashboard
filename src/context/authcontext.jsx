import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "pd_users";
const CURRENT_KEY = "pd_currentUser";

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function AuthProvider({ children }) {
  // Lazy initial value: the user stays logged in after a refresh
  const [user, setUser] = useState(() => read(CURRENT_KEY, null));

  const register = ({ name, email, password, department = "", cgpa = "" }) => {
    const users = read(USERS_KEY, []);
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return { success: false, error: "An account with this email already exists." };
    }
    const newUser = { id: Date.now(), name, email, password, department, cgpa, phone: "" };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return { success: true };
  };

  const login = (email, password) => {
    const users = read(USERS_KEY, []);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, error: "Invalid email or password." };
    }
    const safeUser = { ...found };
    delete safeUser.password; // never keep the password in app state
    setUser(safeUser);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(safeUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_KEY);
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(updated));

    // Keep the saved account list in sync (without touching the password)
    const users = read(USERS_KEY, []).map((u) =>
      u.id === updated.id ? { ...u, ...updates } : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}