import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import ChatTypes "../types/chat";
import UTypes "../types/users";
import NTypes "../types/notifications";
import ChatLib "../lib/chat";
import UserLib "../lib/users";
import NotifLib "../lib/notifications";

mixin (
  conversations : Map.Map<ChatTypes.ConversationId, ChatTypes.Conversation>,
  messages : List.List<ChatTypes.Message>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
  notifications : Map.Map<Text, NTypes.Notification>,
) {

  public shared query ({ caller }) func getMyConversations() : async [ChatTypes.Conversation] {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver tus conversaciones") };
    };
    ChatLib.getConversationsByUser(conversations, user.id);
  };

  public shared ({ caller }) func createConversation(
    sellerId : ChatTypes.UserId,
    productId : Text,
  ) : async ChatTypes.Conversation {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para iniciar una conversación") };
    };
    ChatLib.createConversation(conversations, messages, user.id, sellerId, productId);
  };

  public shared query ({ caller }) func getConversationMessages(
    conversationId : ChatTypes.ConversationId,
  ) : async [ChatTypes.Message] {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver mensajes") };
    };
    let conv = switch (ChatLib.getConversationById(conversations, conversationId)) {
      case (?c) { c };
      case null { Runtime.trap("Conversación no encontrada") };
    };
    if (user.id != conv.buyerId and user.id != conv.sellerId) {
      Runtime.trap("No tienes acceso a esta conversación");
    };
    ChatLib.getMessages(messages, conversationId);
  };

  public shared ({ caller }) func sendMessage(
    conversationId : ChatTypes.ConversationId,
    text : Text,
  ) : async ChatTypes.Message {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para enviar mensajes") };
    };
    let msg = ChatLib.sendMessage(conversations, messages, conversationId, user.id, text);
    // Notify the other participant
    switch (ChatLib.getConversationById(conversations, conversationId)) {
      case (?conv) {
        let recipientId = if (user.id == conv.buyerId) conv.sellerId else conv.buyerId;
        ignore NotifLib.createNotification(
          notifications,
          recipientId,
          "Nuevo mensaje",
          user.name # " te envió un mensaje",
          #newMessage,
          ?conversationId,
        );
      };
      case null {};
    };
    msg;
  };

  public shared query ({ caller }) func getUnreadCount() : async Nat {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver mensajes no leídos") };
    };
    ChatLib.getUnreadCount(conversations, messages, user.id);
  };

  public shared ({ caller }) func markConversationAsRead(
    conversationId : ChatTypes.ConversationId,
  ) : async () {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para marcar mensajes como leídos") };
    };
    ChatLib.markAsRead(conversations, messages, conversationId, user.id);
  };
};
