import Common "common";

module {
  public type OrderId = Text;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type OrderStatus = {
    #pending;
    #completed;
    #failed;
    #refunded;
  };

  public type Order = {
    id : OrderId;
    productId : Text;
    buyerId : UserId;
    sellerId : UserId;
    amountMxn : Nat;
    stripePaymentIntentId : Text;
    status : OrderStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type OrderStats = {
    totalRevenue : Nat;
    totalOrders : Nat;
    ordersToday : Nat;
    ordersThisWeek : Nat;
    ordersThisMonth : Nat;
  };
};
