import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import ChatTypes "../types/chat";

module {
  // Generate a simple ID from timestamp + suffix
  func makeId(prefix : Text, ts : Int) : Text {
    prefix # "-" # ts.toText();
  };

  public func createConversation(
    conversations : Map.Map<ChatTypes.ConversationId, ChatTypes.Conversation>,
    messages : List.List<ChatTypes.Message>,
    buyerId : ChatTypes.UserId,
    sellerId : ChatTypes.UserId,
    productId : Text,
  ) : ChatTypes.Conversation {
    // Return existing conversation if one already exists for same buyer+seller+product
    var existing : ?ChatTypes.Conversation = null;
    for ((_, conv) in conversations.entries()) {
      if (conv.buyerId == buyerId and conv.sellerId == sellerId and conv.productId == productId) {
        existing := ?conv;
      };
    };
    switch (existing) {
      case (?conv) { conv };
      case null {
        let now = Time.now();
        let id = makeId("conv", now);
        let conv : ChatTypes.Conversation = {
          id;
          buyerId;
          sellerId;
          productId;
          status = #active;
          lastMessageAt = now;
          createdAt = now;
        };
        conversations.add(id, conv);
        conv;
      };
    };
  };

  public func getConversationById(
    conversations : Map.Map<ChatTypes.ConversationId, ChatTypes.Conversation>,
    id : ChatTypes.ConversationId,
  ) : ?ChatTypes.Conversation {
    conversations.get(id);
  };

  public func getConversationsByUser(
    conversations : Map.Map<ChatTypes.ConversationId, ChatTypes.Conversation>,
    userId : ChatTypes.UserId,
  ) : [ChatTypes.Conversation] {
    var result : List.List<ChatTypes.Conversation> = List.empty();
    for ((_, conv) in conversations.entries()) {
      if (conv.buyerId == userId or conv.sellerId == userId) {
        result.add(conv);
      };
    };
    result.toArray();
  };

  public func getMessages(
    messages : List.List<ChatTypes.Message>,
    conversationId : ChatTypes.ConversationId,
  ) : [ChatTypes.Message] {
    messages.filter(func(m) { m.conversationId == conversationId }).toArray();
  };

  public func sendMessage(
    conversations : Map.Map<ChatTypes.ConversationId, ChatTypes.Conversation>,
    messages : List.List<ChatTypes.Message>,
    conversationId : ChatTypes.ConversationId,
    authorId : ChatTypes.UserId,
    text : Text,
  ) : ChatTypes.Message {
    let conv = switch (conversations.get(conversationId)) {
      case (?c) { c };
      case null { Runtime.trap("Conversación no encontrada") };
    };
    // Verify author is a participant
    if (authorId != conv.buyerId and authorId != conv.sellerId) {
      Runtime.trap("No eres participante de esta conversación");
    };
    let now = Time.now();
    let msgId = makeId("msg", now) # "-" # messages.size().toText();
    let isBuyer = authorId == conv.buyerId;
    let msg : ChatTypes.Message = {
      id = msgId;
      conversationId;
      authorId;
      text;
      timestamp = now;
      readByBuyer = isBuyer;
      readBySeller = not isBuyer;
    };
    messages.add(msg);
    // Update lastMessageAt on the conversation
    let updated : ChatTypes.Conversation = { conv with lastMessageAt = now };
    conversations.add(conversationId, updated);
    msg;
  };

  public func markAsRead(
    conversations : Map.Map<ChatTypes.ConversationId, ChatTypes.Conversation>,
    messages : List.List<ChatTypes.Message>,
    conversationId : ChatTypes.ConversationId,
    userId : ChatTypes.UserId,
  ) {
    let conv = switch (conversations.get(conversationId)) {
      case (?c) { c };
      case null { Runtime.trap("Conversación no encontrada") };
    };
    let isBuyer = userId == conv.buyerId;
    let isSeller = userId == conv.sellerId;
    if (not isBuyer and not isSeller) {
      Runtime.trap("No eres participante de esta conversación");
    };
    messages.mapInPlace(func(m) {
      if (m.conversationId == conversationId) {
        if (isBuyer) { { m with readByBuyer = true } }
        else { { m with readBySeller = true } };
      } else { m };
    });
  };

  public func getUnreadCount(
    conversations : Map.Map<ChatTypes.ConversationId, ChatTypes.Conversation>,
    messages : List.List<ChatTypes.Message>,
    userId : ChatTypes.UserId,
  ) : Nat {
    // Get all conversation ids where user participates
    var count = 0;
    for ((_, conv) in conversations.entries()) {
      if (conv.buyerId == userId or conv.sellerId == userId) {
        let isBuyer = userId == conv.buyerId;
        for (msg in messages.values()) {
          if (msg.conversationId == conv.id) {
            if (isBuyer and not msg.readByBuyer) { count += 1 };
            if (not isBuyer and not msg.readBySeller) { count += 1 };
          };
        };
      };
    };
    count;
  };
};
