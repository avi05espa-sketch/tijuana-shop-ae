import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { Bell, BellOff, CheckCheck, Package, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Notification } from "../backend";
import { NotificationType } from "../backend";

function timeAgo(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

function notifIcon(type: NotificationType) {
  if (type === NotificationType.newMessage)
    return (
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full shrink-0"
        style={{
          background: "rgba(0,255,255,0.12)",
          border: "1px solid rgba(0,255,255,0.25)",
        }}
      >
        <Bell className="h-3.5 w-3.5" style={{ color: "#00FFFF" }} />
      </span>
    );
  if (type === NotificationType.newProduct)
    return (
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full shrink-0"
        style={{
          background: "rgba(0,255,255,0.12)",
          border: "1px solid rgba(0,255,255,0.25)",
        }}
      >
        <ShoppingBag className="h-3.5 w-3.5" style={{ color: "#00FFFF" }} />
      </span>
    );
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full shrink-0"
      style={{
        background: "rgba(0,255,255,0.12)",
        border: "1px solid rgba(0,255,255,0.25)",
      }}
    >
      <Package className="h-3.5 w-3.5" style={{ color: "#00FFFF" }} />
    </span>
  );
}

function NotifItem({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => !notif.isRead && onRead(notif.id)}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-muted/40 focus-visible:outline-none",
        !notif.isRead && "bg-accent/5",
      )}
      data-ocid={`notif-item-${notif.id}`}
    >
      {notifIcon(notif.notificationType)}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm leading-tight",
            notif.isRead
              ? "text-muted-foreground"
              : "text-foreground font-medium",
          )}
        >
          {notif.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {notif.body}
        </p>
        <p
          className="mt-1 text-[11px]"
          style={{ color: "rgba(0,255,255,0.5)" }}
        >
          {timeAgo(notif.createdAt)}
        </p>
      </div>
      {!notif.isRead && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: "#00FFFF" }}
        />
      )}
    </button>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const { data: notifications = [] } = useMyNotifications();
  const { data: unreadCountRaw } = useUnreadNotificationCount();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = Number(unreadCountRaw ?? BigInt(0));
  const recent = notifications.slice(0, 20);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="relative" data-ocid="notification-bell">
      <button
        ref={btnRef}
        type="button"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        data-ocid="notification-bell-btn"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: "#FF3B30", color: "#fff" }}
            data-ocid="notification-unread-badge"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 flex flex-col overflow-hidden rounded-xl shadow-2xl"
          style={{
            width: 340,
            maxHeight: 480,
            background: "#0e0e0e",
            border: "1.5px solid rgba(0,255,255,0.3)",
            boxShadow:
              "0 0 30px rgba(0,255,255,0.1), 0 8px 40px rgba(0,0,0,0.8)",
            zIndex: 60,
          }}
          data-ocid="notification-panel"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              borderBottom: "1px solid rgba(0,255,255,0.15)",
              background: "rgba(0,255,255,0.04)",
            }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "#00FFFF", fontFamily: "var(--font-display)" }}
            >
              Notificaciones
              {unreadCount > 0 && (
                <span
                  className="ml-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{
                    background: "rgba(255,59,48,0.2)",
                    color: "#FF3B30",
                    border: "1px solid rgba(255,59,48,0.4)",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "rgba(0,255,255,0.6)" }}
                data-ocid="notification-mark-all-read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            <div className="divide-y divide-white/5">
              {recent.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-12 px-4"
                  data-ocid="notification-empty-state"
                >
                  <BellOff
                    className="h-10 w-10"
                    style={{ color: "rgba(0,255,255,0.25)" }}
                  />
                  <p className="text-center text-sm text-muted-foreground">
                    No tienes notificaciones aún
                  </p>
                </div>
              ) : (
                recent.map((n) => (
                  <NotifItem
                    key={n.id}
                    notif={n}
                    onRead={(id) => markOne.mutate(id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
