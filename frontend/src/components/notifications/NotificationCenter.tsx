 
import { X, Check, Trash } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationCenter({ onClose }: { onClose?: () => void }) {
  const { notifications, markAllRead, markRead, removeNotification } = useNotifications();

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-auto">
        {notifications.length === 0 && (
          <div className="p-4 text-sm text-slate-500">No notifications</div>
        )}

        {notifications.map((n) => (
          <div key={n.id} className={`px-4 py-3 border-b border-slate-100 ${n.read ? 'bg-white' : 'bg-slate-50'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-slate-900">{n.title}</div>
                {n.body && <div className="text-xs text-slate-600 mt-1">{n.body}</div>}
                <div className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    <Check className="w-4 h-4 inline" />
                    <span className="ml-1">Mark</span>
                  </button>
                )}
                <button onClick={() => removeNotification(n.id)} className="text-xs text-red-600 hover:underline">
                  <Trash className="w-4 h-4 inline" />
                  <span className="ml-1">Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-slate-50 text-xs text-slate-600">Tip: Notifications may include links to content.</div>
    </div>
  );
}
