import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import RTypes "../types/ratings";
import UTypes "../types/users";

module {
  public type Rating = RTypes.Rating;
  public type UserId = UTypes.UserId;

  func nextId(ratings : List.List<Rating>) : Text {
    "r-" # ratings.size().toText();
  };

  public func addRating(
    ratings : List.List<Rating>,
    fromUserId : UserId,
    toSellerId : UserId,
    productId : Text,
    score : Nat,
    comment : Text,
  ) : Rating {
    if (score < 1 or score > 5) {
      Runtime.trap("La puntuación debe estar entre 1 y 5");
    };
    let duplicate = ratings.find(func(r : Rating) : Bool {
      r.fromUserId == fromUserId and r.productId == productId
    });
    switch (duplicate) {
      case (?_) { Runtime.trap("Ya calificaste este producto") };
      case null {};
    };
    let rating : Rating = {
      id = nextId(ratings);
      fromUserId = fromUserId;
      toSellerId = toSellerId;
      productId = productId;
      score = score;
      comment = comment;
      createdAt = Time.now();
    };
    ratings.add(rating);
    rating;
  };

  public func getRatingsBySeller(
    ratings : List.List<Rating>,
    sellerId : UserId,
  ) : [Rating] {
    ratings.filter(func(r : Rating) : Bool { r.toSellerId == sellerId }).toArray();
  };

  public func getMyRatings(
    ratings : List.List<Rating>,
    userId : UserId,
  ) : [Rating] {
    ratings.filter(func(r : Rating) : Bool { r.fromUserId == userId }).toArray();
  };

  public func computeAvgRating(
    ratings : List.List<Rating>,
    sellerId : UserId,
  ) : Float {
    let sellerRatings = ratings.filter(func(r : Rating) : Bool { r.toSellerId == sellerId });
    let total = sellerRatings.size();
    if (total == 0) { return 0.0 };
    let sum = sellerRatings.foldLeft(0, func(acc, r) { acc + r.score });
    sum.toFloat() / total.toFloat();
  };
};
