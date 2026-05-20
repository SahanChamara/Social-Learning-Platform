import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationCenter onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
