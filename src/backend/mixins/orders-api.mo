import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import OrderTypes "../types/orders";
import UTypes "../types/users";
import OrderLib "../lib/orders";
import UserLib "../lib/users";

mixin (
  orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  public shared ({ caller }) func createOrder(
    productId : Text,
    sellerId : OrderTypes.UserId,
    amountMxn : Nat,
    stripePaymentIntentId : Text,
  ) : async OrderTypes.Order {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para realizar un pedido") };
    };
    OrderLib.createOrder(orders, productId, user.id, sellerId, amountMxn, stripePaymentIntentId);
  };

  public shared query ({ caller }) func getMyOrders() : async [OrderTypes.Order] {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver tus pedidos") };
    };
    OrderLib.getOrdersByBuyer(orders, user.id);
  };

  public shared query ({ caller }) func getMySellerOrders() : async [OrderTypes.Order] {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver tus ventas") };
    };
    OrderLib.getOrdersBySeller(orders, user.id);
  };

  public shared ({ caller }) func updateOrderStatus(
    orderId : OrderTypes.OrderId,
    status : OrderTypes.OrderStatus,
  ) : async OrderTypes.Order {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para actualizar un pedido") };
    };
    let order = switch (OrderLib.getOrderById(orders, orderId)) {
      case (?o) { o };
      case null { Runtime.trap("Pedido no encontrado") };
    };
    // Only the seller or admin can update order status
    let isAdmin = user.role == #admin;
    if (user.id != order.sellerId and not isAdmin) {
      Runtime.trap("Solo el vendedor o un administrador puede actualizar el estado del pedido");
    };
    OrderLib.updateOrderStatus(orders, orderId, status);
  };

  public shared query ({ caller }) func getSellerOrderStats() : async OrderTypes.OrderStats {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver tus estadísticas") };
    };
    OrderLib.getOrderStats(orders, user.id);
  };
};
