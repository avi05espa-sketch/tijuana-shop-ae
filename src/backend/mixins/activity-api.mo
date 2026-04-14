import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import ActivityTypes "../types/activity";
import UTypes "../types/users";
import ActivityLib "../lib/activity";
import UserLib "../lib/users";

mixin (
  activityEvents : List.List<ActivityTypes.ActivityEvent>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  public shared query ({ caller }) func listMyActivity() : async [ActivityTypes.ActivityEvent] {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver tu actividad") };
    };
    ActivityLib.getMyActivity(activityEvents, user.id);
  };
};
