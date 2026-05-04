import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";
<<<<<<< HEAD
export type UserRole = string;
=======
export type UserRole = "user" | "admin";
>>>>>>> 0be0122be41c58c2752f616568afa17768dae0af

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar?: string;
  joinedDate?: string;
  address?: string;
  phone?: string;
  bio?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  uiuEmail?: string;
  uiuIdNumber?: string;
  uiuIdImage?: string;
  verificationStatus?: VerificationStatus;
  verificationNote?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (user: User): User => {
  const status =
    user.verificationStatus ?? (user.isVerified ? "verified" : "unverified");
  return {
    ...user,
    role: user.role ?? "user",
    verificationStatus: status,
    isVerified: status === "verified",
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from token on first mount
  useEffect(() => {
    const token = localStorage.getItem("unishare_access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((userData) => {
        if (userData) setUser(normalizeUser(userData));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (userData: User) => setUser(normalizeUser(userData));
  const logout = () => {
    setUser(null);
    localStorage.removeItem("unishare_access_token");
  };
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? normalizeUser({ ...prev, ...updates }) : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
