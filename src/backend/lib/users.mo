import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/users";

module {
  public type UserProfile = Types.UserProfile;
  public type UserRole = Types.UserRole;
  public type UserStatus = Types.UserStatus;
  public type UserId = Types.UserId;
  public type UserSettings = Types.UserSettings;

  func nextId(users : Map.Map<UserId, UserProfile>) : UserId {
    users.size().toText();
  };

  func defaultProfile(
    uid : UserId,
    caller : Principal,
    name : Text,
    phone : Text,
    email : ?Text,
    avatarUrl : ?Text,
    bio : ?Text,
    zone : ?Text,
    role : UserRole,
    isFirst : Bool,
  ) : UserProfile {
    {
      id = uid;
      principal = caller;
      name = name;
      phone = phone;
      email = email;
      role = if (isFirst) #admin else (if (role == #admin) #comprador else role);
      status = #active;
      verified = false;
      createdAt = Time.now();
      avatarUrl = avatarUrl;
      bio = bio;
      zone = zone;
      totalSales = 0;
      avgRating = 0.0;
      dateOfBirth = null;
      privacySearchable = true;
      privacyShowHistory = true;
      themePreference = "dark";
      language = "es";
      timezone = "America/Tijuana";
      currency = "MXN";
      notificationsEmail = false;
      notificationsPush = false;
      frequentClients = [];
    };
  };

  public func registerUser(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
    name : Text,
    phone : Text,
    email : ?Text,
    avatarUrl : ?Text,
    bio : ?Text,
    zone : ?Text,
    role : UserRole,
  ) : UserProfile {
    switch (principalToId.get(caller)) {
      case (?_) { Runtime.trap("Ya tienes una cuenta registrada") };
      case null {};
    };
    let phoneTaken = users.any(func(_id : UserId, u : UserProfile) : Bool { u.phone == phone });
    if (phoneTaken) { Runtime.trap("Ese número de teléfono ya está registrado") };

    let isFirst = users.size() == 0;
    let uid = nextId(users);
    let profile = defaultProfile(uid, caller, name, phone, email, avatarUrl, bio, zone, role, isFirst);
    users.add(uid, profile);
    principalToId.add(caller, uid);
    profile;
  };

  public func getByPrincipal(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
  ) : ?UserProfile {
    switch (principalToId.get(caller)) {
      case (?uid) { users.get(uid) };
      case null { null };
    };
  };

  public func getById(
    users : Map.Map<UserId, UserProfile>,
    userId : UserId,
  ) : ?UserProfile {
    users.get(userId);
  };

  public func updateProfile(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
    name : ?Text,
    email : ?Text,
    avatarUrl : ?Text,
    bio : ?Text,
    zone : ?Text,
    dateOfBirth : ?Text,
    privacySearchable : ?Bool,
    privacyShowHistory : ?Bool,
    themePreference : ?Text,
    language : ?Text,
    timezone : ?Text,
    currency : ?Text,
    notificationsEmail : ?Bool,
    notificationsPush : ?Bool,
  ) : UserProfile {
    let uid = switch (principalToId.get(caller)) {
      case (?uid) { uid };
      case null { Runtime.trap("Debes registrarte primero") };
    };
    let existing = switch (users.get(uid)) {
      case (?u) { u };
      case null { Runtime.trap("Usuario no encontrado") };
    };
    let updated : UserProfile = {
      existing with
      name = switch (name) { case (?n) n; case null existing.name };
      email = switch (email) { case (?e) ?e; case null existing.email };
      avatarUrl = switch (avatarUrl) { case (?a) ?a; case null existing.avatarUrl };
      bio = switch (bio) { case (?b) ?b; case null existing.bio };
      zone = switch (zone) { case (?z) ?z; case null existing.zone };
      dateOfBirth = switch (dateOfBirth) { case (?d) ?d; case null existing.dateOfBirth };
      privacySearchable = switch (privacySearchable) { case (?v) v; case null existing.privacySearchable };
      privacyShowHistory = switch (privacyShowHistory) { case (?v) v; case null existing.privacyShowHistory };
      themePreference = switch (themePreference) { case (?v) v; case null existing.themePreference };
      language = switch (language) { case (?v) v; case null existing.language };
      timezone = switch (timezone) { case (?v) v; case null existing.timezone };
      currency = switch (currency) { case (?v) v; case null existing.currency };
      notificationsEmail = switch (notificationsEmail) { case (?v) v; case null existing.notificationsEmail };
      notificationsPush = switch (notificationsPush) { case (?v) v; case null existing.notificationsPush };
    };
    users.add(uid, updated);
    updated;
  };

  public func updateSettings(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
    settings : UserSettings,
  ) : UserProfile {
    let uid = switch (principalToId.get(caller)) {
      case (?uid) { uid };
      case null { Runtime.trap("Debes registrarte primero") };
    };
    let existing = switch (users.get(uid)) {
      case (?u) { u };
      case null { Runtime.trap("Usuario no encontrado") };
    };
    let updated : UserProfile = {
      existing with
      privacySearchable = settings.privacySearchable;
      privacyShowHistory = settings.privacyShowHistory;
      themePreference = settings.themePreference;
      language = settings.language;
      timezone = settings.timezone;
      currency = settings.currency;
      notificationsEmail = settings.notificationsEmail;
      notificationsPush = settings.notificationsPush;
    };
    users.add(uid, updated);
    updated;
  };

  public func listUsers(
    users : Map.Map<UserId, UserProfile>,
  ) : [UserProfile] {
    users.values().toArray();
  };

  public func updateUserStatus(
    users : Map.Map<UserId, UserProfile>,
    targetId : UserId,
    status : UserStatus,
  ) : UserProfile {
    let existing = switch (users.get(targetId)) {
      case (?u) { u };
      case null { Runtime.trap("Usuario no encontrado") };
    };
    let updated : UserProfile = { existing with status = status };
    users.add(targetId, updated);
    updated;
  };

  public func verifyUser(
    users : Map.Map<UserId, UserProfile>,
    targetId : UserId,
  ) : UserProfile {
    let existing = switch (users.get(targetId)) {
      case (?u) { u };
      case null { Runtime.trap("Usuario no encontrado") };
    };
    let updated : UserProfile = { existing with verified = true };
    users.add(targetId, updated);
    updated;
  };

  public func deleteUser(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    targetId : UserId,
  ) : () {
    let existing = switch (users.get(targetId)) {
      case (?u) { u };
      case null { Runtime.trap("Usuario no encontrado") };
    };
    users.remove(targetId);
    principalToId.remove(existing.principal);
  };

  public func isAdmin(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
  ) : Bool {
    switch (principalToId.get(caller)) {
      case (?uid) {
        switch (users.get(uid)) {
          case (?u) { u.role == #admin };
          case null { false };
        };
      };
      case null { false };
    };
  };

  public func requireAdmin(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
  ) : () {
    if (not isAdmin(users, principalToId, caller)) {
      Runtime.trap("Acceso denegado: se requieren permisos de administrador");
    };
  };

  public func requireRegistered(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
  ) : UserProfile {
    switch (getByPrincipal(users, principalToId, caller)) {
      case (?u) {
        if (u.status == #banned) {
          Runtime.trap("Tu cuenta ha sido suspendida permanentemente");
        };
        if (u.status == #suspended) {
          Runtime.trap("Tu cuenta está suspendida temporalmente");
        };
        u;
      };
      case null { Runtime.trap("Debes registrarte para realizar esta acción") };
    };
  };

  public func addFrequentClient(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
    sellerId : UserId,
  ) : UserProfile {
    let uid = switch (principalToId.get(caller)) {
      case (?uid) { uid };
      case null { Runtime.trap("Debes registrarte primero") };
    };
    let existing = switch (users.get(uid)) {
      case (?u) { u };
      case null { Runtime.trap("Usuario no encontrado") };
    };
    // Avoid duplicates
    let alreadyAdded = existing.frequentClients.any(func(fc : UserId) : Bool { fc == sellerId });
    if (alreadyAdded) { return existing };
    let updated : UserProfile = {
      existing with
      frequentClients = existing.frequentClients.concat([sellerId]);
    };
    users.add(uid, updated);
    updated;
  };

  public func removeFrequentClient(
    users : Map.Map<UserId, UserProfile>,
    principalToId : Map.Map<Principal, UserId>,
    caller : Principal,
    sellerId : UserId,
  ) : UserProfile {
    let uid = switch (principalToId.get(caller)) {
      case (?uid) { uid };
      case null { Runtime.trap("Debes registrarte primero") };
    };
    let existing = switch (users.get(uid)) {
      case (?u) { u };
      case null { Runtime.trap("Usuario no encontrado") };
    };
    let updated : UserProfile = {
      existing with
      frequentClients = existing.frequentClients.filter(func(fc : UserId) : Bool { fc != sellerId });
    };
    users.add(uid, updated);
    updated;
  };

  public func seedUsers(
    users : Map.Map<UserId, UserProfile>,
    _principalToId : Map.Map<Principal, UserId>,
  ) : Nat {
    let fakePrincipal = Principal.fromText("aaaaa-aa");
    type SeedUser = (UserId, Text, Text, ?Text, UserRole, ?Text, Float, Nat);
    let samples : [SeedUser] = [
      ("admin-seed-001", "Admin Tijuana Shop", "6641000000", ?"admin@tijuanashop.ae", #admin, ?"Centro", 5.0, 0),
      ("vendor-seed-001", "Carlos Mendoza", "6641111111", ?"carlos@email.com", #vendedor, ?"Playas de Tijuana", 4.7, 24),
      ("vendor-seed-002", "Ana García", "6642222222", ?"ana@email.com", #vendedor, ?"Zona Río", 4.5, 18),
      ("buyer-seed-001", "Luis Torres", "6643333333", ?"luis@email.com", #comprador, ?"Otay", 0.0, 0),
      ("buyer-seed-002", "María López", "6644444444", ?"maria@email.com", #comprador, ?"Corredor 2000", 0.0, 0),
    ];

    var count = 0;
    for ((uid, name, phone, email, role, zone, avgRating, totalSales) in samples.vals()) {
      if (users.get(uid) == null) {
        let profile : UserProfile = {
          id = uid;
          principal = fakePrincipal;
          name = name;
          phone = phone;
          email = email;
          role = role;
          status = #active;
          verified = role == #vendedor or role == #admin;
          createdAt = Time.now();
          avatarUrl = ?("https://ui-avatars.com/api/?name=" # name # "&background=00FFFF&color=0a0a0a");
          bio = switch (role) {
            case (#admin) { ?"Administrador de Tijuana Shop AE" };
            case (#vendedor) { ?"Vendedor verificado en Tijuana" };
            case _ { null };
          };
          zone = zone;
          totalSales = totalSales;
          avgRating = avgRating;
          dateOfBirth = null;
          privacySearchable = true;
          privacyShowHistory = true;
          themePreference = "dark";
          language = "es";
          timezone = "America/Tijuana";
          currency = "MXN";
          notificationsEmail = false;
          notificationsPush = false;
          frequentClients = [];
        };
        users.add(uid, profile);
        count += 1;
      };
    };
    count;
  };
};
