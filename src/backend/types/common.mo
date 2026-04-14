module {
  public type UserId = Text;
  public type Timestamp = Int;

  public type DashboardStats = {
    totalUsers : Nat;
    totalProducts : Nat;
    totalReports : Nat;
    activeListings : Nat;
    newUsersToday : Nat;
    newProductsToday : Nat;
    blockedProducts : Nat;
    pendingReports : Nat;
  };

  public type TopProduct = {
    productId : Text;
    title : Text;
    orders : Nat;
    revenue : Nat;
    views : Nat;
  };

  public type RevenueByDay = {
    date : Text;
    revenue : Nat;
  };

  public type SellerStats = {
    totalRevenue : Nat;
    totalOrders : Nat;
    avgOrderValue : Nat;
    conversionRate : Float;
    topProducts : [TopProduct];
    revenueByDay : [RevenueByDay];
  };
};
