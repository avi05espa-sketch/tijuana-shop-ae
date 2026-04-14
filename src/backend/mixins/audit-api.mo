import List "mo:core/List";
import Map "mo:core/Map";
import AuditTypes "../types/audit";
import UTypes "../types/users";
import AuditLib "../lib/audit";
import UserLib "../lib/users";

mixin (
  auditLogs : List.List<AuditTypes.AuditLog>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  public shared query ({ caller }) func listAuditLogs(
    filters : AuditTypes.AuditFilters,
  ) : async [AuditTypes.AuditLog] {
    UserLib.requireAdmin(users, principalToId, caller);
    AuditLib.listAuditLogs(auditLogs, filters);
  };
};
