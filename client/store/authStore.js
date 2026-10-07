import { create } from "zustand";
import { getCurrentUser } from "../services/authService";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) =>
    set({
      user,
      loading: false,
    }),

  clearUser: () =>
    set({
      user: null,
      loading: false,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  fetchCurrentUser: async () => {
    try {
      set({ loading: true });
      const data = await getCurrentUser();
      const user = data.user || data;
      set({ user, loading: false });
      return user;
    } catch (err) {
      set({ user: null, loading: false });
      return null;
    }
  },
}));

export default useAuthStore;