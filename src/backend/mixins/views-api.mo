import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import UTypes "../types/users";
import VTypes "../types/views";
import ViewLib "../lib/views";

mixin (
  productViews : List.List<VTypes.ProductView>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  /// Fire-and-forget view tracking — works for anonymous callers too.
  public shared ({ caller }) func trackProductView(productId : Text) : async () {
    let viewerId : ?UTypes.UserId = if (caller.isAnonymous()) {
      null;
    } else {
      principalToId.get(caller);
    };
    ignore ViewLib.trackView(productViews, productId, viewerId);
  };

  /// Returns the total number of tracked views for a product.
  public shared query func getProductViewCount(productId : Text) : async Nat {
    ViewLib.getViewsByProduct(productViews, productId);
  };
};
