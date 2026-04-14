import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Rating = {
    id : Text;
    fromUserId : UserId;
    toSellerId : UserId;
    productId : Text;
    score : Nat;
    comment : Text;
    createdAt : Timestamp;
  };
};
