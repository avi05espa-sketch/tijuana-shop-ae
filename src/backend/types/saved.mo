import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type SavedProduct = {
    userId : UserId;
    productId : Text;
    savedAt : Timestamp;
  };
};
