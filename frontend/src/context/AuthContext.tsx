"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type UserInfo = {
  name?: string | null;
  email?: string | null;
};

type AuthContextType = {
  token: string | null;
  setToken: (t: string | null) => void;
  user: UserInfo | null;
  setUser: (u: UserInfo | null) => void;
  logout: () => Promise<void>;
  initializing: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<UserInfo | null>(null);
  const [initializing, setInitializing] = useState(true);

  const setToken = (t: string | null) => {
    setTokenState(t);
  };

  const setUser = (u: UserInfo | null) => {
    setUserState(u);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore sign out errors
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          setUser({
            name: firebaseUser.displayName || null,
            email: firebaseUser.email || null,
          });
        } catch (err) {
          console.error("Failed to refresh ID token", err);
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, logout, initializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
