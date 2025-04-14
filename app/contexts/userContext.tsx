"use client";
import { createContext, useContext, useReducer, ReactNode } from "react";

export interface User {
  username: string;
  email: string;
  role: string;
  tenant?: string;
  users: User[]
}

const UserContext = createContext<{ user: User | null; dispatch: React.Dispatch<{ type: string; payload?: User }> } | undefined>(undefined);

const userReducer = (state: User | null, action: { type: string; payload?: User }) => {
  switch (action.type) {
    case "SET_USER":
      return action.payload || null;
    case "CLEAR_USER":
      return null;
    default:
      return state;
  }
};

const initialUser: User | null = null;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, dispatch] = useReducer(userReducer, initialUser);

  return <UserContext.Provider value={{ user, dispatch }}>{children}</UserContext.Provider>;
};

// Custom hook to access the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
