import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import NTypes "../types/notifications";
import UTypes "../types/users";

module {
  public type Notification = NTypes.Notification;
  public type NotificationType = NTypes.NotificationType;
  public type UserId = NTypes.UserId;

  func nextId(notifications : Map.Map<Text, Notification>) : Text {
    "notif-" # notifications.size().toText();
  };

  public func createNotification(
    notifications : Map.Map<Text, Notification>,
    userId : UserId,
    title : Text,
    body : Text,
    notificationType : NotificationType,
    relatedId : ?Text,
  ) : Notification {
    let id = nextId(notifications);
    let notif : Notification = {
      id;
      userId;
      title;
      body;
      isRead = false;
      notificationType;
      relatedId;
      createdAt = Time.now();
    };
    notifications.add(id, notif);
    notif;
  };

  public func getMyNotifications(
    notifications : Map.Map<Text, Notification>,
    userId : UserId,
  ) : [Notification] {
    notifications.values()
      .filter(func(n : Notification) : Bool { n.userId == userId })
      .toArray();
  };

  public func markRead(
    notifications : Map.Map<Text, Notification>,
    userId : UserId,
    notifId : Text,
  ) : () {
    switch (notifications.get(notifId)) {
      case (?n) {
        if (n.userId == userId) {
          notifications.add(notifId, { n with isRead = true });
        };
      };
      case null {};
    };
  };

  public func markAllRead(
    notifications : Map.Map<Text, Notification>,
    userId : UserId,
  ) : () {
    // Collect IDs to avoid mutating while iterating
    let ids = List.empty<Text>();
    for ((id, n) in notifications.entries()) {
      if (n.userId == userId and not n.isRead) {
        ids.add(id);
      };
    };
    for (id in ids.values()) {
      switch (notifications.get(id)) {
        case (?n) { notifications.add(id, { n with isRead = true }) };
        case null {};
      };
    };
  };

  public func getUnreadCount(
    notifications : Map.Map<Text, Notification>,
    userId : UserId,
  ) : Nat {
    var count = 0;
    for ((_, n) in notifications.entries()) {
      if (n.userId == userId and not n.isRead) {
        count += 1;
      };
    };
    count;
  };

  /// Notify all users who have sellerId as a frequent client
  public func notifyFrequentClients(
    notifications : Map.Map<Text, Notification>,
    users : Map.Map<UserId, UTypes.UserProfile>,
    sellerId : UserId,
    productTitle : Text,
    productId : Text,
  ) : () {
    for ((_, u) in users.entries()) {
      for (fc in u.frequentClients.vals()) {
        if (fc == sellerId) {
          ignore createNotification(
            notifications,
            u.id,
            "Nuevo producto publicado",
            "Un vendedor que sigues publicó: " # productTitle,
            #newProduct,
            ?productId,
          );
        };
      };
    };
  };
};
