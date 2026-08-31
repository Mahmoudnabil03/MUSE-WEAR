"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type User = { id: string; name: string; email: string; createdAt: string };
type StoredUser = User & { password: string };

const AuthContext = createContext<{
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
} | null>(null);

const USERS_KEY = "muse-users";
const SESSION_KEY = "muse-session";

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function saveUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try { const s = localStorage.getItem(SESSION_KEY); if (s) setUser(JSON.parse(s)); } catch {}
  }, []);

  const signup = (name: string, email: string, password: string) => {
    const norm = email.toLowerCase().trim();
    if (!name.trim()) return { ok: false, error: "Name is required" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) return { ok: false, error: "Invalid email" };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    const users = getUsers();
    if (users.find((u) => u.email === norm)) return { ok: false, error: "Email already registered" };
    const newUser: StoredUser = { id: Date.now().toString(), name: name.trim(), email: norm, password, createdAt: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    const session: User = { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  };

  const login = (email: string, password: string) => {
    const norm = email.toLowerCase().trim();
    const users = getUsers();
    const found = users.find((u) => u.email === norm);
    if (!found) return { ok: false, error: "Account not found. Please sign up." };
    if (found.password !== password) return { ok: false, error: "Incorrect password" };
    const session: User = { id: found.id, name: found.name, email: found.email, createdAt: found.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
