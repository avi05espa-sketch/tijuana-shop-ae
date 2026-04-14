import Common "common";

module {
  public type ProductViewId = Text;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type ProductView = {
    id : ProductViewId;
    productId : Text;
    viewerId : ?UserId;
    timestamp : Timestamp;
  };
};
