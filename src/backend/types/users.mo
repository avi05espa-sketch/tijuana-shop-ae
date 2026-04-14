import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type UserRole = {
    #admin;
    #vendedor;
    #comprador;
  };

  public type UserStatus = {
    #active;
    #suspended;
    #banned;
  };

  public type UserSettings = {
    privacySearchable : Bool;
    privacyShowHistory : Bool;
    themePreference : Text;
    language : Text;
    timezone : Text;
    currency : Text;
    notificationsEmail : Bool;
    notificationsPush : Bool;
  };

  public type UserProfile = {
    id : UserId;
    principal : Principal;
    name : Text;
    phone : Text;
    email : ?Text;
    role : UserRole;
    status : UserStatus;
    verified : Bool;
    createdAt : Timestamp;
    avatarUrl : ?Text;
    bio : ?Text;
    zone : ?Text;
    totalSales : Nat;
    avgRating : Float;
    dateOfBirth : ?Text;
    privacySearchable : Bool;
    privacyShowHistory : Bool;
    themePreference : Text;
    language : Text;
    timezone : Text;
    currency : Text;
    notificationsEmail : Bool;
    notificationsPush : Bool;
    // IDs of sellers this user follows as frequent clients
    frequentClients : [UserId];
  };
};
