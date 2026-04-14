import List "mo:core/List";
import Time "mo:core/Time";
import STypes "../types/saved";
import UTypes "../types/users";

module {
  public type SavedProduct = STypes.SavedProduct;
  public type UserId = UTypes.UserId;

  public func saveProduct(
    saved : List.List<SavedProduct>,
    userId : UserId,
    productId : Text,
  ) : SavedProduct {
    // Prevent duplicate saves
    let existing = saved.find(func(s : SavedProduct) : Bool {
      s.userId == userId and s.productId == productId
    });
    switch (existing) {
      case (?s) { s }; // already saved, return existing
      case null {
        let entry : SavedProduct = {
          userId = userId;
          productId = productId;
          savedAt = Time.now();
        };
        saved.add(entry);
        entry;
      };
    };
  };

  public func unsaveProduct(
    saved : List.List<SavedProduct>,
    userId : UserId,
    productId : Text,
  ) : () {
    // Filter out matching entry by rebuilding from a copy
    let toKeep = saved.filter(func(s : SavedProduct) : Bool {
      not (s.userId == userId and s.productId == productId)
    });
    saved.clear();
    saved.append(toKeep);
  };

  public func getMySaved(
    saved : List.List<SavedProduct>,
    userId : UserId,
  ) : [SavedProduct] {
    saved.filter(func(s : SavedProduct) : Bool { s.userId == userId }).toArray();
  };
};
