import List "mo:core/List";
import Time "mo:core/Time";
import VTypes "../types/views";

module {
  public type ProductView = VTypes.ProductView;
  public type UserId = VTypes.UserId;

  func makeId(productId : Text, ts : Int) : Text {
    "view-" # productId # "-" # ts.toText();
  };

  public func trackView(
    productViews : List.List<ProductView>,
    productId : Text,
    viewerId : ?UserId,
  ) : ProductView {
    let now = Time.now();
    let view : ProductView = {
      id = makeId(productId, now);
      productId;
      viewerId;
      timestamp = now;
    };
    productViews.add(view);
    view;
  };

  public func getViewsByProduct(
    productViews : List.List<ProductView>,
    productId : Text,
  ) : Nat {
    productViews.filter(func(v : ProductView) : Bool {
      v.productId == productId
    }).size();
  };

  public func getViewsByProductSince(
    productViews : List.List<ProductView>,
    productId : Text,
    since : VTypes.Timestamp,
  ) : Nat {
    productViews.filter(func(v : ProductView) : Bool {
      v.productId == productId and v.timestamp >= since
    }).size();
  };
};
