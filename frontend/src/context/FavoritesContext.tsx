import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiClient } from "../lib/apiClient";

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from backend on mount (if logged in)
  useEffect(() => {
    const token = localStorage.getItem("unishare_access_token");
    if (!token) return;
    apiClient("/favorites/")
      .then((items: { id: string }[]) => {
        setFavorites(new Set(items.map((i) => i.id)));
      })
      .catch(() => {
        /* not logged in or network error — stay empty */
      });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const token = localStorage.getItem("unishare_access_token");
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (token) {
          apiClient(`/favorites/${id}`, { method: "DELETE" }).catch(() => {});
        }
      } else {
        next.add(id);
        if (token) {
          apiClient("/favorites/", {
            method: "POST",
            data: { itemId: id },
          }).catch(() => {});
        }
      }
      return next;
    });
  }, []);

  const isFavorite = (id: string) => favorites.has(id);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
