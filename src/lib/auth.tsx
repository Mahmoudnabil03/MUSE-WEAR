"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type User = { id: string; name: string; email: string; role: "customer" | "employee" | "admin"; createdAt: string };
type AuthResult = { ok: boolean; error?: string };
type AuthContextValue = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<AuthResult>; signup: (name: string, email: string, password: string) => Promise<AuthResult>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(value: Record<string, string | undefined> | null): User | null {
  if (!value) return null;
  return { id: value.id!, name: value.full_name!, email: value.email!, role: value.role as User["role"], createdAt: value.created_at || new Date().toISOString() };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/auth/me").then((res) => res.json()).then((data) => setUser(mapUser(data.user))).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const login = async (email: string, password: string) => { const res = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) }); const data = await res.json(); if (!res.ok) return { ok: false, error: data.error }; setUser(mapUser(data.user)); return { ok: true }; };
  const signup = async (name: string, email: string, password: string) => { const res = await fetch("/api/auth/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fullName: name, email, password }) }); const data = await res.json(); if (!res.ok) return { ok: false, error: data.error }; setUser(mapUser(data.user)); return { ok: true }; };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error("useAuth outside provider"); return context; };
