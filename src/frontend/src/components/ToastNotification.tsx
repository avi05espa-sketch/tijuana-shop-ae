import { useMyNotifications } from "@/hooks/use-notifications";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Bell, Package, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Notification } from "../backend";
import { NotificationType } from "../backend";

interface ToastItem {
  id: string;
  notification: Notification;
}

function NotifToast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { notification } = item;

  const Icon =
    notification.notificationType === NotificationType.newMessage
      ? Bell
      : notification.notificationType === NotificationType.newProduct
        ? ShoppingBag
        : Package;

  return (
    <div
      className="flex items-start gap-3 rounded-xl p-4 animate-in slide-in-from-left-4 fade-in duration-300"
      style={{
        background: "rgba(14,14,14,0.97)",
        border: "1.5px solid rgba(0,255,255,0.45)",
        boxShadow: "0 0 20px rgba(0,255,255,0.15), 0 4px 24px rgba(0,0,0,0.7)",
        minWidth: 280,
        maxWidth: 320,
      }}
      data-ocid="notif-toast"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5"
        style={{
          background: "rgba(0,255,255,0.12)",
          border: "1px solid rgba(0,255,255,0.3)",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "#00FFFF" }} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold leading-tight"
          style={{ color: "#00FFFF", fontFamily: "var(--font-display)" }}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {notification.body}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Cerrar notificación"
        className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const TOAST_DURATION = 4_000;

export function ToastNotificationProvider({
  children,
}: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: notifications = [] } = useMyNotifications();

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  // On first load, seed seen ids without showing toasts
  useEffect(() => {
    if (!identity) return;
    if (!initializedRef.current && notifications.length > 0) {
      initializedRef.current = true;
      for (const n of notifications) seenIdsRef.current.add(n.id);
    }
  }, [identity, notifications]);

  // On subsequent polls, show toasts for new unread notifications
  useEffect(() => {
    if (!initializedRef.current) return;

    const newUnread = notifications.filter(
      (n) => !n.isRead && !seenIdsRef.current.has(n.id),
    );

    if (newUnread.length === 0) return;

    for (const n of newUnread) seenIdsRef.current.add(n.id);

    const newToasts: ToastItem[] = newUnread.map((n) => ({
      id: `toast-${n.id}-${Date.now()}`,
      notification: n,
    }));

    setToasts((prev) => [...prev, ...newToasts]);
  }, [notifications]);

  // Auto-dismiss toasts after TOAST_DURATION
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-20 left-4 z-[100] flex flex-col gap-2 md:bottom-6"
          data-ocid="toast-notification-container"
        >
          {toasts.map((item) => (
            <NotifToast key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </>
  );
}
