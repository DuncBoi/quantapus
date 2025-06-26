"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { AuthContextType } from "@/types/auth"
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signOut, User, onAuthStateChanged, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAOSxXEAlWwuvWqWbNCVDBSjvFepVgn8jc",
  authDomain: "auth.quantapus.com",
  projectId: "qp-auth-d9e52",
  storageBucket: "qp-auth-d9e52.firebasestorage.app",
  messagingSenderId: "119036334637",
  appId: "1:119036334637:web:ad2532ca5aeca8009d5ea4",
  measurementId: "G-B1BHF415SR",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();
const provider = new GoogleAuthProvider();

const defaultAuth: AuthContextType = {
  user: null,
  loading: false,
  login: async () => {
    throw new Error("AuthProvider not initialized");
  },
  logout: async () => {
  }
};

const AuthContext = React.createContext<AuthContextType>(defaultAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser]       = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
        return result.user;
    };
    const logout = async() => {
        await signOut(auth);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    return useContext(AuthContext);
}