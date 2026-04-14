import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AuditTypes "../types/audit";
import UTypes "../types/users";
import ActivityTypes "../types/activity";
import ActivityLib "../lib/activity";
import AuditLib "../lib/audit";
import UserLib "../lib/users";

mixin (
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
  activityEvents : List.List<ActivityTypes.ActivityEvent>,
  auditLogs : List.List<AuditTypes.AuditLog>,
) {

  public shared ({ caller }) func registerUser(
    name : Text,
    phone : Text,
    email : ?Text,
    avatarUrl : ?Text,
    bio : ?Text,
    zone : ?Text,
    role : UTypes.UserRole,
  ) : async UTypes.UserProfile {
    let profile = UserLib.registerUser(users, principalToId, caller, name, phone, email, avatarUrl, bio, zone, role);
    ignore ActivityLib.addEvent(activityEvents, profile.id, "sesion_iniciada", "Cuenta registrada en Tijuana Shop AE", null);
    profile;
  };

  public shared query ({ caller }) func getMyProfile() : async ?UTypes.UserProfile {
    UserLib.getByPrincipal(users, principalToId, caller);
  };

  public shared ({ caller }) func updateProfile(
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
  ) : async UTypes.UserProfile {
    let profile = UserLib.updateProfile(
      users, principalToId, caller,
      name, email, avatarUrl, bio, zone,
      dateOfBirth, privacySearchable, privacyShowHistory,
      themePreference, language, timezone, currency,
      notificationsEmail, notificationsPush,
    );
    ignore ActivityLib.addEvent(activityEvents, profile.id, "perfil_actualizado", "Perfil actualizado", null);
    profile;
  };

  public shared ({ caller }) func updateSettings(
    settings : UTypes.UserSettings,
  ) : async UTypes.UserProfile {
    let profile = UserLib.updateSettings(users, principalToId, caller, settings);
    ignore ActivityLib.addEvent(activityEvents, profile.id, "configuracion_actualizada", "Configuración de cuenta actualizada", null);
    profile;
  };

  public shared query func getUserById(userId : UTypes.UserId) : async ?UTypes.UserProfile {
    UserLib.getById(users, userId);
  };

  public shared query ({ caller }) func listUsers() : async [UTypes.UserProfile] {
    UserLib.requireAdmin(users, principalToId, caller);
    UserLib.listUsers(users);
  };

  public shared ({ caller }) func updateUserStatus(
    targetId : UTypes.UserId,
    status : UTypes.UserStatus,
  ) : async UTypes.UserProfile {
    UserLib.requireAdmin(users, principalToId, caller);
    let result = UserLib.updateUserStatus(users, targetId, status);
    let admin = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Admin no encontrado") };
    };
    let statusText = switch (status) {
      case (#active) "activo";
      case (#suspended) "suspendido";
      case (#banned) "bloqueado";
    };
    ignore AuditLib.logAction(auditLogs, admin.id, admin.name, "actualizar_estado_usuario",
      "Estado del usuario " # targetId # " cambiado a " # statusText, ?targetId);
    result;
  };

  public shared ({ caller }) func verifyUser(targetId : UTypes.UserId) : async UTypes.UserProfile {
    UserLib.requireAdmin(users, principalToId, caller);
    let result = UserLib.verifyUser(users, targetId);
    let admin = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Admin no encontrado") };
    };
    ignore AuditLib.logAction(auditLogs, admin.id, admin.name, "verificar_usuario",
      "Usuario " # targetId # " verificado", ?targetId);
    result;
  };

  public shared ({ caller }) func deleteUser(targetId : UTypes.UserId) : async () {
    UserLib.requireAdmin(users, principalToId, caller);
    let admin = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Admin no encontrado") };
    };
    UserLib.deleteUser(users, principalToId, targetId);
    ignore AuditLib.logAction(auditLogs, admin.id, admin.name, "eliminar_usuario",
      "Usuario " # targetId # " eliminado del sistema", ?targetId);
  };

  public shared query ({ caller }) func getMyActivity() : async [ActivityTypes.ActivityEvent] {
    let user = switch (UserLib.getByPrincipal(users, principalToId, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Debes registrarte para ver tu actividad") };
    };
    ActivityLib.getMyActivity(activityEvents, user.id);
  };

  public shared query ({ caller }) func getActivityByUser(userId : UTypes.UserId) : async [ActivityTypes.ActivityEvent] {
    UserLib.requireAdmin(users, principalToId, caller);
    ActivityLib.getActivityByUser(activityEvents, userId);
  };
};
