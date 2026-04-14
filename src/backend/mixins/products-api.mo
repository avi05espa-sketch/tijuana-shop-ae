import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AuditTypes "../types/audit";
import PTypes "../types/products";
import UTypes "../types/users";
import NTypes "../types/notifications";
import ActivityTypes "../types/activity";
import ActivityLib "../lib/activity";
import AuditLib "../lib/audit";
import ProductLib "../lib/products";
import UserLib "../lib/users";
import NotifLib "../lib/notifications";

mixin (
  products : Map.Map<Text, PTypes.Product>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
  seedDone : { var value : Bool },
  activityEvents : List.List<ActivityTypes.ActivityEvent>,
  auditLogs : List.List<AuditTypes.AuditLog>,
  notifications : Map.Map<Text, NTypes.Notification>,
) {

  public shared ({ caller }) func createProduct(
    title : Text,
    description : Text,
    price : Float,
    negotiable : Bool,
    category : PTypes.ProductCategory,
    condition : PTypes.ProductCondition,
    zone : PTypes.ProductZone,
    colony : Text,
    // Each entry is either an object-storage asset hash or a legacy URL.
    // Upload via @caffeineai/object-storage StorageClient.putFile() first,
    // then pass the returned hash here.
    photos : [Text],
    whatsappContact : ?Text,
    isApartado : Bool,
  ) : async PTypes.Product {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    let product = ProductLib.createProduct(
      products, user.id, title, description, price, negotiable,
      category, condition, zone, colony, photos, whatsappContact, isApartado,
    );
    ignore ActivityLib.addEvent(activityEvents, user.id, "producto_publicado", "Producto publicado: " # title, ?product.id);
    // Notify frequent clients of this seller
    NotifLib.notifyFrequentClients(notifications, users, user.id, title, product.id);
    product;
  };

  public shared ({ caller }) func updateProduct(
    productId : Text,
    title : ?Text,
    description : ?Text,
    price : ?Float,
    negotiable : ?Bool,
    category : ?PTypes.ProductCategory,
    condition : ?PTypes.ProductCondition,
    zone : ?PTypes.ProductZone,
    colony : ?Text,
    photos : ?[Text],
    whatsappContact : ?Text,
    isApartado : ?Bool,
  ) : async PTypes.Product {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    ProductLib.updateProduct(
      products, user.id, productId, title, description, price, negotiable,
      category, condition, zone, colony, photos, whatsappContact, isApartado,
    );
  };

  public shared query func getProduct(productId : Text) : async ?PTypes.Product {
    ProductLib.getProduct(products, productId);
  };

  public shared query func listProducts(filters : PTypes.ProductFilters) : async [PTypes.Product] {
    ProductLib.listProducts(products, filters);
  };

  public shared query func getProductsByVendor(sellerId : UTypes.UserId) : async [PTypes.Product] {
    ProductLib.getProductsByVendor(products, sellerId);
  };

  public shared ({ caller }) func updateProductStatus(
    productId : Text,
    status : PTypes.ProductStatus,
  ) : async PTypes.Product {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    let adminFlag = UserLib.isAdmin(users, principalToId, caller);
    let result = ProductLib.updateProductStatus(products, user.id, adminFlag, productId, status);
    if (adminFlag) {
      let statusText = switch (status) {
        case (#active) "activo";
        case (#paused) "pausado";
        case (#hidden) "oculto";
        case (#blocked) "bloqueado";
      };
      ignore AuditLib.logAction(auditLogs, user.id, user.name, "actualizar_estado_producto",
        "Producto " # productId # " cambiado a " # statusText, ?productId);
    };
    result;
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    let adminFlag = UserLib.isAdmin(users, principalToId, caller);
    ProductLib.deleteProduct(products, user.id, adminFlag, productId);
  };

  public shared ({ caller }) func incrementProductViews(productId : Text) : async () {
    ProductLib.incrementViews(products, productId);
  };

  public shared ({ caller }) func featureProduct(
    productId : Text,
    featured : Bool,
  ) : async PTypes.Product {
    UserLib.requireAdmin(users, principalToId, caller);
    let result = ProductLib.featureProduct(products, productId, featured);
    let admin = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Admin no encontrado") };
    };
    let featuredText = if (featured) "destacado" else "no destacado";
    ignore AuditLib.logAction(auditLogs, admin.id, admin.name, "destacar_producto",
      "Producto " # productId # " marcado como " # featuredText, ?productId);
    result;
  };

  public shared ({ caller }) func seedSampleData() : async Nat {
    if (seedDone.value) { return 0 };
    seedDone.value := true;
    let productCount = ProductLib.seedSampleData(products);
    let _userCount = UserLib.seedUsers(users, principalToId);
    productCount;
  };

  /// Returns the asset IDs (hashes) stored for a product's photos.
  /// The frontend resolves these to URLs via:
  ///   StorageClient.getDirectURL(hash) from @caffeineai/object-storage
  public shared query func getProductPhotoIds(productId : Text) : async [Text] {
    switch (ProductLib.getProduct(products, productId)) {
      case (?p) { p.photos };
      case null { [] };
    };
  };
};
