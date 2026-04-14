import Common "common";

module {
  public type ConversationId = Text;
  public type MessageId = Text;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type ConversationStatus = {
    #active;
    #archived;
  };

  public type Conversation = {
    id : ConversationId;
    buyerId : UserId;
    sellerId : UserId;
    productId : Text;
    status : ConversationStatus;
    lastMessageAt : Timestamp;
    createdAt : Timestamp;
  };

  public type Message = {
    id : MessageId;
    conversationId : ConversationId;
    authorId : UserId;
    text : Text;
    timestamp : Timestamp;
    readByBuyer : Bool;
    readBySeller : Bool;
  };
};
