import List "mo:core/List";
import Map "mo:core/Map";
import STypes "../types/saved";
import UTypes "../types/users";
import SavedLib "../lib/saved";
import UserLib "../lib/users";

mixin (
  saved : List.List<STypes.SavedProduct>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  public shared ({ caller }) func saveProduct(productId : Text) : async STypes.SavedProduct {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    SavedLib.saveProduct(saved, user.id, productId);
  };

  public shared ({ caller }) func unsaveProduct(productId : Text) : async () {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    SavedLib.unsaveProduct(saved, user.id, productId);
  };

  public shared query ({ caller }) func getMySavedProducts() : async [STypes.SavedProduct] {
    switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?user) { SavedLib.getMySaved(saved, user.id) };
      case null { [] };
    };
  };
};
