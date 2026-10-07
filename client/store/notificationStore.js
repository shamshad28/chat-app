import { create } from "zustand";

const useNotificationStore = create((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = notification.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNotif = {
      ...notification,
      id,
      createdAt: new Date(),
    };

    set((state) => ({
      // Keep at most 3 notifications at once
      notifications: [newNotif, ...state.notifications.slice(0, 2)],
    }));

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);

    return id;
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));

export default useNotificationStore;
