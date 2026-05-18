import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
// TODO: Hook up server subscriptions when backend supports notifications over GraphQL
// import { useSubscription } from '@apollo/client';
// import { NOTIFICATION_SUBSCRIPTION } from '@/graphql/notifications';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  read?: boolean;
  createdAt: string;
  link?: string;
  meta?: Record<string, unknown>;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Future: listen for server notifications and append to list

  const addNotification = (n: Notification) => {
    setNotifications((prev) => [n, ...prev]);
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
