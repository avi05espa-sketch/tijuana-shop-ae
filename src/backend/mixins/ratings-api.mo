import List "mo:core/List";
import Map "mo:core/Map";
import RTypes "../types/ratings";
import UTypes "../types/users";
import RatingLib "../lib/ratings";
import UserLib "../lib/users";

mixin (
  ratings : List.List<RTypes.Rating>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  public shared ({ caller }) func addRating(
    toSellerId : UTypes.UserId,
    productId : Text,
    score : Nat,
    comment : Text,
  ) : async RTypes.Rating {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    RatingLib.addRating(ratings, user.id, toSellerId, productId, score, comment);
  };

  public shared query func getRatingsBySeller(sellerId : UTypes.UserId) : async [RTypes.Rating] {
    RatingLib.getRatingsBySeller(ratings, sellerId);
  };

  public shared query ({ caller }) func getMyRatings() : async [RTypes.Rating] {
    switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?user) { RatingLib.getMyRatings(ratings, user.id) };
      case null { [] };
    };
  };
};
