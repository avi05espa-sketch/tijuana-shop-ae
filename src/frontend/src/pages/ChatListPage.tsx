import { type Conversation, ConversationStatus } from "@/backend";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentUser,
  useMyConversations,
  useVendorProfile,
} from "@/hooks/use-backend";
import { Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "../lib/dateUtils";

// ─── Single conversation row ──────────────────────────────────────────────────
function ConversationRow({ conv }: { conv: Conversation }) {
  const { user } = useCurrentUser();
  const isbuyer = user?.id === conv.buyerId;
  const otherUserId = isbuyer ? conv.sellerId : conv.buyerId;
  const { data: otherUser } = useVendorProfile(otherUserId);

  // Unread detection: conv has messages but we optimistically show cyan border for very recent ones
  const isUnread =
    user != null &&
    conv.lastMessageAt > BigInt(0) &&
    !isbuyer &&
    conv.status === ConversationStatus.active;

  const initials = otherUser?.name
    ? otherUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Link
      to="/chat/$conversationId"
      params={{ conversationId: conv.id }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth hover:bg-card/80 relative"
      style={{
        background: "rgba(0,255,255,0.03)",
        border: "1px solid rgba(0,255,255,0.08)",
        borderLeft: isUnread
          ? "3px solid rgba(0,255,255,0.8)"
          : "1px solid rgba(0,255,255,0.08)",
      }}
      data-ocid="conversation-row"
    >
      <Avatar className="w-12 h-12 shrink-0">
        {otherUser?.avatarUrl && (
          <img src={otherUser.avatarUrl} alt={otherUser.name} />
        )}
        <AvatarFallback
          className="text-sm font-semibold"
          style={{ background: "rgba(0,255,255,0.12)", color: "#00FFFF" }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className="font-semibold text-sm text-foreground truncate"
            style={isUnread ? { color: "#00FFFF" } : {}}
          >
            {otherUser?.name ?? "Cargando…"}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {conv.lastMessageAt > BigInt(0)
              ? formatDistanceToNow(Number(conv.lastMessageAt) / 1_000_000)
              : "—"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate max-w-[90%]">
          Producto #{conv.productId.slice(0, 8)}
        </p>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChatListPage() {
  const { data: conversations = [], isLoading } = useMyConversations();
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();

  if (!isAuthenticated) {
    void navigate({ to: "/login" });
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
        <Skeleton className="h-7 w-48 mb-6" />
        {(["a", "b", "c"] as const).map((k) => (
          <Skeleton key={k} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-8 space-y-4"
      data-ocid="chat-list-page"
    >
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
        <MessageCircle className="w-6 h-6" style={{ color: "#00FFFF" }} />
        Mensajes
      </h1>

      {conversations.length === 0 ? (
        <div
          className="rounded-2xl p-14 flex flex-col items-center gap-4"
          style={{
            background: "rgba(0,255,255,0.03)",
            border: "1px solid rgba(0,255,255,0.1)",
          }}
          data-ocid="chat-empty-state"
        >
          <MessageCircle className="w-14 h-14 text-muted-foreground" />
          <p className="text-muted-foreground text-center font-medium">
            No tienes conversaciones aún.
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Contacta a un vendedor desde cualquier producto.
          </p>
          <Link
            to="/"
            className="mt-2 text-sm px-5 py-2.5 rounded-lg transition-smooth"
            style={{
              background: "rgba(0,255,255,0.1)",
              border: "1px solid rgba(0,255,255,0.3)",
              color: "#00FFFF",
            }}
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations
            .slice()
            .sort((a, b) => Number(b.lastMessageAt) - Number(a.lastMessageAt))
            .map((conv) => (
              <ConversationRow key={conv.id} conv={conv} />
            ))}
        </div>
      )}
    </div>
  );
}
