import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type NotificationType = {
    #newMessage;
    #newProduct;
    #productUpdate;
  };

  public type Notification = {
    id : Text;
    userId : UserId;
    title : Text;
    body : Text;
    isRead : Bool;
    notificationType : NotificationType;
    relatedId : ?Text;
    createdAt : Timestamp;
  };
};
