// Browser Web Notification API helper
export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showDesktopNotification = (title, body, icon = "/favicon.ico") => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        body,
        icon,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
      return notification;
    } catch (err) {
      console.debug("Notification error:", err);
    }
  }

  return null;
};
