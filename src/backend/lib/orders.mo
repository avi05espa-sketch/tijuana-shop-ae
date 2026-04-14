import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import OrderTypes "../types/orders";

module {
  // Nanoseconds per unit for time comparisons
  let nanosecondsPerDay : Int = 86_400_000_000_000;
  let nanosecondsPerWeek : Int = 604_800_000_000_000;
  let nanosecondsPerMonth : Int = 2_592_000_000_000_000;

  func makeId(ts : Int, suffix : Nat) : Text {
    "order-" # ts.toText() # "-" # suffix.toText();
  };

  public func createOrder(
    orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
    productId : Text,
    buyerId : OrderTypes.UserId,
    sellerId : OrderTypes.UserId,
    amountMxn : Nat,
    stripePaymentIntentId : Text,
  ) : OrderTypes.Order {
    let now = Time.now();
    let id = makeId(now, orders.size());
    let order : OrderTypes.Order = {
      id;
      productId;
      buyerId;
      sellerId;
      amountMxn;
      stripePaymentIntentId;
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };
    orders.add(id, order);
    order;
  };

  public func getOrderById(
    orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
    id : OrderTypes.OrderId,
  ) : ?OrderTypes.Order {
    orders.get(id);
  };

  public func getOrdersByBuyer(
    orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
    buyerId : OrderTypes.UserId,
  ) : [OrderTypes.Order] {
    var result : [OrderTypes.Order] = [];
    for ((_, order) in orders.entries()) {
      if (order.buyerId == buyerId) {
        result := result.concat([order]);
      };
    };
    result;
  };

  public func getOrdersBySeller(
    orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
    sellerId : OrderTypes.UserId,
  ) : [OrderTypes.Order] {
    var result : [OrderTypes.Order] = [];
    for ((_, order) in orders.entries()) {
      if (order.sellerId == sellerId) {
        result := result.concat([order]);
      };
    };
    result;
  };

  public func updateOrderStatus(
    orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
    orderId : OrderTypes.OrderId,
    status : OrderTypes.OrderStatus,
  ) : OrderTypes.Order {
    let order = switch (orders.get(orderId)) {
      case (?o) { o };
      case null { Runtime.trap("Pedido no encontrado") };
    };
    let updated : OrderTypes.Order = { order with status; updatedAt = Time.now() };
    orders.add(orderId, updated);
    updated;
  };

  public func getOrderStats(
    orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
    sellerId : OrderTypes.UserId,
  ) : OrderTypes.OrderStats {
    let now = Time.now();
    var totalRevenue = 0;
    var totalOrders = 0;
    var ordersToday = 0;
    var ordersThisWeek = 0;
    var ordersThisMonth = 0;

    for ((_, order) in orders.entries()) {
      if (order.sellerId == sellerId and order.status == #completed) {
        totalRevenue += order.amountMxn;
        totalOrders += 1;
        let age = now - order.createdAt;
        if (age <= nanosecondsPerDay) { ordersToday += 1 };
        if (age <= nanosecondsPerWeek) { ordersThisWeek += 1 };
        if (age <= nanosecondsPerMonth) { ordersThisMonth += 1 };
      };
    };

    { totalRevenue; totalOrders; ordersToday; ordersThisWeek; ordersThisMonth };
  };
};
