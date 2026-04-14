import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import NTypes "../types/notifications";
import UTypes "../types/users";
import NotifLib "../lib/notifications";
import UserLib "../lib/users";

mixin (
  notifications : Map.Map<Text, NTypes.Notification>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  public shared query ({ caller }) func getMyNotifications() : async [NTypes.Notification] {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver notificaciones") };
    };
    NotifLib.getMyNotifications(notifications, user.id);
  };

  public shared ({ caller }) func markNotificationRead(notifId : Text) : async () {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para marcar notificaciones") };
    };
    NotifLib.markRead(notifications, user.id, notifId);
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para marcar notificaciones") };
    };
    NotifLib.markAllRead(notifications, user.id);
  };

  public shared query ({ caller }) func getUnreadNotificationCount() : async Nat {
    switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?user) { NotifLib.getUnreadCount(notifications, user.id) };
      case null { 0 };
    };
  };

  public shared ({ caller }) func addFrequentClient(sellerId : UTypes.UserId) : async UTypes.UserProfile {
    UserLib.addFrequentClient(users, principalToId, caller, sellerId);
  };

  public shared ({ caller }) func removeFrequentClient(sellerId : UTypes.UserId) : async UTypes.UserProfile {
    UserLib.removeFrequentClient(users, principalToId, caller, sellerId);
  };
};
