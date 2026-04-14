import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import OTypes "../types/orders";
import PTypes "../types/products";
import RTypes "../types/reports";
import UTypes "../types/users";
import VTypes "../types/views";
import ReportLib "../lib/reports";
import UserLib "../lib/users";

mixin (
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
  products : Map.Map<Text, PTypes.Product>,
  reports : List.List<RTypes.Report>,
  orders : Map.Map<OTypes.OrderId, OTypes.Order>,
  productViews : List.List<VTypes.ProductView>,
) {

  public shared query ({ caller }) func getDashboardStats() : async Common.DashboardStats {
    UserLib.requireAdmin(users, principalToId, caller);
    let now = Time.now();
    let oneDayNs : Int = 86_400_000_000_000;
    let todayCutoff = now - oneDayNs;

    let totalUsers = users.size();
    let totalProducts = products.size();
    let totalReports = reports.size();

    let activeListings = products.values().filter(func(p : PTypes.Product) : Bool {
      p.status == #active
    }).size();

    let blockedProducts = products.values().filter(func(p : PTypes.Product) : Bool {
      p.status == #blocked
    }).size();

    let newUsersToday = users.values().filter(func(u : UTypes.UserProfile) : Bool {
      u.createdAt > todayCutoff
    }).size();

    let newProductsToday = products.values().filter(func(p : PTypes.Product) : Bool {
      p.createdAt > todayCutoff
    }).size();

    let pendingReports = ReportLib.countPending(reports);

    {
      totalUsers;
      totalProducts;
      totalReports;
      activeListings;
      newUsersToday;
      newProductsToday;
      blockedProducts;
      pendingReports;
    };
  };

  public shared query ({ caller }) func getSellerStats() : async Common.SellerStats {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    if (user.role != #vendedor and user.role != #admin) {
      Runtime.trap("Acceso denegado: se requiere rol de vendedor o administrador");
    };

    let sellerId = user.id;
    let now = Time.now();
    let thirtyDaysNs : Int = 30 * 86_400_000_000_000;
    let cutoff = now - thirtyDaysNs;
    let nanosecondsPerDay : Int = 86_400_000_000_000;

    // Per-product revenue and order counts
    let perProductOrders = Map.empty<Text, Nat>();
    let perProductRevenue = Map.empty<Text, Nat>();

    // Revenue by day bucket (days since epoch as Text)
    let revenueByDateMap = Map.empty<Text, Nat>();

    var totalRevenue = 0;
    var totalOrders = 0;

    for ((_, order) in orders.entries()) {
      if (order.sellerId == sellerId and order.status == #completed) {
        totalRevenue += order.amountMxn;
        totalOrders += 1;

        // Per-product
        let prevOrd = switch (perProductOrders.get(order.productId)) {
          case (?v) v; case null 0;
        };
        perProductOrders.add(order.productId, prevOrd + 1);

        let prevRev = switch (perProductRevenue.get(order.productId)) {
          case (?v) v; case null 0;
        };
        perProductRevenue.add(order.productId, prevRev + order.amountMxn);

        // Revenue by day (last 30 days)
        if (order.createdAt >= cutoff) {
          let dayBucket = (order.createdAt / nanosecondsPerDay).toText();
          let prevDayRev = switch (revenueByDateMap.get(dayBucket)) {
            case (?v) v; case null 0;
          };
          revenueByDateMap.add(dayBucket, prevDayRev + order.amountMxn);
        };
      };
    };

    let avgOrderValue : Nat = if (totalOrders == 0) 0 else totalRevenue / totalOrders;

    // Count total product views for seller's products (tracked views + legacy views field)
    var totalViews : Nat = 0;
    for ((_, p) in products.entries()) {
      if (p.sellerId == sellerId) {
        // Views tracked in the dedicated views list
        let trackedViews = productViews.filter(func(v : VTypes.ProductView) : Bool {
          v.productId == p.id
        }).size();
        totalViews += trackedViews + p.views;
      };
    };

    let conversionRate : Float = if (totalViews == 0) 0.0
    else totalOrders.toFloat() / totalViews.toFloat() * 100.0;

    // Build sorted top-5 products by revenue
    // Collect all product IDs that had completed orders
    let productIds = perProductRevenue.keys().toArray();
    // Sort by revenue descending
    let sortedIds = productIds.sort(func(a : Text, b : Text) : Order.Order {
      let ra = switch (perProductRevenue.get(a)) { case (?v) v; case null 0 };
      let rb = switch (perProductRevenue.get(b)) { case (?v) v; case null 0 };
      if (rb > ra) #less else if (rb < ra) #greater else #equal
    });

    let topCount = if (sortedIds.size() < 5) sortedIds.size() else 5;
    var topProducts : [Common.TopProduct] = [];
    var idx = 0;
    while (idx < topCount) {
      let pid = sortedIds[idx];
      let title = switch (products.get(pid)) {
        case (?p) p.title; case null pid;
      };
      let pOrders = switch (perProductOrders.get(pid)) { case (?v) v; case null 0 };
      let pRevenue = switch (perProductRevenue.get(pid)) { case (?v) v; case null 0 };
      let pViews = productViews.filter(func(v : VTypes.ProductView) : Bool {
        v.productId == pid
      }).size();
      topProducts := topProducts.concat([{
        productId = pid;
        title;
        orders = pOrders;
        revenue = pRevenue;
        views = pViews;
      }]);
      idx += 1;
    };

    // Build revenueByDay array, sorted by date bucket ascending
    let dayEntries = revenueByDateMap.entries().toArray();
    let sortedDays = dayEntries.sort(func((a : Text, _ : Nat), (b : Text, _ : Nat)) : Order.Order {
      Text.compare(a, b)
    });
    var revenueByDay : [Common.RevenueByDay] = [];
    for ((dayBucket, rev) in sortedDays.vals()) {
      revenueByDay := revenueByDay.concat([{ date = dayBucket; revenue = rev }]);
    };

    {
      totalRevenue;
      totalOrders;
      avgOrderValue;
      conversionRate;
      topProducts;
      revenueByDay;
    };
  };
};
